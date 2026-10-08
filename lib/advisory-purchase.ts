/**
 * The one place a $297 Book of Business Accelerator purchase is recorded.
 *
 * Called from two places, deliberately doing the *whole* job in both:
 *   1. the Stripe webhook — the normal path;
 *   2. the thank-you page — a safety net, because Stripe's browser redirect
 *      regularly beats the webhook. Without it the buyer lands on thank-you,
 *      clicks through to the qualifier, and is bounced back to the page they
 *      just bought from.
 *
 * It has to be the whole job rather than just the entitlement stamp. If the
 * page only set advisory_purchased_at, the webhook's claim would later find
 * the row already stamped, return early, and the buyer would never get the
 * delivery email. Whichever caller wins the claim does everything; the other
 * is a clean no-op.
 */
import { and, desc, eq, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { leads } from "@/lib/leads-schema";
import { sendCAPIEvent } from "@/lib/meta-capi";
import { syncContactToGhl } from "@/lib/ghl-sync";
import { isPaidAdvisorySession, type Stripe } from "@/lib/stripe";
import {
  ADVISORY_FORM_SOURCE,
  ADVISORY_OFFER_PATH,
  ADVISORY_PRODUCT_ID,
  ADVISORY_PRODUCT_NAME,
  ADVISORY_THANK_YOU_PATH,
  getSiteUrl,
  TAG_ADVISORY_BUYER,
  TAG_ADVISORY_OPT_IN,
} from "@/lib/advisory-config";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function recordAdvisoryPurchase(session: Stripe.Checkout.Session): Promise<void> {
  if (!isPaidAdvisorySession(session)) return;

  const m = session.metadata || {};
  const email = (m.email || session.customer_details?.email || "").trim().toLowerCase();
  const firstName = m.first_name || "";
  const lastName = m.last_name || "";
  const phone = m.phone || session.customer_details?.phone || "";
  const amountCents = session.amount_total ?? 0;
  const currency = (session.currency || "usd").toUpperCase();
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;
  const purchaseEventId = m.purchase_event_id || `pu.${session.id}`;

  const site = getSiteUrl();
  // A live page, and one that works without a cookie: the GHL delivery email
  // is routinely opened on a different device, and the thank-you page mints a
  // session from this id. The retired roadmap funnel pointed access_url at a
  // path next.config.ts had since 301'd to the opt-in form, so every buyer was
  // sent to a signup page. Never add an ADVISORY_* path to redirects().
  const accessUrl = `${site}${ADVISORY_THANK_YOU_PATH}?session_id=${session.id}`;

  let lead: typeof leads.$inferSelect | null = null;
  let ipAddress: string | undefined;
  let userAgent: string | undefined;
  // Set only when another delivery of this same event already did the work.
  // Checked *outside* the try/catch below: the old code swallowed the unique
  // index violation and carried on into the CAPI send and the delivery email,
  // so a Stripe retry produced a duplicate Purchase and a second email.
  let alreadyProcessed = false;

  const db = getDb();
  if (db) {
    try {
      if (m.lead_id && UUID_RE.test(m.lead_id)) {
        [lead] = await db.select().from(leads).where(eq(leads.id, m.lead_id)).limit(1);
      }
      if (!lead && email) {
        [lead] = await db
          .select()
          .from(leads)
          .where(and(eq(leads.email, email), eq(leads.formSource, ADVISORY_FORM_SOURCE)))
          .orderBy(desc(leads.createdAt))
          .limit(1);
      }
      if (!lead && email) {
        [lead] = await db
          .insert(leads)
          .values({
            email,
            firstName: firstName || null,
            lastName: lastName || null,
            phone: phone || null,
            leadScore: "raw",
            formSource: ADVISORY_FORM_SOURCE,
            fbclid: m.fbclid || null,
            fbp: m.fbp || null,
            fbc: m.fbc || null,
            utmSource: m.utm_source || null,
            utmMedium: m.utm_medium || null,
            utmCampaign: m.utm_campaign || null,
            utmTerm: m.utm_term || null,
            utmContent: m.utm_content || null,
            landingPage: m.landing_page || null,
            referrer: m.referrer || null,
          })
          .returning();
      }

      if (lead) {
        // Atomic claim. Only the first delivery for this lead gets a row back,
        // so the CAPI event and the delivery email below fire exactly once.
        const [claimed] = await db
          .update(leads)
          .set({
            advisoryPurchasedAt: new Date(),
            advisoryAmountCents: amountCents,
            stripeCheckoutSessionId: session.id,
            stripePaymentIntentId: paymentIntentId,
            phone: lead.phone || phone || null,
            updatedAt: new Date(),
          })
          .where(and(eq(leads.id, lead.id), isNull(leads.advisoryPurchasedAt)))
          .returning();

        if (!claimed) {
          console.log(`[Stripe Webhook] advisory session ${session.id} already processed`);
          alreadyProcessed = true;
        } else {
          lead = claimed;
          ipAddress = lead.ipAddress && lead.ipAddress !== "unknown" ? lead.ipAddress : undefined;
          userAgent = lead.userAgent || undefined;
        }
      }
    } catch (err) {
      // Keep going: the purchase signal and delivery must not depend on the DB.
      console.error("[Stripe Webhook] advisory DB update failed:", err);
    }
  } else {
    console.warn("[Stripe Webhook] DB unavailable — firing CAPI + GHL from metadata only");
  }

  if (alreadyProcessed) return;

  // Server-side Purchase. Same event_id as the thank-you page pixel → dedup.
  await sendCAPIEvent({
    event_name: "Purchase",
    event_time: Math.floor(Date.now() / 1000),
    event_id: purchaseEventId,
    action_source: "website",
    event_source_url: m.landing_page || `${site}${ADVISORY_OFFER_PATH}`,
    user_data: {
      em: email || undefined,
      ph: phone || undefined,
      fn: firstName || undefined,
      ln: lastName || undefined,
      fbp: m.fbp || lead?.fbp || undefined,
      fbc: m.fbc || lead?.fbc || undefined,
      client_ip_address: ipAddress,
      client_user_agent: userAgent,
    },
    custom_data: {
      content_name: ADVISORY_PRODUCT_NAME,
      content_type: "product",
      content_ids: [ADVISORY_PRODUCT_ID],
      value: amountCents / 100,
      currency,
      num_items: 1,
      order_id: session.id,
    },
  });

  // Write the buyer tag onto the contact record itself. The inbound webhook
  // below triggers a workflow but does not set contact fields, so the retired
  // roadmap branch — which fired only the webhook — never tagged anyone.
  if (email) {
    const sync = await syncContactToGhl({
      email,
      firstName: lead?.firstName || firstName,
      lastName: lead?.lastName || lastName,
      phone: lead?.phone || phone,
      firmName: lead?.firmName,
      source: `${ADVISORY_PRODUCT_NAME} Purchase`,
      tags: [TAG_ADVISORY_BUYER],
      // "advisory opt-in" means opted in and HAS NOT bought. They just did,
      // so it comes off — otherwise they stay in the pre-purchase nurture and
      // get chased to buy something they already own.
      removeTags: [TAG_ADVISORY_OPT_IN],
      noteHeading: `Bought the ${ADVISORY_PRODUCT_NAME} ($${amountCents / 100})`,
    });
    if (db && sync.contactId && lead && !lead.ghlContactId) {
      try {
        await db
          .update(leads)
          .set({ ghlContactId: sync.contactId, updatedAt: new Date() })
          .where(eq(leads.id, lead.id));
      } catch (err) {
        console.error("[Stripe Webhook] advisory ghlContactId persist failed:", err);
      }
    }
  }

  // GHL workflow: email the download link and start the nurture.
  const purchaseWebhook = process.env.GHL_ADVISORY_PURCHASE_WEBHOOK_URL;
  if (!purchaseWebhook) {
    // error, not warn: without this the buyer pays and never receives anything.
    console.error(
      `[Stripe Webhook] GHL_ADVISORY_PURCHASE_WEBHOOK_URL not set — no delivery email for ${session.id}`
    );
    return;
  }

  try {
    const res = await fetch(purchaseWebhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        phone,
        firm_name: lead?.firmName || null,
        source: `${ADVISORY_PRODUCT_NAME} Purchase`,
        stage: "purchased",
        tag: TAG_ADVISORY_BUYER,
        product: ADVISORY_PRODUCT_NAME,
        amount: amountCents / 100,
        currency,
        stripe_session_id: session.id,
        stripe_payment_intent_id: paymentIntentId,
        // A backup link, not the delivery mechanism. The PDF is emailed as an
        // attachment by the GoHighLevel workflow itself — nothing here needs
        // to carry the file. This points at the thank-you page, which mints a
        // session from the Stripe id and so works on a device that has never
        // visited us: useful as a "can'''t find the attachment?" fallback, and
        // for corporate filters that strip attachments outright.
        access_url: accessUrl,
        utm_source: m.utm_source || null,
        utm_medium: m.utm_medium || null,
        utm_campaign: m.utm_campaign || null,
        fbclid: m.fbclid || null,
        landing_page: m.landing_page || null,
        purchased_at: new Date().toISOString(),
      }),
    });
    if (!res.ok) {
      console.error("[Stripe Webhook] GHL advisory purchase webhook failed:", res.status);
    }
  } catch (err) {
    console.error("[Stripe Webhook] GHL advisory purchase webhook error:", err);
  }
}
