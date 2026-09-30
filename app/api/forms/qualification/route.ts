import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getDb } from "@/lib/db";
import { leads } from "@/lib/leads-schema";
import { scoreLead } from "@/lib/lead-scoring";
import { sendCAPIEvent } from "@/lib/meta-capi";
import { syncContactToGhl } from "@/lib/ghl-sync";
import { TAG_AGENCY_PITCH, TAG_WEB_PITCH } from "@/lib/demo-config";

const GHL_WEBHOOK_URL =
  process.env.GHL_QUALIFICATION_WEBHOOK_URL ||
  "https://services.leadconnectorhq.com/hooks/yamjttuJWWdstfF9N0zu/webhook-trigger/c08ab845-6f7c-4016-bdf0-bbcb6b5782e6";

/** "Dana Whitfield" -> { firstName: "Dana", lastName: "Whitfield" }. */
function splitName(full: string | null): { firstName: string | null; lastName: string | null } {
  if (!full) return { firstName: null, lastName: null };
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: null, lastName: null };
  if (parts.length === 1) return { firstName: parts[0], lastName: null };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = checkRateLimit(`form-qualification:${ip}`, 5, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();

    const usBased = body.us_based === true;
    const decisionRole =
      typeof body.decision_role === "string" ? body.decision_role.trim() : null;
    const goal =
      typeof body.goal === "string" ? body.goal.trim() : null;
    const goalTag =
      typeof body.goal_tag === "string" ? body.goal_tag.trim() : null;
    const problemDuration =
      typeof body.problem_duration === "string" ? body.problem_duration.trim() : null;
    const annualRevenue =
      typeof body.annual_revenue === "string" ? body.annual_revenue.trim() : null;
    const taxSavings =
      typeof body.tax_savings === "string" ? body.tax_savings.trim() : null;
    const taxSavingsTag =
      typeof body.tax_savings_tag === "string" ? body.tax_savings_tag.trim() : null;
    const qualified = body.qualified === true;
    const eventId =
      typeof body.event_id === "string" ? body.event_id : null;

    // Optional identity. The pre-booking call has none of these — the visitor
    // has not told us who they are yet — so this route behaves exactly as it
    // always has. QualificationProvider calls it a second time once Cal.com
    // reports a successful booking, and THAT call carries the attendee's
    // email, which is what finally lets the answers be attached to a real
    // GoHighLevel contact instead of floating in a webhook payload.
    const email =
      typeof body.email === "string" && body.email.includes("@")
        ? body.email.trim().toLowerCase()
        : null;
    const name = typeof body.name === "string" ? body.name.trim() || null : null;
    const bookingUid =
      typeof body.booking_uid === "string" ? body.booking_uid.trim() || null : null;
    const stage = typeof body.stage === "string" ? body.stage.trim() || null : null;

    // Attribution data from client
    const attribution = body.attribution || {};
    const userAgent = req.headers.get("user-agent") || "";

    // Score the lead
    const scoring = scoreLead({
      email,
      usBased,
      decisionRole,
      annualRevenue,
      goal,
      goalTag,
      problemDuration,
      formSource: "qualification-gate",
    });

    // Insert into leads table (non-blocking for response speed)
    const db = getDb();
    let leadId: string | null = null;

    if (db) {
      try {
        const [inserted] = await db
          .insert(leads)
          .values({
            usBased,
            decisionRole,
            annualRevenue,
            goal,
            goalTag,
            problemDuration,
            taxSavings,
            taxSavingsTag,
            leadScore: scoring.classification,
            disqualifyReason:
              scoring.classification === "disqualified" ? scoring.reason : null,
            formSource: "qualification-gate",
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
        leadId = inserted?.id || null;
      } catch (dbErr) {
        console.error("[Qualification] DB insert failed");
      }
    }

    // Forward to GHL webhook
    fetch(GHL_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "qualification-gate",
        qualified,
        us_based: usBased,
        decision_role: decisionRole,
        goal,
        goal_tag: goalTag,
        problem_duration: problemDuration,
        annual_revenue: annualRevenue,
        tax_savings: taxSavings,
        tax_savings_tag: taxSavingsTag,
        lead_score: scoring.classification,
        // Attribution for GHL
        utm_source: attribution.utm_source || null,
        utm_medium: attribution.utm_medium || null,
        utm_campaign: attribution.utm_campaign || null,
        fbclid: attribution.fbclid || null,
        landing_page: attribution.landing_page || null,
        submitted_at: new Date().toISOString(),
      }),
    }).catch(() => {});

    // Write the answers onto the GoHighLevel CONTACT (not just a webhook
    // payload). Only possible once we know who they are; see `email` above.
    // Awaited on purpose: a background promise can be killed when the
    // serverless function returns. syncContactToGhl never throws and caps
    // each GHL call at 8s, so the worst case is a slow response, not a 500.
    if (email) {
      const { firstName, lastName } = splitName(name);
      await syncContactToGhl({
        email,
        firstName,
        lastName,
        source: "Nexli Booking Funnel - Qualifier",
        tags: [qualified ? TAG_AGENCY_PITCH : TAG_WEB_PITCH],
        answers: {
          usBased,
          decisionRole,
          goal,
          goalTag,
          problemDuration,
          annualRevenue,
          taxSavings,
          taxSavingsTag,
        },
        leadScore: scoring.classification,
        funnelPath: qualified ? "agency" : "web",
        attribution,
        noteHeading: "Completed the booking-funnel qualifier",
        extraNoteLines: [
          ...(stage ? [`Stage: ${stage}`] : []),
          ...(bookingUid ? [`Cal.com booking uid: ${bookingUid}`] : []),
        ],
      });
    }

    // Fire CAPI CompleteRegistration event (deduplicates with browser pixel)
    if (eventId) {
      sendCAPIEvent({
        event_name: "CompleteRegistration",
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: "website",
        event_source_url: attribution.landing_page || "https://www.nexli.net",
        user_data: {
          fbp: attribution.fbp || undefined,
          fbc: attribution.fbc || undefined,
          client_ip_address: ip !== "unknown" ? ip : undefined,
          client_user_agent: userAgent || undefined,
          country: usBased ? "us" : undefined,
        },
        custom_data: {
          lead_score: scoring.classification,
          annual_revenue: annualRevenue,
          decision_role: decisionRole,
          goal,
          goal_tag: goalTag,
          problem_duration: problemDuration,
          tax_savings: taxSavings,
          tax_savings_tag: taxSavingsTag,
        },
      }).catch(() => {});
    }

    // If qualified, fire server-only QualifiedLead event
    if (scoring.classification === "qualified") {
      sendCAPIEvent({
        event_name: "QualifiedLead",
        event_time: Math.floor(Date.now() / 1000),
        event_id: `ql_${leadId || "unknown"}_${Date.now()}`,
        action_source: "website",
        event_source_url: attribution.landing_page || "https://www.nexli.net",
        user_data: {
          fbp: attribution.fbp || undefined,
          fbc: attribution.fbc || undefined,
          client_ip_address: ip !== "unknown" ? ip : undefined,
          client_user_agent: userAgent || undefined,
          country: usBased ? "us" : undefined,
        },
        custom_data: {
          lead_id: leadId,
          lead_score: "qualified",
          annual_revenue: annualRevenue,
          decision_role: decisionRole,
          goal_tag: goalTag,
          tax_savings_tag: taxSavingsTag,
        },
      }).catch(() => {});
    }

    return NextResponse.json({
      ok: true,
      qualified,
      leadId,
      leadScore: scoring.classification,
    });
  } catch (error) {
    console.error("[Qualification] Route error");
    return NextResponse.json(
      { error: "Submission failed." },
      { status: 500 }
    );
  }
}
