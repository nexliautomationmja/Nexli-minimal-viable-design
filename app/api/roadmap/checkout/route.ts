import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getDb } from "@/lib/db";
import { leads } from "@/lib/leads-schema";
import { scoreLead } from "@/lib/lead-scoring";
import { sendCAPIEvent } from "@/lib/meta-capi";
import { createRoadmapCheckoutSession } from "@/lib/stripe";
import {
  getSiteUrl,
  ROADMAP_CURRENCY,
  ROADMAP_PATH,
  ROADMAP_PRICE_VALUE,
  ROADMAP_PRODUCT_ID,
  ROADMAP_PRODUCT_NAME,
} from "@/lib/roadmap-config";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = checkRateLimit(`roadmap-checkout:${ip}`, 5, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();

    const firstName =
      typeof body.firstName === "string" ? body.firstName.trim().slice(0, 100) : "";
    const lastName =
      typeof body.lastName === "string" ? body.lastName.trim().slice(0, 100) : "";
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 200) : "";
    const phone =
      typeof body.phone === "string" ? body.phone.trim().slice(0, 30) : "";
    const eventId =
      typeof body.event_id === "string" ? body.event_id.slice(0, 100) : null;

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "First name, last name, and email are required." },
        { status: 400 }
      );
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    }

    const attribution = (body.attribution && typeof body.attribution === "object")
      ? body.attribution
      : {};
    const userAgent = req.headers.get("user-agent") || "";

    const scoring = scoreLead({ email, firstName, lastName, formSource: "roadmap" });

    // Insert the lead first so the Stripe session can carry its id.
    let leadId: string | null = null;
    const db = getDb();
    if (db) {
      try {
        const [row] = await db
          .insert(leads)
          .values({
            email,
            firstName,
            lastName,
            phone: phone || null,
            leadScore: scoring.classification,
            disqualifyReason:
              scoring.classification === "disqualified" ? scoring.reason : null,
            formSource: "roadmap",
            fbclid: attribution.fbclid || null,
            fbp: attribution.fbp || null,
            fbc: attribution.fbc || null,
            utmSource: attribution.utm_source || null,
            utmMedium: attribution.utm_medium || null,
            utmCampaign: attribution.utm_campaign || null,
            utmTerm: attribution.utm_term || null,
            utmContent: attribution.utm_content || null,
            landingPage: attribution.landing_page || null,
            referrer: attribution.referrer || null,
            metaEventId: eventId,
            ipAddress: ip,
            userAgent,
          })
          .returning({ id: leads.id });
        leadId = row?.id ?? null;
      } catch (err) {
        console.error("[Roadmap Checkout] DB insert failed:", err);
      }
    }

    // Pre-generate the Purchase event id. It rides in Stripe metadata so the
    // webhook (server CAPI) and the thank-you page (browser pixel) dedupe.
    const purchaseEventId = `pu.${randomUUID()}`;

    const sourceUrl = attribution.landing_page || `${getSiteUrl()}${ROADMAP_PATH}`;

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
          ln: lastName,
          fbp: attribution.fbp || undefined,
          fbc: attribution.fbc || undefined,
          client_ip_address: ip !== "unknown" ? ip : undefined,
          client_user_agent: userAgent || undefined,
        },
        custom_data: {
          content_name: ROADMAP_PRODUCT_NAME,
          content_type: "product",
          content_ids: [ROADMAP_PRODUCT_ID],
          value: ROADMAP_PRICE_VALUE,
          currency: ROADMAP_CURRENCY,
        },
      }).catch(() => {});
    }

    // Optional abandoned-checkout workflow in GHL (fire and forget).
    const checkoutWebhook = process.env.GHL_ROADMAP_CHECKOUT_WEBHOOK_URL;
    if (checkoutWebhook) {
      fetch(checkoutWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          source: "CPA Scaling Roadmap - Checkout Started",
          stage: "checkout_started",
          utm_source: attribution.utm_source || null,
          utm_medium: attribution.utm_medium || null,
          utm_campaign: attribution.utm_campaign || null,
          fbclid: attribution.fbclid || null,
          landing_page: attribution.landing_page || null,
        }),
      }).catch(() => {});
    }

    let checkoutUrl: string;
    try {
      const session = await createRoadmapCheckoutSession({
        leadId,
        email,
        firstName,
        lastName,
        phone,
        purchaseEventId,
        attribution,
      });
      checkoutUrl = session.checkoutUrl;
    } catch (err) {
      console.error("[Roadmap Checkout] Stripe session failed:", err);
      return NextResponse.json(
        { error: "Could not start checkout. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, checkoutUrl });
  } catch (error) {
    console.error("[Roadmap Checkout] error:", error);
    return NextResponse.json({ error: "Submission failed." }, { status: 500 });
  }
}
