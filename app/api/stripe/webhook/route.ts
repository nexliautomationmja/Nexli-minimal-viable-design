import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { leads } from "@/lib/leads-schema";
import { sendCAPIEvent } from "@/lib/meta-capi";
import { syncContactToGhl } from "@/lib/ghl-sync";
import {
  TAG_DEMO_OPT_IN,
  TAG_FOUNDATION_CUSTOMER,
  TAG_WEB_PITCH,
} from "@/lib/demo-config";
import {
  constructWebhookEvent,
  getSessionProduct,
  getSubscriptionPeriodEnd,
  isPaidFoundationSession,
  isPaidRoadmapSession,
  retrieveSubscription,
  type Stripe,
} from "@/lib/stripe";
import {
  getSiteUrl,
  ROADMAP_PATH,
  ROADMAP_PDF_PATH,
  ROADMAP_PRODUCT_ID,
  ROADMAP_PRODUCT_NAME,
  ROADMAP_THANK_YOU_PATH,
} from "@/lib/roadmap-config";
import {
  FOUNDATION_CURRENCY,
  FOUNDATION_PATH,
  FOUNDATION_PREVIEW_FORM_SOURCE,
  FOUNDATION_PRICE_VALUE,
  FOUNDATION_PRODUCT_ID,
  FOUNDATION_PRODUCT_NAME,
  FOUNDATION_SETUP_FEE_VALUE,
  FOUNDATION_THANK_YOU_PATH,
} from "@/lib/foundation-config";
import { provisionFoundationCustomer, pushSubscriptionStatus } from "@/lib/foundation-provision";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Provisioning retries (3 attempts x 8s) plus Stripe lookups need more than the default.
export const maxDuration = 60;

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
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        const product = getSessionProduct(session);
        if (product === "foundation") {
          await handleFoundationSession(session);
        } else if (product === "roadmap") {
          await handlePaidSession(session);
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;
      case "invoice.paid":
      case "invoice.payment_failed":
        await handleInvoice(event.data.object as Stripe.Invoice, event.type);
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

// ---------------------------------------------------------------------------
// Firm Foundation ($497/mo subscription)
// ---------------------------------------------------------------------------

async function handleFoundationSession(session: Stripe.Checkout.Session) {
  if (!isPaidFoundationSession(session)) {
    console.log(`[Stripe Webhook] foundation session ${session.id} not paid/complete yet — skipping`);
    return;
  }

  const m = session.metadata || {};
  const email = (m.email || session.customer_details?.email || "").trim().toLowerCase();
  const firstName = m.first_name || session.customer_details?.name?.split(" ")[0] || "";
  const lastName = m.last_name || "";
  const phone = m.phone || session.customer_details?.phone || "";
  const firmName = m.firm_name || "";
  const websiteUrl = m.website_url || "";
  const purchaseEventId = m.purchase_event_id || `pu.${session.id}`;
  // What actually cleared today: the $999 setup fee plus the first month.
  const firstPaymentCents = session.amount_total ?? 0;
  const setupFeeCents = Number(m.setup_fee)
    ? Math.round(Number(m.setup_fee) * 100)
    : FOUNDATION_SETUP_FEE_VALUE * 100;
  const stripeCustomerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
  const stripeSubscriptionId =
    typeof session.subscription === "string" ? session.subscription : session.subscription?.id ?? null;

  const site = getSiteUrl();
  const accessUrl = `${site}${FOUNDATION_THANK_YOU_PATH}?session_id=${session.id}`;

  // Subscription state (status + period end) from Stripe.
  let subscription: Stripe.Subscription | null =
    session.subscription && typeof session.subscription !== "string" ? session.subscription : null;
  if (!subscription && stripeSubscriptionId) {
    subscription = await retrieveSubscription(stripeSubscriptionId).catch((err) => {
      console.error("[Stripe Webhook] retrieveSubscription failed:", err);
      return null;
    });
  }
  const subscriptionStatus = subscription?.status || "active";
  const periodEnd = getSubscriptionPeriodEnd(subscription);

  let lead: typeof leads.$inferSelect | null = null;
  let ipAddress: string | undefined;
  let userAgent: string | undefined;

  const db = getDb();
  if (db) {
    try {
      // Idempotency: already recorded. If provisioning did not finish, only re-run that.
      const [existing] = await db
        .select()
        .from(leads)
        .where(eq(leads.stripeCheckoutSessionId, session.id))
        .limit(1);
      if (existing) {
        if (existing.provisioningStatus !== "ok") {
          console.log(`[Stripe Webhook] session ${session.id} recorded, provisioning ${existing.provisioningStatus} — retrying provisioning`);
          await provisionFoundationCustomer({ lead: existing, session, subscription, source: "stripe-webhook" });
        } else {
          console.log(`[Stripe Webhook] session ${session.id} already processed`);
        }
        return;
      }

      if (m.lead_id && UUID_RE.test(m.lead_id)) {
        [lead] = await db.select().from(leads).where(eq(leads.id, m.lead_id)).limit(1);
      }
      if (!lead && email) {
        [lead] = await db
          .select()
          .from(leads)
          .where(
            and(
              eq(leads.email, email),
              inArray(leads.formSource, [FOUNDATION_PREVIEW_FORM_SOURCE, "foundation"])
            )
          )
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
            firmName: firmName || null,
            websiteUrl: websiteUrl || null,
            leadScore: "raw",
            formSource: "foundation",
            marketingSmsOptIn: m.sms_marketing === "1",
            nonMarketingSmsOptIn: m.sms_nonmarketing === "1",
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
        const patch = {
          foundationSubscribedAt: new Date(),
          stripeCustomerId,
          stripeSubscriptionId,
          subscriptionStatus,
          subscriptionCurrentPeriodEnd: periodEnd,
          stripeCheckoutSessionId: session.id,
          setupFeeCents,
          firstPaymentCents,
          firmName: lead.firmName || firmName || null,
          websiteUrl: lead.websiteUrl || websiteUrl || null,
          phone: lead.phone || phone || null,
          provisioningStatus: "pending",
          updatedAt: new Date(),
        };
        await db.update(leads).set(patch).where(eq(leads.id, lead.id));
        lead = { ...lead, ...patch };
        ipAddress = lead.ipAddress && lead.ipAddress !== "unknown" ? lead.ipAddress : undefined;
        userAgent = lead.userAgent || undefined;
      }
    } catch (err) {
      console.error("[Stripe Webhook] foundation DB update failed:", err);
    }
  } else {
    console.warn("[Stripe Webhook] DB unavailable — firing CAPI + GHL + provisioning from metadata only");
  }

  const userData = {
    em: email || undefined,
    ph: phone || undefined,
    fn: firstName || undefined,
    ln: lastName || undefined,
    fbp: m.fbp || lead?.fbp || undefined,
    fbc: m.fbc || lead?.fbc || undefined,
    client_ip_address: ipAddress,
    client_user_agent: userAgent,
  };
  const sourceUrl = m.landing_page || `${site}${FOUNDATION_PATH}`;
  const now = Math.floor(Date.now() / 1000);

  // Server-side Purchase. Same event_id as the thank-you page pixel → dedup.
  await sendCAPIEvent({
    event_name: "Purchase",
    event_time: now,
    event_id: purchaseEventId,
    action_source: "website",
    event_source_url: sourceUrl,
    user_data: userData,
    custom_data: {
      content_name: FOUNDATION_PRODUCT_NAME,
      content_type: "product",
      content_ids: [FOUNDATION_PRODUCT_ID],
      // The real amount charged today ($1,496), not the monthly price.
      value: firstPaymentCents / 100,
      currency: FOUNDATION_CURRENCY,
      num_items: 1,
      order_id: session.id,
    },
  }).catch(() => {});

  // Subscribe: recurring-revenue signal for Meta optimization.
  await sendCAPIEvent({
    event_name: "Subscribe",
    event_time: now,
    event_id: `sub.${session.id}`,
    action_source: "website",
    event_source_url: sourceUrl,
    user_data: userData,
    custom_data: {
      content_name: FOUNDATION_PRODUCT_NAME,
      content_ids: [FOUNDATION_PRODUCT_ID],
      value: firstPaymentCents / 100,
      currency: FOUNDATION_CURRENCY,
      // Setup fee plus six months of the subscription.
      predicted_ltv: setupFeeCents / 100 + FOUNDATION_PRICE_VALUE * 6,
    },
  }).catch(() => {});

  // GHL: tag customer, start the onboarding sequence.
  const purchaseWebhook = process.env.GHL_FOUNDATION_PURCHASE_WEBHOOK_URL;
  if (purchaseWebhook) {
    try {
      const res = await fetch(purchaseWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          firm_name: firmName,
          website_url: websiteUrl || null,
          source: `${FOUNDATION_PRODUCT_NAME} Purchase`,
          stage: "purchased",
          tag: TAG_FOUNDATION_CUSTOMER,
          product: FOUNDATION_PRODUCT_NAME,
          amount: FOUNDATION_PRICE_VALUE,
          setup_fee: setupFeeCents / 100,
          first_payment: firstPaymentCents / 100,
          currency: FOUNDATION_CURRENCY,
          billing: "monthly",
          marketing_sms_opt_in: m.sms_marketing === "1",
          non_marketing_sms_opt_in: m.sms_nonmarketing === "1",
          stripe_session_id: session.id,
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: stripeSubscriptionId,
          subscription_status: subscriptionStatus,
          subscription_current_period_end: periodEnd ? periodEnd.toISOString() : null,
          access_url: accessUrl,
          utm_source: m.utm_source || null,
          utm_medium: m.utm_medium || null,
          utm_campaign: m.utm_campaign || null,
          utm_term: m.utm_term || null,
          utm_content: m.utm_content || null,
          fbclid: m.fbclid || null,
          landing_page: m.landing_page || null,
          purchased_at: new Date().toISOString(),
        }),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) {
        console.error("[Stripe Webhook] GHL foundation purchase webhook failed:", res.status);
      }
    } catch (err) {
      console.error("[Stripe Webhook] GHL foundation purchase webhook error:", err);
    }
  } else {
    console.warn("[Stripe Webhook] GHL_FOUNDATION_PURCHASE_WEBHOOK_URL not set — skipping GHL");
  }

  // CRM contact: tag the buyer and leave a readable note on the contact.
  if (email) {
    await syncContactToGhl({
      email,
      firstName: firstName || null,
      lastName: lastName || null,
      phone: phone || null,
      firmName: firmName || lead?.firmName || null,
      websiteUrl: websiteUrl || lead?.websiteUrl || null,
      source: `${FOUNDATION_PRODUCT_NAME} Purchase`,
      tags: [TAG_DEMO_OPT_IN, TAG_WEB_PITCH, TAG_FOUNDATION_CUSTOMER],
      funnelPath: "web",
      noteHeading: "Subscribed to Firm Foundation",
      extraNoteLines: [
        `Charged today: $${(firstPaymentCents / 100).toLocaleString("en-US")} (setup $${(setupFeeCents / 100).toLocaleString("en-US")} + first month $${FOUNDATION_PRICE_VALUE})`,
        `Then $${FOUNDATION_PRICE_VALUE}/month, month-to-month.`,
        `Stripe session: ${session.id}`,
      ],
      attribution: {
        utm_source: m.utm_source,
        utm_medium: m.utm_medium,
        utm_campaign: m.utm_campaign,
        fbclid: m.fbclid,
        landing_page: m.landing_page,
      },
    });
  }

  // Provision the portal account (agreement + welcome email are sent by the
  // dashboard).
  await provisionFoundationCustomer({ lead, session, subscription, source: "stripe-webhook" });
}

function isFoundationSubscription(sub: Stripe.Subscription | null | undefined): boolean {
  return sub?.metadata?.product === FOUNDATION_PRODUCT_ID;
}

async function updateLeadSubscription(
  sub: Stripe.Subscription
): Promise<typeof leads.$inferSelect | null> {
  const db = getDb();
  if (!db) return null;
  const periodEnd = getSubscriptionPeriodEnd(sub);
  try {
    const [row] = await db
      .update(leads)
      .set({
        subscriptionStatus: sub.status,
        subscriptionCurrentPeriodEnd: periodEnd,
        updatedAt: new Date(),
      })
      .where(eq(leads.stripeSubscriptionId, sub.id))
      .returning();
    return row ?? null;
  } catch (err) {
    console.error("[Stripe Webhook] subscription lead update failed:", err);
    return null;
  }
}

async function handleSubscriptionChange(sub: Stripe.Subscription) {
  if (!isFoundationSubscription(sub)) return;
  await updateLeadSubscription(sub);
  pushSubscriptionStatus({
    stripeSubscriptionId: sub.id,
    stripeCustomerId: typeof sub.customer === "string" ? sub.customer : sub.customer?.id,
    status: sub.status,
    currentPeriodEnd: getSubscriptionPeriodEnd(sub),
  });
}

async function handleInvoice(
  invoice: Stripe.Invoice,
  type: "invoice.paid" | "invoice.payment_failed"
) {
  const details = invoice.parent?.subscription_details;
  if (!details) return;
  const subId =
    typeof details.subscription === "string" ? details.subscription : details.subscription?.id;
  if (!subId) return;

  // Cheap check from the invoice snapshot; fall back to the live subscription.
  const snapshotProduct = details.metadata?.product;
  if (snapshotProduct && snapshotProduct !== FOUNDATION_PRODUCT_ID) return;

  const sub = await retrieveSubscription(subId).catch((err) => {
    console.error("[Stripe Webhook] retrieveSubscription failed for invoice:", err);
    return null;
  });
  if (!sub || !isFoundationSubscription(sub)) return;

  const lead = await updateLeadSubscription(sub);
  pushSubscriptionStatus({
    stripeSubscriptionId: sub.id,
    stripeCustomerId: typeof sub.customer === "string" ? sub.customer : sub.customer?.id,
    status: sub.status,
    currentPeriodEnd: getSubscriptionPeriodEnd(sub),
  });

  if (type === "invoice.paid" && lead && lead.provisioningStatus !== "ok") {
    if (!lead.stripeCheckoutSessionId) {
      console.warn(`[Stripe Webhook] invoice.paid for ${sub.id}: lead has no checkout session — cannot provision`);
      return;
    }
    // Build a minimal session view for the provisioner from what we have on the lead.
    const pseudoSession = {
      id: lead.stripeCheckoutSessionId,
      metadata: {
        product: FOUNDATION_PRODUCT_ID,
        email: lead.email || "",
        first_name: lead.firstName || "",
        last_name: lead.lastName || "",
        firm_name: lead.firmName || "",
        phone: lead.phone || "",
      },
      customer: typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null,
      subscription: sub.id,
      customer_details: null,
    } as unknown as Stripe.Checkout.Session;
    await provisionFoundationCustomer({ lead, session: pseudoSession, subscription: sub, source: "invoice-paid" });
  }
}
