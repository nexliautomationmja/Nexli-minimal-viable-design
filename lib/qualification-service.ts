// ---------------------------------------------------------------------------
// The six-question qualifier, shared by the demo funnel and the advisory
// funnel.
//
// Extracted rather than copied: of ~240 lines, only the routing at the very
// end differed between the two. Duplicating the rest — the scoring, the GHL
// note that lists every answer, the two Meta events, the webhook payload —
// is how components/VslFunnel.tsx and VslFunnelOffer.tsx ended up as 3,385
// lines of near-identical siblings.
//
// Each caller owns its own gate and resolves the lead id first: the demo
// funnel needs only the opt-in cookie, the advisory funnel needs a purchase.
// ---------------------------------------------------------------------------
import { NextRequest, NextResponse } from "next/server";
import { eq, sql as dsql } from "drizzle-orm";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getDb } from "@/lib/db";
import { leads } from "@/lib/leads-schema";
import { scoreLead } from "@/lib/lead-scoring";
import { sendCAPIEvent } from "@/lib/meta-capi";
import { syncContactToGhl } from "@/lib/ghl-sync";
import {
  normalizeQualificationAnswers,
  qualificationLabel,
  DISQUALIFYING_BUDGETS,
  DISQUALIFYING_REVENUE,
  DISQUALIFYING_ROLE,
} from "@/lib/qualification-steps";
import { FUNNEL_PATH_TAG, type FunnelPath } from "@/lib/demo-config";
import { DEMO_COOKIE, createDemoToken, demoCookieOptions } from "@/lib/demo-session";
import { trimTo, validateContact, MAX_NAME, MAX_FIRM } from "@/lib/contact-validation";
import { SITE_URL } from "@/lib/site";

export interface QualifierConfig {
  /**
   * Resolved and gated by the caller before we get here. Null only when the
   * qualifier is itself the lead capture — see `collectsContact`.
   */
  leadId: string | null;
  /**
   * The advisory funnel has no opt-in in front of it, so its qualifier is
   * where the lead is born: contact fields arrive with the answers, the row
   * is upserted on email, and the signed cookie is minted on the response.
   *
   * Leave false and this function behaves exactly as it always has, which is
   * what keeps the demo funnel and the booking modal unchanged.
   */
  collectsContact?: boolean;
  /** Required when collectsContact — leads.form_source for a new row. */
  formSource?: string;
  rateLimitKey: string;
  ghlSource: string;
  noteHeading: string;
  /** Meta content_name, so the funnels stay separable in Events Manager. */
  contentName: string;
  /** Prefix for the custom QualifiedLead event id. */
  qualifiedEventPrefix: string;
  /** Read statically by the caller — see the note in lib/optin-service.ts. */
  webhookUrl: string | undefined;
  webhookEnvName: string;
  webhookSource: string;
  baseTags: string[];
  /**
   * Stage tags to strip once this qualifier has run. Stage tags are exclusive:
   * "advisory opt-in" means opted in and done nothing since, so the moment a
   * firm is qualified or ruled out it stops being true. Milestone tags
   * (qualified, call booked, buyer) accumulate and are never removed here.
   *
   * Optional, and the demo funnel does not pass it — its tags are additive.
   */
  removeTags?: string[];
  /** Where each outcome lands. The demo funnel splits agency/web; the
   *  advisory funnel splits agency/not-a-fit. */
  qualifiedPath: FunnelPath;
  unqualifiedPath: FunnelPath;
  nextPath: Partial<Record<FunnelPath, string>>;
  /** This funnel's qualifier page, for the CAPI event_source_url fallback. */
  sourcePath: string;
}

export async function recordQualification(req: NextRequest, cfg: QualifierConfig) {
  const ip = getClientIp(req);
  const limit = checkRateLimit(`${cfg.rateLimitKey}:${ip}`, 10, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const answers = normalizeQualificationAnswers(body?.answers);
    const eventId = typeof body?.event_id === "string" ? body.event_id.slice(0, 100) : null;
    const leadEventId =
      typeof body?.lead_event_id === "string" ? body.lead_event_id.slice(0, 100) : null;
    const attribution = (body?.attribution && typeof body.attribution === "object"
      ? body.attribution
      : {}) as Record<string, string | null | undefined>;
    const userAgent = req.headers.get("user-agent") || "";

    // ── Contact, when this qualifier is also the lead capture ────────────
    let contact: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      firmName: string;
      marketingSmsOptIn: boolean;
    } | null = null;

    if (cfg.collectsContact) {
      const raw = (body?.contact ?? {}) as Record<string, unknown>;
      const candidate = {
        firstName: trimTo(raw.firstName, MAX_NAME),
        lastName: trimTo(raw.lastName, MAX_NAME),
        email: trimTo(raw.email, 200).toLowerCase(),
        phone: trimTo(raw.phone, 40),
        firmName: trimTo(raw.firmName, MAX_FIRM),
      };
      const invalid = validateContact(candidate);
      if (Object.keys(invalid).length) {
        return NextResponse.json(
          { error: "Please check your details.", fields: invalid },
          { status: 400 },
        );
      }
      contact = { ...candidate, marketingSmsOptIn: raw.marketingSmsOptIn === true };
    }

    // ── The split ─────────────────────────────────────────────────────────
    const qualified =
      answers.usBased !== false &&
      answers.decisionRole !== DISQUALIFYING_ROLE &&
      answers.annualRevenue !== DISQUALIFYING_REVENUE &&
      // Only gates where a budget question was actually asked. A null budget
      // on the demo funnel must not disqualify anyone.
      !(answers.budget !== null && DISQUALIFYING_BUDGETS.includes(answers.budget));
    const path: FunnelPath = qualified ? cfg.qualifiedPath : cfg.unqualifiedPath;

    const db = getDb();
    let lead: typeof leads.$inferSelect | null = null;
    let leadId = cfg.leadId;

    if (db && contact) {
      // ── Upsert on email ───────────────────────────────────────────────
      // The opt-in route inserted blind, which was survivable when it ran
      // once per visitor. This endpoint is retried — people abandon the
      // qualifier and come back — so a blind insert would mint a new row
      // every attempt. leads.email has no unique constraint, so the match
      // is done here rather than with onConflict.
      try {
        const [existing] = await db
          .select()
          .from(leads)
          .where(dsql`lower(${leads.email}) = ${contact.email}`)
          .orderBy(dsql`${leads.createdAt} desc`)
          .limit(1);
        if (existing) lead = existing;
      } catch (err) {
        console.error("[Qualify] email lookup failed:", err);
      }

      const contactValues = {
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone,
        firmName: contact.firmName,
        marketingSmsOptIn: contact.marketingSmsOptIn,
        // Service texts are covered by the disclosure shown at the contact
        // step; only the marketing flag is an explicit tick.
        nonMarketingSmsOptIn: true,
        updatedAt: new Date(),
      };

      try {
        if (lead) {
          await db.update(leads).set(contactValues).where(eq(leads.id, lead.id));
          leadId = lead.id;
        } else {
          const [inserted] = await db
            .insert(leads)
            .values({
              ...contactValues,
              formSource: cfg.formSource ?? "advisory-qualifier",
              utmSource: attribution.utm_source ?? null,
              utmMedium: attribution.utm_medium ?? null,
              utmCampaign: attribution.utm_campaign ?? null,
              utmTerm: attribution.utm_term ?? null,
              utmContent: attribution.utm_content ?? null,
              fbclid: attribution.fbclid ?? null,
              fbp: attribution.fbp ?? null,
              fbc: attribution.fbc ?? null,
              landingPage: attribution.landing_page ?? null,
              referrer: attribution.referrer ?? null,
              ipAddress: ip !== "unknown" ? ip : null,
              userAgent,
            })
            .returning({ id: leads.id });
          leadId = inserted?.id ?? null;
        }
      } catch (err) {
        console.error("[Qualify] lead upsert failed:", err);
      }

      if (!leadId) {
        return NextResponse.json(
          { error: "We could not save your answers just now. Please try again." },
          { status: 503 },
        );
      }
    }

    if (!leadId) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }

    if (db && !lead) {
      try {
        [lead] = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
      } catch (err) {
        console.error("[Qualify] lead lookup failed:", err);
      }
    }

    // scoreLead needs the email to clear its missing/fake-email gates.
    const scoring = scoreLead({
      email: lead?.email ?? null,
      firstName: lead?.firstName ?? null,
      lastName: lead?.lastName ?? null,
      phone: lead?.phone ?? null,
      usBased: answers.usBased,
      decisionRole: answers.decisionRole,
      annualRevenue: answers.annualRevenue,
      goal: answers.goal,
      goalTag: answers.goalTag,
      problemDuration: answers.problemDuration,
      formSource: "qualification-gate",
    });

    if (db) {
      try {
        await db
          .update(leads)
          .set({
            usBased: answers.usBased,
            decisionRole: answers.decisionRole,
            goal: answers.goal,
            goalTag: answers.goalTag,
            problemDuration: answers.problemDuration,
            annualRevenue: answers.annualRevenue,
            taxSavings: answers.taxSavings,
            taxSavingsTag: answers.taxSavingsTag,
            budget: answers.budget,
            leadScore: scoring.classification,
            disqualifyReason:
              scoring.classification === "disqualified" ? scoring.reason : null,
            funnelPath: path,
            ...(eventId ? { metaEventId: eventId } : {}),
            updatedAt: new Date(),
          })
          .where(eq(leads.id, leadId));
      } catch (err) {
        console.error("[Qualify] DB update failed:", err);
      }
    }

    /**
     * A one-click way back into the funnel from an email.
     *
     * /api/advisory-pricing/resume takes an HMAC-signed lead token, sets the
     * session cookie and bounces to `to` — so a nurture email can drop
     * someone straight back on the calendar or the offer page from any
     * device, with no form to re-fill and no duplicate lead row.
     *
     * It points at the same place the app just sent them, which is what
     * makes it a RESUME rather than a restart: a firm that qualified and
     * closed the tab gets the calendar back, and a not-a-fit gets the $97
     * page back.
     *
     * The token expires on the same clock as the cookie. It is still a
     * bearer credential in a URL — forward the email, forward the access —
     * which is why the paid pages gate on the purchase recorded against the
     * lead row rather than on this.
     *
     * Written to the CONTACT as well as sent in the webhook, so a workflow
     * built later, which never saw this payload, can still link them back.
     */
    const resumeDestination = cfg.nextPath[path] ?? cfg.nextPath[cfg.unqualifiedPath];
    const resumeUrl = resumeDestination
      ? `${SITE_URL}/api/advisory-pricing/resume?t=${encodeURIComponent(
          await createDemoToken(leadId),
        )}&to=${encodeURIComponent(resumeDestination)}`
      : null;

    // ── GoHighLevel: contact + tags + a note with every answer ────────────
    if (lead?.email) {
      const sync = await syncContactToGhl({
        resumeUrl,
        email: lead.email,
        firstName: lead.firstName,
        lastName: lead.lastName,
        phone: lead.phone,
        firmName: lead.firmName,
        websiteUrl: lead.websiteUrl,
        source: cfg.ghlSource,
        tags: [...cfg.baseTags, FUNNEL_PATH_TAG[path]],
        // ghl-sync removes after adding, so the contact is never momentarily
        // untagged between the two calls.
        removeTags: cfg.removeTags,
        attribution,
        answers,
        leadScore: scoring.classification,
        funnelPath: path,
        noteHeading: cfg.noteHeading,
      });
      if (db && sync.contactId && !lead.ghlContactId) {
        try {
          await db
            .update(leads)
            .set({ ghlContactId: sync.contactId, updatedAt: new Date() })
            .where(eq(leads.id, leadId));
        } catch (err) {
          console.error("[Qualify] ghlContactId persist failed:", err);
        }
      }
    }

    // ── Meta ──────────────────────────────────────────────────────────────
    const sourceUrl = attribution.landing_page || `${SITE_URL}${cfg.sourcePath}`;
    const userData = {
      em: lead?.email || undefined,
      ph: lead?.phone || undefined,
      fn: lead?.firstName || undefined,
      ln: lead?.lastName || undefined,
      fbp: attribution.fbp || lead?.fbp || undefined,
      fbc: attribution.fbc || lead?.fbc || undefined,
      client_ip_address: ip !== "unknown" ? ip : undefined,
      client_user_agent: userAgent || undefined,
      country: answers.usBased ? "us" : undefined,
    };
    const customData = {
      lead_score: scoring.classification,
      funnel_path: path,
      annual_revenue: answers.annualRevenue,
      decision_role: answers.decisionRole,
      goal: answers.goal,
      goal_tag: answers.goalTag,
      problem_duration: answers.problemDuration,
      tax_savings: answers.taxSavings,
      tax_savings_tag: answers.taxSavingsTag,
    };

    // The advisory funnel has no opt-in, so this submission is the lead.
    // Without this the funnel reports no Lead conversion at all in Ads
    // Manager, which is the event campaigns optimise against.
    if (leadEventId && contact) {
      sendCAPIEvent({
        event_name: "Lead",
        event_time: Math.floor(Date.now() / 1000),
        event_id: leadEventId,
        action_source: "website",
        event_source_url: attribution.landing_page || `${SITE_URL}${cfg.sourcePath}`,
        user_data: userData,
        custom_data: {
          content_name: cfg.contentName,
          lead_id: leadId,
          lead_score: scoring.classification,
        },
      }).catch(() => {});
    }

    if (eventId) {
      sendCAPIEvent({
        event_name: "CompleteRegistration",
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: "website",
        event_source_url: sourceUrl,
        user_data: userData,
        custom_data: { ...customData, content_name: cfg.contentName },
      }).catch(() => {});
    }

    if (qualified) {
      sendCAPIEvent({
        event_name: "QualifiedLead",
        event_time: Math.floor(Date.now() / 1000),
        event_id: `${cfg.qualifiedEventPrefix}_${leadId}_${Date.now()}`,
        action_source: "website",
        event_source_url: sourceUrl,
        user_data: userData,
        custom_data: { ...customData, lead_id: leadId },
      }).catch(() => {});
    }

    // ── Inbound webhook (fire and forget) ─────────────────────────────────
    const webhook = cfg.webhookUrl;
    if (webhook) {
      fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: cfg.webhookSource,
          tag: FUNNEL_PATH_TAG[path],
          funnel_path: path,
          qualified,
          lead_id: leadId,
          firstName: lead?.firstName || "",
          lastName: lead?.lastName || "",
          email: lead?.email || "",
          phone: lead?.phone || "",
          firm_name: lead?.firmName || "",
          us_based: answers.usBased,
          decision_role: answers.decisionRole,
          decision_role_label: qualificationLabel("decisionRole", answers.decisionRole),
          goal: answers.goal,
          goal_label: qualificationLabel("goal", answers.goal),
          goal_tag: answers.goalTag,
          problem_duration: answers.problemDuration,
          problem_duration_label: qualificationLabel("problemDuration", answers.problemDuration),
          annual_revenue: answers.annualRevenue,
          annual_revenue_label: qualificationLabel("annualRevenue", answers.annualRevenue),
          tax_savings: answers.taxSavings,
          tax_savings_label: qualificationLabel("taxSavings", answers.taxSavings),
          tax_savings_tag: answers.taxSavingsTag,
          // The advisory funnel's deciding answer. It was being written to
          // the lead row but left out of the payload, so GHL received the
          // verdict without the reason for it — no way to segment a firm
          // that said "under $10k" from one that failed on role or revenue.
          // Null on the demo funnel, which never asks it.
          budget: answers.budget,
          budget_label: qualificationLabel("budget", answers.budget),
          resume_url: resumeUrl,
          lead_score: scoring.classification,
          utm_source: attribution.utm_source || null,
          utm_medium: attribution.utm_medium || null,
          utm_campaign: attribution.utm_campaign || null,
          fbclid: attribution.fbclid || null,
          landing_page: attribution.landing_page || null,
          submitted_at: new Date().toISOString(),
        }),
      }).catch(() => {});
    } else {
      console.warn(`[Qualify] ${cfg.webhookEnvName} not set — skipping webhook`);
    }

    const res = NextResponse.json({
      ok: true,
      path,
      next: cfg.nextPath[path] ?? cfg.nextPath[cfg.unqualifiedPath],
    });

    // When this qualifier IS the lead capture it also owns the session —
    // every page after it (the calendar, the downsell) gates on this cookie.
    // A Route Handler is the only sanctioned place to set it.
    if (contact && leadId) {
      res.cookies.set(DEMO_COOKIE, await createDemoToken(leadId), demoCookieOptions());
    }

    return res;
  } catch (error) {
    console.error("[Qualify] error:", error);
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
