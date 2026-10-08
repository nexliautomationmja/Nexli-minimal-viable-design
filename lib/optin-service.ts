// ---------------------------------------------------------------------------
// The opt-in step, shared by the demo funnel and the advisory funnel.
//
// Captures the lead, fires Meta `Lead` (deduped with the browser pixel via
// event_id), pushes the contact into GoHighLevel through both the API (data)
// and the inbound webhook (workflows), then sets the signed cookie so every
// later page knows who the visitor is.
//
// Extracted rather than forked: the two funnels differ only in form_source,
// the tag, the Meta content_name, the webhook env var and where the visitor
// goes next. Everything else — validation, scoring, attribution, the insert,
// the cookie — is identical, and two copies would drift.
// ---------------------------------------------------------------------------
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getDb } from "@/lib/db";
import { leads } from "@/lib/leads-schema";
import { scoreLead } from "@/lib/lead-scoring";
import { sendCAPIEvent } from "@/lib/meta-capi";
import { syncContactToGhl } from "@/lib/ghl-sync";
import { getSiteUrl } from "@/lib/site";
import { DEMO_COOKIE, createDemoToken, demoCookieOptions } from "@/lib/demo-session";

export interface OptInConfig {
  /** Rate-limit bucket, per funnel so one cannot exhaust the other. */
  rateLimitKey: string;
  /** leads.form_source — also how the Stripe webhook finds the lead again. */
  formSource: string;
  ghlSource: string;
  tag: string;
  /** Meta content_name, so the funnels stay separable in Events Manager. */
  contentName: string;
  /** The GHL inbound webhook URL itself, read statically by the caller.
   *  Passed as a value rather than an env var NAME because Next inlines
   *  `process.env.X` at build time in some bundling paths and a dynamic
   *  `process.env[name]` lookup would silently come back undefined. */
  webhookUrl: string | undefined;
  /** Only for the log line when the URL is missing. */
  webhookEnvName: string;
  /** Where this page lives, for the CAPI event_source_url fallback. */
  optInPath: string;
  /** Where the form sends the visitor on success. */
  nextPath: string;
  unavailableMessage: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function handleOptIn(req: NextRequest, cfg: OptInConfig) {
  const ip = getClientIp(req);
  const limit = checkRateLimit(`${cfg.rateLimitKey}:${ip}`, 5, 15 * 60 * 1000);
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
    formSource: cfg.formSource,
  });

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: cfg.unavailableMessage }, { status: 503 });
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
        formSource: cfg.formSource,
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
    console.error("[Opt-In] lead insert failed:", err);
    return NextResponse.json({ error: cfg.unavailableMessage }, { status: 503 });
  }

  if (!leadId) {
    console.error("[Opt-In] insert returned no id");
    return NextResponse.json({ error: cfg.unavailableMessage }, { status: 503 });
  }

  // ---- Meta CAPI Lead (dedupes with the browser pixel via event_id) -------
  if (eventId) {
    sendCAPIEvent({
      event_name: "Lead",
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      action_source: "website",
      event_source_url: attribution.landing_page || `${getSiteUrl()}${cfg.optInPath}`,
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
        content_name: cfg.contentName,
        lead_id: leadId,
        lead_score: scoring.classification,
      },
    }).catch(() => {});
  }

  // A one-click way back into the funnel from an email. Without it the CTA
  // has to point at the opt-in form, which means re-typing an email AND a
  // duplicate lead row on every click, since this route always inserts.
  // Written to the contact AND sent in the webhook, so a later workflow that
  // never saw the webhook can still link them straight back.
  const resumeUrl = `${getSiteUrl()}/api/advisory-pricing/resume?t=${encodeURIComponent(
    await createDemoToken(leadId),
  )}&to=${encodeURIComponent(cfg.nextPath)}`;

  // ---- GHL contact API (writes the data) ----------------------------------
  try {
    const sync = await syncContactToGhl({
      resumeUrl,
      email,
      firstName,
      lastName,
      phone,
      firmName,
      source: cfg.ghlSource,
      tags: [cfg.tag],
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
    console.error("[Opt-In] GHL sync failed:", err);
  }

  // ---- GHL inbound webhook (triggers the workflows) -----------------------
  const ghlUrl = cfg.webhookUrl;
  if (ghlUrl) {
    fetch(ghlUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: cfg.ghlSource,
        tag: cfg.tag,
        lead_id: leadId,
        lead_score: scoring.classification,
        // Use this as the CTA href in the nurture email.
        resume_url: resumeUrl,
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
    console.warn(`[Opt-In] ${cfg.webhookEnvName} is not set; skipping GHL webhook`);
  }

  // ---- Session cookie -----------------------------------------------------
  const res = NextResponse.json({ ok: true, next: cfg.nextPath });
  res.cookies.set(DEMO_COOKIE, await createDemoToken(leadId), demoCookieOptions());
  return res;
}
