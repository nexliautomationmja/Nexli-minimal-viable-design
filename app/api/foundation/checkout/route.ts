import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendCAPIEvent } from "@/lib/meta-capi";
import { createFoundationCheckoutSession } from "@/lib/stripe";
import { getDb } from "@/lib/db";
import { leads } from "@/lib/leads-schema";
import { readDemoLead } from "@/lib/demo-session";
import { DEMO_OFFER_PATH } from "@/lib/demo-config";
import {
  getSiteUrl,
  FOUNDATION_CURRENCY,
  FOUNDATION_FIRST_PAYMENT_VALUE,
  FOUNDATION_PRODUCT_ID,
  FOUNDATION_PRODUCT_NAME,
} from "@/lib/foundation-config";

export const runtime = "nodejs";

/**
 * Starts the Firm Foundation subscription checkout from page 4B of the demo
 * funnel (/demo/offer).
 *
 * Auth is the signed demo lead cookie set at /demo-opt-in — the visitor's
 * name, email, phone, firm and attribution already live on that `leads` row,
 * so nothing is re-typed and nothing is trusted from the request body.
 *
 * Body: { event_id?: string }  (the browser's InitiateCheckout event id)
 * Response: { ok: true, checkoutUrl } → redirect the browser to Stripe.
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = checkRateLimit(`foundation-checkout:${ip}`, 5, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const eventId = typeof body?.event_id === "string" ? body.event_id.slice(0, 100) : null;

    const leadId = await readDemoLead();
    if (!leadId) {
      return NextResponse.json(
        { error: "Your session has expired. Please start again." },
        { status: 401 }
      );
    }

    const db = getDb();
    const [lead] = db
      ? await db.select().from(leads).where(eq(leads.id, leadId)).limit(1)
      : [];

    const email = (lead?.email || "").trim().toLowerCase();
    const firstName = (lead?.firstName || "").trim();
    if (!lead || !email || !firstName) {
      return NextResponse.json(
        { error: "We could not find your contact details. Please start again." },
        { status: 400 }
      );
    }

    const lastName = (lead.lastName || "").trim();
    const phone = lead.phone || "";
    const firmName = lead.firmName || "";
    const websiteUrl = lead.websiteUrl || null;
    const marketingSmsOptIn = lead.marketingSmsOptIn === true;
    const nonMarketingSmsOptIn = lead.nonMarketingSmsOptIn === true;
    const attribution = {
      fbclid: lead.fbclid,
      fbp: lead.fbp,
      fbc: lead.fbc,
      utm_source: lead.utmSource,
      utm_medium: lead.utmMedium,
      utm_campaign: lead.utmCampaign,
      utm_term: lead.utmTerm,
      utm_content: lead.utmContent,
      landing_page: lead.landingPage,
      referrer: lead.referrer,
    };
    const userAgent = req.headers.get("user-agent") || "";

    // Pre-generated Purchase event id rides in Stripe metadata so the webhook
    // (server CAPI) and the thank-you page (browser pixel) dedupe.
    const purchaseEventId = `pu.${randomUUID()}`;
    const sourceUrl = `${getSiteUrl()}${DEMO_OFFER_PATH}`;

    if (eventId) {
      sendCAPIEvent({
        event_name: "InitiateCheckout",
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: "website",
        event_source_url: sourceUrl,
        user_data: {
          em: email,
          ph: phone || undefined,
          fn: firstName,
          ln: lastName || undefined,
          fbp: lead.fbp || undefined,
          fbc: lead.fbc || undefined,
          client_ip_address: ip !== "unknown" ? ip : undefined,
          client_user_agent: userAgent || undefined,
        },
        custom_data: {
          content_name: FOUNDATION_PRODUCT_NAME,
          content_type: "product",
          content_ids: [FOUNDATION_PRODUCT_ID],
          // What actually gets charged today: setup fee + first month.
          value: FOUNDATION_FIRST_PAYMENT_VALUE,
          currency: FOUNDATION_CURRENCY,
        },
      }).catch(() => {});
    }

    // Abandoned-checkout workflow in GHL (fire and forget).
    const checkoutWebhook = process.env.GHL_FOUNDATION_CHECKOUT_WEBHOOK_URL;
    if (checkoutWebhook) {
      fetch(checkoutWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          firm_name: firmName,
          website_url: websiteUrl,
          offer_url: sourceUrl,
          source: `${FOUNDATION_PRODUCT_NAME} - Checkout Started`,
          stage: "checkout_started",
          product: FOUNDATION_PRODUCT_NAME,
          first_payment: FOUNDATION_FIRST_PAYMENT_VALUE,
          marketing_sms_opt_in: marketingSmsOptIn,
          non_marketing_sms_opt_in: nonMarketingSmsOptIn,
          utm_source: lead.utmSource || null,
          utm_medium: lead.utmMedium || null,
          utm_campaign: lead.utmCampaign || null,
          fbclid: lead.fbclid || null,
          landing_page: lead.landingPage || null,
          lead_id: lead.id,
          submitted_at: new Date().toISOString(),
        }),
      }).catch(() => {});
    } else {
      console.warn("[Foundation Checkout] GHL_FOUNDATION_CHECKOUT_WEBHOOK_URL not set — skipping GHL");
    }

    let checkoutUrl: string;
    try {
      const session = await createFoundationCheckoutSession({
        leadId: lead.id,
        email,
        firstName,
        lastName,
        phone,
        firmName,
        websiteUrl,
        marketingSmsOptIn,
        nonMarketingSmsOptIn,
        purchaseEventId,
        attribution,
      });
      checkoutUrl = session.checkoutUrl;
    } catch (err) {
      console.error("[Foundation Checkout] Stripe session failed:", err);
      return NextResponse.json(
        { error: "Could not start checkout. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, checkoutUrl });
  } catch (error) {
    console.error("[Foundation Checkout] error:", error);
    return NextResponse.json({ error: "Submission failed." }, { status: 500 });
  }
}
