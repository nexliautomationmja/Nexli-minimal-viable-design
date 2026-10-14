import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendCAPIEvent } from "@/lib/meta-capi";
import { createAdvisoryCheckoutSession } from "@/lib/stripe";
import { getDb } from "@/lib/db";
import { leads } from "@/lib/leads-schema";
import { createDemoToken, readDemoLead } from "@/lib/demo-session";
import {
  ADVISORY_CURRENCY,
  ADVISORY_OFFER_PATH,
  ADVISORY_PRICE_VALUE,
  ADVISORY_PRODUCT_ID,
  ADVISORY_PRODUCT_NAME,
  ADVISORY_THANK_YOU_PATH,
  getSiteUrl,
} from "@/lib/advisory-config";

export const runtime = "nodejs";

/**
 * Starts the $97 one-time checkout from /advisory-pricing/BOBA.
 *
 * Auth is the signed lead cookie set at the opt-in. The visitor's name,
 * email, phone, firm and attribution already live on that `leads` row, so
 * nothing is re-typed and nothing is trusted from the request body except
 * the browser's InitiateCheckout event id.
 *
 * Deliberately NOT modelled on the retired roadmap checkout, which was an
 * open endpoint that inserted a lead straight from an arbitrary body.
 *
 * Body: { event_id?: string }
 * Response: { ok: true, checkoutUrl } → send the browser to Stripe.
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = checkRateLimit(`advisory-checkout:${ip}`, 5, 15 * 60 * 1000);
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

    // Already bought it — don't let a stale tab charge them twice.
    if (lead.advisoryPurchasedAt) {
      return NextResponse.json({ ok: true, checkoutUrl: ADVISORY_THANK_YOU_PATH });
    }

    const lastName = (lead.lastName || "").trim();
    const phone = lead.phone || "";
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
    // (server CAPI) and the thank-you page (browser pixel) dedupe on one id.
    const purchaseEventId = `pu.${randomUUID()}`;
    const sourceUrl = `${getSiteUrl()}${ADVISORY_OFFER_PATH}`;

    /**
     * One click back to the offer, for the abandoned-cart email.
     *
     * Points at the BOBA page rather than straight at Stripe: a checkout
     * session is single-use and expires, so a link to the old one would be
     * dead by the time the email goes out. The offer page opens a fresh
     * session on click.
     *
     * Also sets the session cookie, which this page needs — it is gated on
     * the lead cookie, so a plain link opened on a phone would bounce them
     * out of the funnel instead of back into it. That is the whole reason
     * this is a resume URL and not just a URL.
     */
    const resumeUrl = `${getSiteUrl()}/api/advisory-pricing/resume?t=${encodeURIComponent(
      await createDemoToken(lead.id),
    )}&to=${encodeURIComponent(ADVISORY_OFFER_PATH)}`;

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
          content_name: ADVISORY_PRODUCT_NAME,
          content_type: "product",
          content_ids: [ADVISORY_PRODUCT_ID],
          value: ADVISORY_PRICE_VALUE,
          currency: ADVISORY_CURRENCY,
        },
      }).catch(() => {});
    }

    // Abandoned-checkout workflow in GHL (fire and forget).
    const checkoutWebhook = process.env.GHL_ADVISORY_CHECKOUT_WEBHOOK_URL;
    if (checkoutWebhook) {
      fetch(checkoutWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          firm_name: lead.firmName || null,
          offer_url: sourceUrl,
          resume_url: resumeUrl,
          source: `${ADVISORY_PRODUCT_NAME} - Checkout Started`,
          stage: "checkout_started",
          product: ADVISORY_PRODUCT_NAME,
          amount: ADVISORY_PRICE_VALUE,
          utm_source: lead.utmSource || null,
          utm_medium: lead.utmMedium || null,
          utm_campaign: lead.utmCampaign || null,
          fbclid: lead.fbclid || null,
          landing_page: lead.landingPage || null,
          lead_id: lead.id,
          submitted_at: new Date().toISOString(),
        }),
      }).catch(() => {});
    }

    let checkoutUrl: string;
    try {
      const session = await createAdvisoryCheckoutSession({
        leadId: lead.id,
        email,
        firstName,
        lastName,
        phone,
        purchaseEventId,
        attribution,
      });
      checkoutUrl = session.checkoutUrl;
    } catch (err) {
      // Most likely STRIPE_ADVISORY_PRICE_ID is unset — it throws by name
      // rather than falling back to a cheaper price.
      console.error("[Advisory Checkout] Stripe session failed:", err);
      return NextResponse.json(
        { error: "Could not start checkout. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, checkoutUrl });
  } catch (error) {
    console.error("[Advisory Checkout] error:", error);
    return NextResponse.json({ error: "Submission failed." }, { status: 500 });
  }
}
