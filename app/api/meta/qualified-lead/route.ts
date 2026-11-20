import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { secretMatches, verifyWebhookSecret } from "@/lib/webhook-auth";
import { getDb } from "@/lib/db";
import { leads } from "@/lib/leads-schema";
import { sendCAPIEvent } from "@/lib/meta-capi";
import { EMAIL_RE } from "@/lib/contact-validation";
import {
  matchKeys,
  qualifiedLeadEvent,
  readQualifiedLeadRequest,
} from "@/lib/meta-qualified-lead";

export const runtime = "nodejs";

/**
 * Meta's QualifiedLead, sent when a person is moved to the qualified stage
 * of the GoHighLevel pipeline (Marcel, 2026-11-20). Why and what it sends:
 * lib/meta-qualified-lead.ts.
 *
 * SET UP IN GHL (Automation > Workflows), one workflow:
 *   Trigger   Pipeline Stage Changed: the pipeline, and the stage that
 *             means qualified (DRS PIPELINE > Qualified).
 *   Action    Webhook, POST https://www.nexli.net/api/meta/qualified-lead,
 *             Custom Data  secret = CRM_WEBHOOK_SECRET (Vercel).
 *             It posts the contact's email, phone and name by itself. A
 *             Custom Webhook works too, with the secret in an
 *             x-webhook-secret header and a JSON body {"email": ...}.
 *   Settings  Allow re-entry off.
 * While testing, add Custom Data  test_event_code = the code on Events
 * Manager's Test events tab, and take it out once the event shows there.
 *
 * Replies with what it sent (the event id, website or system_generated,
 * and which match keys it had, by name), so the workflow's execution log
 * shows it. 502 when Meta refused the event, with Meta's reason.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad JSON." }, { status: 400 });
  }
  const input = readQualifiedLeadRequest(body);

  if (!verifyWebhookSecret(req) && !secretMatches(input.secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!EMAIL_RE.test(input.email)) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  // The site's record of them, for the click id, browser id and user agent
  // from when they booked. Not finding one is fine: the event still goes,
  // on what GHL sent.
  const db = getDb();
  let lead: typeof leads.$inferSelect | null = null;
  if (db) {
    try {
      [lead = null] = await db
        .select()
        .from(leads)
        .where(sql`lower(${leads.email}) = ${input.email}`)
        .limit(1);
    } catch (err) {
      console.error("[Meta QualifiedLead] lead lookup failed:", err);
    }
  }

  const event = qualifiedLeadEvent(lead, input);
  const result = await sendCAPIEvent(event, { testEventCode: input.testEventCode || undefined });

  if (lead && db) {
    try {
      await db
        .update(leads)
        .set({ leadScore: "qualified", updatedAt: new Date() })
        .where(eq(leads.id, lead.id));
    } catch (err) {
      console.error("[Meta QualifiedLead] lead update failed:", err);
    }
  }

  const sent = {
    event: event.event_name,
    event_id: event.event_id,
    action_source: event.action_source,
    site_record: Boolean(lead),
    match_keys: matchKeys(event.user_data),
    test: Boolean(input.testEventCode),
  };
  if (!result.success) {
    console.error("[Meta QualifiedLead] Meta refused the event:", result.error);
    return NextResponse.json({ ok: false, error: result.error, ...sent }, { status: 502 });
  }
  return NextResponse.json({ ok: true, ...sent });
}
