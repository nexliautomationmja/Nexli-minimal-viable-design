import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { leads } from "@/lib/leads-schema";
import { sendCAPIEvent } from "@/lib/meta-capi";
import { constructWebhookEvent, isPaidRoadmapSession, type Stripe } from "@/lib/stripe";
import {
  getSiteUrl,
  ROADMAP_PATH,
  ROADMAP_PDF_PATH,
  ROADMAP_PRODUCT_ID,
  ROADMAP_PRODUCT_NAME,
  ROADMAP_THANK_YOU_PATH,
} from "@/lib/roadmap-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = constructWebhookEvent(rawBody, signature);
  } catch (err) {
    console.error("[Stripe Webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Business-logic failures are logged, never surfaced as 5xx — otherwise
  // Stripe retries for days and we risk duplicate downstream side effects.
  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await handlePaidSession(event.data.object as Stripe.Checkout.Session);
        break;
      default:
        break;
    }
  } catch (err) {
    console.error(`[Stripe Webhook] handler error for ${event.type}:`, err);
  }

  return NextResponse.json({ received: true });
}

async function handlePaidSession(session: Stripe.Checkout.Session) {
  if (!isPaidRoadmapSession(session)) return;

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
  const accessUrl = `${site}${ROADMAP_THANK_YOU_PATH}?session_id=${session.id}`;

  let lead: typeof leads.$inferSelect | null = null;
  let ipAddress: string | undefined;
  let userAgent: string | undefined;

  const db = getDb();
  if (db) {
    try {
      // Idempotency: this session already recorded → nothing more to do.
      const [existing] = await db
        .select({ id: leads.id })
        .from(leads)
        .where(eq(leads.stripeCheckoutSessionId, session.id))
        .limit(1);
      if (existing) {
        console.log(`[Stripe Webhook] session ${session.id} already processed`);
        return;
      }

      if (m.lead_id && UUID_RE.test(m.lead_id)) {
        [lead] = await db.select().from(leads).where(eq(leads.id, m.lead_id)).limit(1);
      }
      if (!lead && email) {
        [lead] = await db
          .select()
          .from(leads)
          .where(and(eq(leads.email, email), eq(leads.formSource, "roadmap")))
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
            formSource: "roadmap",
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
        await db
          .update(leads)
          .set({
            roadmapPurchasedAt: new Date(),
            roadmapAmountCents: amountCents,
            stripeCheckoutSessionId: session.id,
            stripePaymentIntentId: paymentIntentId,
            phone: lead.phone || phone || null,
            updatedAt: new Date(),
          })
          .where(eq(leads.id, lead.id));
        ipAddress = lead.ipAddress && lead.ipAddress !== "unknown" ? lead.ipAddress : undefined;
        userAgent = lead.userAgent || undefined;
      }
    } catch (err) {
      // Keep going: the purchase signal and delivery must not depend on the DB.
      console.error("[Stripe Webhook] DB update failed:", err);
    }
  } else {
    console.warn("[Stripe Webhook] DB unavailable — firing CAPI + GHL from metadata only");
  }

  // Server-side Purchase. Same event_id as the thank-you page pixel → dedup.
  await sendCAPIEvent({
    event_name: "Purchase",
    event_time: Math.floor(Date.now() / 1000),
    event_id: purchaseEventId,
    action_source: "website",
    event_source_url: m.landing_page || `${site}${ROADMAP_PATH}`,
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
      content_name: ROADMAP_PRODUCT_NAME,
      content_type: "product",
      content_ids: [ROADMAP_PRODUCT_ID],
      value: amountCents / 100,
      currency,
      num_items: 1,
      order_id: session.id,
    },
  });

  // GHL: tag buyer, deliver the PDF/access email, start the nurture sequence.
  const purchaseWebhook = process.env.GHL_ROADMAP_PURCHASE_WEBHOOK_URL;
  if (!purchaseWebhook) {
    console.warn("[Stripe Webhook] GHL_ROADMAP_PURCHASE_WEBHOOK_URL not set — skipping GHL");
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
        source: "CPA Scaling Roadmap Purchase",
        stage: "purchased",
        tag: "roadmap-buyer",
        product: ROADMAP_PRODUCT_NAME,
        amount: amountCents / 100,
        currency,
        stripe_session_id: session.id,
        stripe_payment_intent_id: paymentIntentId,
        access_url: accessUrl,
        pdf_url: `${site}${ROADMAP_PDF_PATH}`,
        utm_source: m.utm_source || null,
        utm_medium: m.utm_medium || null,
        utm_campaign: m.utm_campaign || null,
        fbclid: m.fbclid || null,
        landing_page: m.landing_page || null,
        purchased_at: new Date().toISOString(),
      }),
    });
    if (!res.ok) {
      console.error("[Stripe Webhook] GHL purchase webhook failed:", res.status);
    }
  } catch (err) {
    console.error("[Stripe Webhook] GHL purchase webhook error:", err);
  }
}
