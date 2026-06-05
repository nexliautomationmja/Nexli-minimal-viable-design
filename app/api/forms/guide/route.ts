import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getDb } from "@/lib/db";
import { leads } from "@/lib/leads-schema";
import { scoreLead } from "@/lib/lead-scoring";
import { sendCAPIEvent } from "@/lib/meta-capi";

const GHL_WEBHOOK_URL =
  process.env.GHL_GUIDE_WEBHOOK_URL ||
  "https://services.leadconnectorhq.com/hooks/yamjttuJWWdstfF9N0zu/webhook-trigger/c82aa21f-f433-4ccf-a379-bbab2bdf965d";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = checkRateLimit(`form-guide:${ip}`, 5, 15 * 60 * 1000);
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
      typeof body.email === "string" ? body.email.trim().slice(0, 200) : "";
    const phone =
      typeof body.phone === "string" ? body.phone.trim().slice(0, 30) : "";
    const eventId =
      typeof body.event_id === "string" ? body.event_id : null;

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "First name, last name, and email are required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    }

    // Attribution data from client
    const attribution = body.attribution || {};
    const userAgent = req.headers.get("user-agent") || "";

    // Score the lead (guide downloads are typically 'raw')
    const scoring = scoreLead({
      email,
      firstName,
      lastName,
      formSource: "free-guide",
    });

    // Send to GHL webhook
    const res = await fetch(GHL_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        phone,
        marketingSmsOptIn: !!body.marketingSmsOptIn,
        nonMarketingSmsOptIn: !!body.nonMarketingSmsOptIn,
        source: "Free Guide Landing Page",
        guideTitle: "The 5 Automations Every Advisory Firm Needs",
        // Attribution for GHL
        utm_source: attribution.utm_source || null,
        utm_medium: attribution.utm_medium || null,
        utm_campaign: attribution.utm_campaign || null,
        fbclid: attribution.fbclid || null,
        landing_page: attribution.landing_page || null,
      }),
    });

    if (!res.ok) {
      console.error("GHL guide webhook failed:", res.status);
      return NextResponse.json(
        { error: "Submission failed." },
        { status: 502 }
      );
    }

    // Insert into leads table (non-blocking)
    const db = getDb();
    if (db) {
      db.insert(leads)
        .values({
          email,
          firstName,
          lastName,
          phone,
          leadScore: scoring.classification,
          disqualifyReason:
            scoring.classification === "disqualified" ? scoring.reason : null,
          formSource: "free-guide",
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
          marketingSmsOptIn: !!body.marketingSmsOptIn,
          nonMarketingSmsOptIn: !!body.nonMarketingSmsOptIn,
        })
        .catch(() => {
          console.error("[Guide] DB insert failed");
        });
    }

    // Fire CAPI Lead event (deduplicates with browser pixel via event_id)
    if (eventId) {
      sendCAPIEvent({
        event_name: "Lead",
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: "website",
        event_source_url: attribution.landing_page || "https://www.nexli.net/free-guide",
        user_data: {
          em: email,
          ph: phone || undefined,
          fn: firstName || undefined,
          ln: lastName || undefined,
          fbp: attribution.fbp || undefined,
          fbc: attribution.fbc || undefined,
          client_ip_address: ip !== "unknown" ? ip : undefined,
          client_user_agent: userAgent || undefined,
        },
        custom_data: {
          content_name: "Free Guide - 5 Automations",
          lead_score: scoring.classification,
        },
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Guide form error:", error);
    return NextResponse.json(
      { error: "Submission failed." },
      { status: 500 }
    );
  }
}
