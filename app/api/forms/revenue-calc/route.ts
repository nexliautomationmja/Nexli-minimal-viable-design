import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getDb } from "@/lib/db";
import { leads } from "@/lib/leads-schema";
import { scoreLead } from "@/lib/lead-scoring";
import { sendCAPIEvent } from "@/lib/meta-capi";

const GHL_WEBHOOK_URL =
  process.env.GHL_REVENUE_CALC_WEBHOOK_URL ||
  "https://services.leadconnectorhq.com/hooks/yamjttuJWWdstfF9N0zu/webhook-trigger/c08fe1c0-c919-413f-a4c6-54d70232c07f";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = checkRateLimit(`form-revenue-calc:${ip}`, 5, 15 * 60 * 1000);
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
    const email =
      typeof body.email === "string" ? body.email.trim().slice(0, 200) : "";
    const eventId =
      typeof body.event_id === "string" ? body.event_id : null;

    if (!firstName || !email) {
      return NextResponse.json(
        { error: "Name and email are required." },
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

    // Score the lead (revenue-calc leads are typically 'raw')
    const scoring = scoreLead({
      email,
      firstName,
      formSource: "revenue-calc",
    });

    // Insert into leads table
    const db = getDb();
    if (db) {
      try {
        await db.insert(leads).values({
          email,
          firstName,
          leadScore: scoring.classification,
          disqualifyReason:
            scoring.classification === "disqualified" ? scoring.reason : null,
          formSource: "revenue-calc",
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
        });
      } catch {
        console.error("[Revenue Calc] DB insert failed");
      }
    }

    // Forward to GHL webhook (include calculator metrics + attribution)
    const ghlPayload: Record<string, unknown> = {
      firstName,
      email,
      source: "Growth Ceiling Calculator",
      utm_source: attribution.utm_source || null,
      utm_medium: attribution.utm_medium || null,
      utm_campaign: attribution.utm_campaign || null,
      fbclid: attribution.fbclid || null,
      landing_page: attribution.landing_page || null,
    };

    // Forward any calculator metrics from the body
    const metricKeys = [
      "annual_admin_cost",
      "five_year_loss",
      "review_gap",
      "target_reviews",
      "discovery_calls_lost",
      "client_retention_risk",
      "retention_grade",
      "missed_advisory_revenue",
      "total_opportunity",
    ];
    for (const key of metricKeys) {
      if (body[key] !== undefined) ghlPayload[key] = body[key];
    }

    fetch(GHL_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ghlPayload),
    }).catch(() => {});

    // Fire CAPI Lead event (deduplicates with browser pixel)
    if (eventId) {
      sendCAPIEvent({
        event_name: "Lead",
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: "website",
        event_source_url: attribution.landing_page || "https://www.nexli.net/revenuecalc",
        user_data: {
          em: email,
          fn: firstName,
          fbp: attribution.fbp || undefined,
          fbc: attribution.fbc || undefined,
          client_ip_address: ip !== "unknown" ? ip : undefined,
          client_user_agent: userAgent || undefined,
        },
        custom_data: {
          content_name: "Growth Ceiling Calculator",
          lead_score: scoring.classification,
        },
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Revenue Calc] Route error");
    return NextResponse.json(
      { error: "Submission failed." },
      { status: 500 }
    );
  }
}
