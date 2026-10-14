/**
 * Entitlement for the $297 Book of Business Accelerator funnel.
 *
 * The gate is `leads.advisory_purchased_at`, NOT a Stripe session id in the
 * URL. A session id is a weak, permanent credential: it leaks through the
 * Referer header to every third-party script on the page, survives being
 * forwarded or pasted, and never expires. The retired roadmap funnel
 * authenticated a POST endpoint with exactly that; this does not.
 *
 * `session_id` is honoured on one page only — the thank-you page — and its
 * sole privileged action is minting the normal signed cookie. Everything
 * downstream reads the lead row.
 *
 * This also closes a cross-funnel hole: the cookie is shared with the demo
 * funnel, so someone who opted in there months ago arrives here already
 * holding a valid one. The purchase check is what makes the gate real.
 */
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getDb } from './db';
import { leads } from './leads-schema';
import { readDemoLead } from './demo-session';
import { ADVISORY_OFFER_PATH, ADVISORY_PATH } from './advisory-config';

export interface AdvisoryBuyer {
  leadId: string;
  lead: typeof leads.$inferSelect;
}

/** The lead row for this id, but only if the guide has been paid for. */
export async function loadAdvisoryBuyer(leadId: string): Promise<AdvisoryBuyer | null> {
  const db = getDb();
  if (!db) return null;
  try {
    const [lead] = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
    if (!lead || !lead.advisoryPurchasedAt) return null;
    return { leadId, lead };
  } catch (err) {
    console.error('[Advisory] buyer lookup failed:', err);
    return null;
  }
}

/**
 * Page guard for everything behind the purchase: thank-you (cookie branch),
 * qualify, call, next-steps. Sends non-buyers to the sales page.
 */
export async function requireAdvisoryBuyer(): Promise<AdvisoryBuyer> {
  const leadId = await readDemoLead();
  if (!leadId) redirect(ADVISORY_PATH);
  const buyer = await loadAdvisoryBuyer(leadId);
  if (!buyer) redirect(ADVISORY_OFFER_PATH);
  return buyer;
}

/** Page guard for the sales page itself — opted in, not necessarily paid. */
export async function requireAdvisoryLead(): Promise<string> {
  const leadId = await readDemoLead();
  if (!leadId) redirect(ADVISORY_PATH);
  return leadId;
}

export interface AdvisoryLead {
  leadId: string;
  lead: typeof leads.$inferSelect | null;
}

/**
 * The lead row for an opted-in visitor, paid or not.
 *
 * The VSL, the qualifier and the booking page all need the row — a first name
 * to greet with, an email to prefill Cal, `funnel_path` to route on — but none
 * of them gate on the purchase any more: the $297 is the downsell the
 * qualifier routes to, not the toll for reaching the calendar.
 *
 * `lead` is null when no database is configured or the row has gone. A caller
 * that only wants a first name can carry on; a caller gating on `funnelPath`
 * must read null as "has not qualified" and never as "allowed through".
 */
export async function requireAdvisoryLeadRow(): Promise<AdvisoryLead> {
  const leadId = await readDemoLead();
  if (!leadId) redirect(ADVISORY_PATH);

  const db = getDb();
  if (!db) return { leadId, lead: null };
  try {
    const [lead] = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
    return { leadId, lead: lead ?? null };
  } catch (err) {
    console.error('[Advisory] lead lookup failed:', err);
    return { leadId, lead: null };
  }
}
