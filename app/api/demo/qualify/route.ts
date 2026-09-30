import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getDb } from "@/lib/db";
import { leads } from "@/lib/leads-schema";
import { scoreLead } from "@/lib/lead-scoring";
import { sendCAPIEvent } from "@/lib/meta-capi";
import { readDemoLead } from "@/lib/demo-session";
import { syncContactToGhl } from "@/lib/ghl-sync";
import {
  normalizeQualificationAnswers,
  qualificationLabel,
  DISQUALIFYING_REVENUE,
  DISQUALIFYING_ROLE,
} from "@/lib/qualification-steps";
import {
  DEMO_CALL_PATH,
  DEMO_OFFER_PATH,
  DEMO_QUALIFY_PATH,
  FUNNEL_PATH_TAG,
  TAG_DEMO_OPT_IN,
  type FunnelPath,
} from "@/lib/demo-config";
import { SITE_URL } from "@/lib/site";

export const runtime = "nodejs";

/**
 * Demo funnel page 3. Records the six qualification answers against the lead
 * the opt-in cookie identifies, splits the funnel, and tells the client where
 * to go next.
 *
 *   qualified -> 'agency' -> /demo/call   (booking, pitched on the call)
 *   otherwise -> 'web'    -> /demo/offer  (self-serve website + portal)
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = checkRateLimit(`demo-qualify:${ip}`, 10, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const leadId = await readDemoLead();
  if (!leadId) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

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
    const path: FunnelPath = qualified ? "agency" : "web";

    const db = getDb();
    let lead: typeof leads.$inferSelect | null = null;
    if (db) {
      try {
        [lead] = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
      } catch (err) {
        console.error("[Demo Qualify] lead lookup failed:", err);
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
        console.error("[Demo Qualify] DB update failed:", err);
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
        source: "Nexli Demo - Qualifier",
        tags: [TAG_DEMO_OPT_IN, FUNNEL_PATH_TAG[path]],
        attribution,
        answers,
        leadScore: scoring.classification,
        funnelPath: path,
        noteHeading: "Completed the demo qualifier",
      });
      if (db && sync.contactId && !lead.ghlContactId) {
        try {
          await db
            .update(leads)
            .set({ ghlContactId: sync.contactId, updatedAt: new Date() })
            .where(eq(leads.id, leadId));
        } catch (err) {
          console.error("[Demo Qualify] ghlContactId persist failed:", err);
        }
      }
    }

    // ── Meta ──────────────────────────────────────────────────────────────
    const sourceUrl = attribution.landing_page || `${SITE_URL}${DEMO_QUALIFY_PATH}`;
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
        custom_data: { ...customData, content_name: "Demo Qualifier" },
      }).catch(() => {});
    }

    if (path === "agency") {
      sendCAPIEvent({
        event_name: "QualifiedLead",
        event_time: Math.floor(Date.now() / 1000),
        event_id: `dql_${leadId}_${Date.now()}`,
        action_source: "website",
        event_source_url: sourceUrl,
        user_data: userData,
        custom_data: { ...customData, lead_id: leadId },
      }).catch(() => {});
    }

    // ── Inbound webhook (fire and forget) ─────────────────────────────────
    const webhook = process.env.GHL_DEMO_QUALIFY_WEBHOOK_URL;
    if (webhook) {
      fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "demo-qualifier",
          tag: FUNNEL_PATH_TAG[path],
          funnel_path: path,
          qualified: path === "agency",
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
      console.warn("[Demo Qualify] GHL_DEMO_QUALIFY_WEBHOOK_URL not set — skipping webhook");
    }

    return NextResponse.json({
      ok: true,
      path,
      next: path === "agency" ? DEMO_CALL_PATH : DEMO_OFFER_PATH,
    });
  } catch (error) {
    console.error("[Demo Qualify] error:", error);
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
