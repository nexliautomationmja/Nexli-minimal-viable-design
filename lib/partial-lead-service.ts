// ---------------------------------------------------------------------------
// Partial lead capture — the contact step, banked before the last question.
//
// WHY THIS EXISTS. The advisory qualifier is six steps and the contact form
// is step FIVE:
//
//   usBased -> decisionRole -> annualRevenue -> goal -> CONTACT -> budget
//
// QualifyFlow POSTs exactly once, when the last step completes. So a firm
// that typed their name, email and phone and then closed the tab on the
// budget question produced nothing: no lead row, no GoHighLevel contact,
// no webhook, no Meta Lead event. Five answers and a working phone number,
// and we never learned they existed. There was no flow anyone could build
// in GHL to catch them, because GHL was never told.
//
// This route is called the moment the contact step is submitted, and banks
// what we have. The full submit then lands on the SAME row — both go
// through upsertLeadByEmail, matching on email — so completing the
// qualifier updates rather than duplicating.
//
// IT IS FIRE AND FORGET FROM THE BROWSER. The visitor is already looking
// at the budget question by the time this resolves. It must never block a
// step, never show an error, and never change what the UI does: a failure
// here leaves us exactly where we were before the route existed.
//
// DELIBERATELY NOT recordQualification. That function decides the funnel
// path, scores the lead, fires two Meta events and returns a `next` route.
// None of that is knowable yet — the deciding answer is the one they have
// not given. Threading a `partial` flag through it would put a branch on
// the main conversion path for the sake of a side road.
//
// NO META EVENTS HERE. CompleteRegistration and Lead both fire from
// QualifyFlow on completion. Firing Lead here as well would double-count
// every conversion in Ads Manager and teach the algorithm to optimise for
// people who abandon.
// ---------------------------------------------------------------------------
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getDb } from "@/lib/db";
import { upsertLeadByEmail } from "@/lib/lead-upsert";
import { syncContactToGhl } from "@/lib/ghl-sync";
import { DEMO_COOKIE, createDemoToken, demoCookieOptions } from "@/lib/demo-session";
import { trimTo, validateContact, MAX_NAME, MAX_FIRM } from "@/lib/contact-validation";
import { SITE_URL } from "@/lib/site";
import {
  ADVISORY_FORM_SOURCE,
  ADVISORY_PRODUCT_NAME,
  ADVISORY_QUALIFY_PATH,
  TAG_ADVISORY_INCOMPLETE,
} from "@/lib/advisory-config";

export interface PartialLeadConfig {
  rateLimitKey: string;
  formSource: string;
  ghlSource: string;
  webhookUrl: string | undefined;
  webhookEnvName: string;
  webhookSource: string;
  /** Where a resume link should drop them. */
  resumePath: string;
}

export const ADVISORY_PARTIAL_CONFIG: PartialLeadConfig = {
  rateLimitKey: "advisory-partial",
  formSource: ADVISORY_FORM_SOURCE,
  ghlSource: `${ADVISORY_PRODUCT_NAME} - Qualifier (incomplete)`,
  /**
   * Its own webhook, with NO fallback to the qualifier's.
   *
   * It used to fall back, on the reasoning that a misconfigured env var
   * should not lose the lead entirely. That was wrong. The qualifier
   * webhook triggers the "completed the qualifier" workflow, and this
   * payload carries no funnel_path and no `qualified` — so an unset
   * variable would have run the completed-qualifier flow for someone who
   * did not complete it, routing an unfinished firm as though it had
   * been judged. Silence is the safer failure.
   *
   * Unset means no webhook and a console warning. The row and the GHL
   * contact are still written either way, so nothing is actually lost —
   * only the automation waits.
   */
  webhookUrl: process.env.GHL_ADVISORY_PARTIAL_WEBHOOK_URL,
  webhookEnvName: "GHL_ADVISORY_PARTIAL_WEBHOOK_URL",
  webhookSource: "advisory-qualifier-partial",
  // Back to the qualifier, not onward: they still have a question to
  // answer, and the pages past it are gated on a funnel path they do not
  // have yet.
  resumePath: ADVISORY_QUALIFY_PATH,
};

export async function recordPartialLead(req: NextRequest, cfg: PartialLeadConfig) {
  const ip = getClientIp(req);
  // Looser than the qualifier's limit: this fires mid-flow, and someone
  // correcting a typo on the contact step legitimately submits twice.
  const limit = checkRateLimit(`${cfg.rateLimitKey}:${ip}`, 10, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const raw = (body?.contact ?? {}) as Record<string, unknown>;
    const candidate = {
      firstName: trimTo(raw.firstName, MAX_NAME),
      lastName: trimTo(raw.lastName, MAX_NAME),
      email: trimTo(raw.email, 200).toLowerCase(),
      phone: trimTo(raw.phone, 40),
      firmName: trimTo(raw.firmName, MAX_FIRM),
    };

    // Same validator as the full submit. The browser has already run it, so
    // a failure here means a crafted request — refuse quietly rather than
    // returning field errors to a form nobody is looking at any more.
    if (Object.keys(validateContact(candidate)).length) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const contact = { ...candidate, marketingSmsOptIn: raw.marketingSmsOptIn === true };
    const attribution = (body?.attribution ?? {}) as Record<string, string | null>;
    const userAgent = req.headers.get("user-agent") || "";

    const db = getDb();
    if (!db) return NextResponse.json({ ok: false }, { status: 503 });

    const { lead, leadId } = await upsertLeadByEmail({
      db,
      contact,
      formSource: cfg.formSource,
      attribution,
      ip,
      userAgent,
      logTag: "Partial",
    });
    if (!leadId) return NextResponse.json({ ok: false }, { status: 503 });

    /**
     * Only tag a contact INCOMPLETE if they have not already finished.
     *
     * Someone can come back and redo the qualifier. Running the contact
     * step again would otherwise re-tag a firm that has already qualified,
     * already booked, or already bought — dropping them back into an
     * abandonment sequence they finished weeks ago.
     */
    const alreadyFinished = Boolean(lead?.funnelPath);

    const resumeUrl = `${SITE_URL}/api/advisory-pricing/resume?t=${encodeURIComponent(
      await createDemoToken(leadId),
    )}&to=${encodeURIComponent(cfg.resumePath)}`;

    if (!alreadyFinished) {
      await syncContactToGhl({
        resumeUrl,
        email: contact.email,
        firstName: contact.firstName,
        lastName: contact.lastName,
        phone: contact.phone,
        firmName: contact.firmName,
        source: cfg.ghlSource,
        tags: [TAG_ADVISORY_INCOMPLETE],
        attribution,
        noteHeading: "Started the advisory qualifier",
        extraNoteLines: [
          "Gave contact details, has not answered the budget question yet.",
        ],
      });

      if (cfg.webhookUrl) {
        fetch(cfg.webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source: cfg.webhookSource,
            tag: TAG_ADVISORY_INCOMPLETE,
            stage: "qualifier_incomplete",
            lead_id: leadId,
            firstName: contact.firstName,
            lastName: contact.lastName,
            email: contact.email,
            phone: contact.phone,
            firm_name: contact.firmName,
            resume_url: resumeUrl,
            utm_source: attribution.utm_source || null,
            utm_medium: attribution.utm_medium || null,
            utm_campaign: attribution.utm_campaign || null,
            fbclid: attribution.fbclid || null,
            landing_page: attribution.landing_page || null,
            submitted_at: new Date().toISOString(),
          }),
        }).catch(() => {});
      } else {
        console.warn(`[Partial] ${cfg.webhookEnvName} not set — skipping webhook`);
      }
    }

    // Mint the session cookie here rather than waiting for the full submit,
    // so a resume link works for someone who never finishes.
    const res = NextResponse.json({ ok: true });
    res.cookies.set(DEMO_COOKIE, await createDemoToken(leadId), demoCookieOptions());
    return res;
  } catch (error) {
    console.error("[Partial] error:", error);
    // Never surface this. The browser has already moved on.
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
