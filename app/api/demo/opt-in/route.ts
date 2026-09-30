// ---------------------------------------------------------------------------
// Demo funnel, page 1 → the only place the funnel collects contact details.
//
// Captures the lead, fires Meta `Lead` (deduped with the browser pixel via
// event_id), pushes the contact into GoHighLevel through both the API (data)
// and the inbound webhook (workflows), then sets the signed demo cookie so
// every later page in the funnel knows who the visitor is.
// ---------------------------------------------------------------------------
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getDb } from "@/lib/db";
import { leads } from "@/lib/leads-schema";
import { scoreLead } from "@/lib/lead-scoring";
import { sendCAPIEvent } from "@/lib/meta-capi";
import { syncContactToGhl } from "@/lib/ghl-sync";
import { DEMO_FORM_SOURCE, DEMO_PATH, TAG_DEMO_OPT_IN } from "@/lib/demo-config";
import { DEMO_COOKIE, createDemoToken, demoCookieOptions } from "@/lib/demo-session";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GHL_SOURCE = "Nexli Demo - Opt In";
const UNAVAILABLE = "Guest access is temporarily unavailable. Please try again in a moment.";

function str(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = checkRateLimit(`demo-optin:${ip}`, 5, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // ---- Validation ---------------------------------------------------------
  const firstName = str(body?.firstName, 100);
  const lastName = str(body?.lastName, 100);
  const email = str(body?.email, 200);
  const phone = str(body?.phone, 30);
  const firmName = str(body?.firmName, 200);
  const marketingSmsOptIn = body?.marketingSmsOptIn === true;
  const nonMarketingSmsOptIn = body?.nonMarketingSmsOptIn === true;

  if (!firstName || !lastName) {
    return NextResponse.json({ error: "First and last name are required." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid work email." }, { status: 400 });
  }
  if (phone.replace(/\D/g, "").length < 10) {
    return NextResponse.json(
      { error: "Enter a mobile number with at least 10 digits." },
      { status: 400 }
    );
  }
  if (!firmName) {
    return NextResponse.json({ error: "Enter your firm name." }, { status: 400 });
  }
  if (typeof body?.firmName === "string" && body.firmName.trim().length > 200) {
    return NextResponse.json({ error: "Firm name is too long." }, { status: 400 });
  }

  const eventId = typeof body?.event_id === "string" ? body.event_id.slice(0, 100) : null;
  const attribution =
    body?.attribution && typeof body.attribution === "object" ? body.attribution : {};
  const userAgent = req.headers.get("user-agent") || "";

  // Informational only — nobody is blocked from the demo.
  const scoring = scoreLead({
    email,
    firstName,
    lastName,
    phone,
    formSource: DEMO_FORM_SOURCE,
  });

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: UNAVAILABLE }, { status: 503 });
  }

  // ---- Lead insert --------------------------------------------------------
  let leadId: string | null = null;
  try {
    const [inserted] = await db
      .insert(leads)
      .values({
        email,
        firstName,
        lastName,
        phone,
        firmName,
        leadScore: scoring.classification,
        disqualifyReason: scoring.classification === "disqualified" ? scoring.reason : null,
        formSource: DEMO_FORM_SOURCE,
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
        marketingSmsOptIn,
        nonMarketingSmsOptIn,
      })
      .returning({ id: leads.id });
    leadId = inserted?.id || null;
  } catch (err) {
    console.error("[Demo Opt-In] lead insert failed:", err);
    return NextResponse.json({ error: UNAVAILABLE }, { status: 503 });
  }

  if (!leadId) {
    console.error("[Demo Opt-In] insert returned no id");
    return NextResponse.json({ error: UNAVAILABLE }, { status: 503 });
  }

  // ---- Meta CAPI Lead (dedupes with the browser pixel via event_id) -------
  if (eventId) {
    sendCAPIEvent({
      event_name: "Lead",
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      action_source: "website",
      event_source_url: attribution.landing_page || "https://www.nexli.net/demo-opt-in",
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
        content_name: "Nexli Demo - Guest Access",
        lead_id: leadId,
        lead_score: scoring.classification,
      },
    }).catch(() => {});
  }

  // ---- GHL contact API (writes the data) ----------------------------------
  try {
    const sync = await syncContactToGhl({
      email,
      firstName,
      lastName,
      phone,
      firmName,
      source: GHL_SOURCE,
      tags: [TAG_DEMO_OPT_IN],
      attribution,
      leadScore: scoring.classification,
      noteHeading: "Opted in for demo access",
    });
    if (sync.contactId) {
      await db
        .update(leads)
        .set({ ghlContactId: sync.contactId })
        .where(eq(leads.id, leadId));
    }
  } catch (err) {
    console.error("[Demo Opt-In] GHL sync failed:", err);
  }

  // ---- GHL inbound webhook (triggers the workflows) -----------------------
  const ghlUrl = process.env.GHL_DEMO_OPTIN_WEBHOOK_URL;
  if (ghlUrl) {
    fetch(ghlUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: GHL_SOURCE,
        tag: TAG_DEMO_OPT_IN,
        lead_id: leadId,
        lead_score: scoring.classification,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        firm_name: firmName,
        marketing_sms_opt_in: marketingSmsOptIn,
        non_marketing_sms_opt_in: nonMarketingSmsOptIn,
        utm_source: attribution.utm_source || null,
        utm_medium: attribution.utm_medium || null,
        utm_campaign: attribution.utm_campaign || null,
        utm_term: attribution.utm_term || null,
        utm_content: attribution.utm_content || null,
        fbclid: attribution.fbclid || null,
        landing_page: attribution.landing_page || null,
        referrer: attribution.referrer || null,
        submitted_at: new Date().toISOString(),
      }),
    }).catch(() => {});
  } else {
    console.warn("[Demo Opt-In] GHL_DEMO_OPTIN_WEBHOOK_URL is not set; skipping GHL webhook");
  }

  // ---- Session cookie -----------------------------------------------------
  const res = NextResponse.json({ ok: true, next: DEMO_PATH });
  res.cookies.set(DEMO_COOKIE, await createDemoToken(leadId), demoCookieOptions());
  return res;
}
