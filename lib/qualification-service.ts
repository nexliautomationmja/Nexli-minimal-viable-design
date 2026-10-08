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
import { eq } from "drizzle-orm";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getDb } from "@/lib/db";
import { leads } from "@/lib/leads-schema";
import { scoreLead } from "@/lib/lead-scoring";
import { sendCAPIEvent } from "@/lib/meta-capi";
import { syncContactToGhl } from "@/lib/ghl-sync";
import {
  normalizeQualificationAnswers,
  qualificationLabel,
  DISQUALIFYING_REVENUE,
  DISQUALIFYING_ROLE,
} from "@/lib/qualification-steps";
import { FUNNEL_PATH_TAG, type FunnelPath } from "@/lib/demo-config";
import { SITE_URL } from "@/lib/site";

export interface QualifierConfig {
  /** Resolved and gated by the caller before we get here. */
  leadId: string;
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

  const leadId = cfg.leadId;

  try {
    const body = await req.json().catch(() => ({}));
    const answers = normalizeQualificationAnswers(body?.answers);
    const eventId = typeof body?.event_id === "string" ? body.event_id.slice(0, 100) : null;
    const attribution = (body?.attribution && typeof body.attribution === "object"
      ? body.attribution
      : {}) as Record<string, string | null | undefined>;
    const userAgent = req.headers.get("user-agent") || "";

    // ── The split ─────────────────────────────────────────────────────────
    const qualified =
      answers.usBased !== false &&
      answers.decisionRole !== DISQUALIFYING_ROLE &&
      answers.annualRevenue !== DISQUALIFYING_REVENUE;
    const path: FunnelPath = qualified ? cfg.qualifiedPath : cfg.unqualifiedPath;

    const db = getDb();
    let lead: typeof leads.$inferSelect | null = null;
    if (db) {
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

    // ── GoHighLevel: contact + tags + a note with every answer ────────────
    if (lead?.email) {
      const sync = await syncContactToGhl({
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

    return NextResponse.json({
      ok: true,
      path,
      next: cfg.nextPath[path] ?? cfg.nextPath[cfg.unqualifiedPath],
    });
  } catch (error) {
    console.error("[Qualify] error:", error);
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
