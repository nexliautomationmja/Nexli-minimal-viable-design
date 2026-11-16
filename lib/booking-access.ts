// ---------------------------------------------------------------------------
// Who may go straight to the calendar without answering the qualifier again
// (Marcel, 2026-11-16). Server-only: shared by /book and
// /api/advisory-pricing/rebook.
//
// A firm qualifies once. When it comes back, usually because it was
// retargeted after booking or after missing the call, the sticky button on
// /math, /candor and /ai-avatars takes it to the calendar instead of the
// questions. Two ways we know who it is:
//
//   the session cookie (DEMO_COOKIE)  this browser went through the
//                                     qualifier: the calendar opens fully
//                                     filled in, as /agency/call does
//   the rebook pass (REBOOK_COOKIE)   they typed the email they qualified
//                                     with on /book: the calendar opens with
//                                     that email and nothing else
//
// Either way the gate is the row, never the cookie alone: funnel_path must be
// 'agency', the same check /<angle>/call and the booked route make.
// ---------------------------------------------------------------------------
import { cookies } from 'next/headers';
import { and, desc, eq, sql as dsql } from 'drizzle-orm';
import { getDb } from './db';
import { leads } from './leads-schema';
import { DEMO_COOKIE, REBOOK_COOKIE, verifyDemoToken, verifyRebookToken } from './demo-session';

export type LeadRow = typeof leads.$inferSelect;

/** What the sticky button shows. Never carries a name. */
export type BookingState = 'booked' | 'qualified' | 'unknown';

/** The row, but only if this firm cleared the qualifier. */
export async function loadQualifiedLead(leadId: string): Promise<LeadRow | null> {
  const db = getDb();
  if (!db) return null;
  try {
    const [lead] = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
    return lead?.funnelPath === 'agency' ? lead : null;
  } catch (err) {
    console.error('[Booking access] lead lookup failed:', err);
    return null;
  }
}

/**
 * The newest qualified row for an email. Matched on lower(email), as
 * upsertLeadByEmail does, so whatever case they type finds the same row.
 */
export async function findQualifiedLeadByEmail(email: string): Promise<LeadRow | null> {
  const db = getDb();
  if (!db) return null;
  try {
    const [lead] = await db
      .select()
      .from(leads)
      .where(and(dsql`lower(${leads.email}) = ${email.trim().toLowerCase()}`, eq(leads.funnelPath, 'agency')))
      .orderBy(desc(leads.updatedAt))
      .limit(1);
    return lead ?? null;
  } catch (err) {
    console.error('[Booking access] email lookup failed:', err);
    return null;
  }
}

export function bookingStateOf(lead: LeadRow | null): BookingState {
  if (!lead) return 'unknown';
  return lead.bookedCallAt ? 'booked' : 'qualified';
}

export interface BookingAccess {
  lead: LeadRow;
  /** 'session': the qualifier ran on this browser. 'rebook': they typed their email. */
  via: 'session' | 'rebook';
  /** The token the booked route authenticates the booking with. */
  token: string;
}

/** Who this request is, for /book. The full session wins over a rebook pass. */
export async function readBookingAccess(): Promise<BookingAccess | null> {
  let store: Awaited<ReturnType<typeof cookies>>;
  try {
    store = await cookies();
  } catch {
    return null;
  }

  const session = store.get(DEMO_COOKIE)?.value;
  const sessionLead = await verifyDemoToken(session);
  if (session && sessionLead) {
    const lead = await loadQualifiedLead(sessionLead);
    if (lead) return { lead, via: 'session', token: session };
  }

  const pass = store.get(REBOOK_COOKIE)?.value;
  const passLead = await verifyRebookToken(pass);
  if (pass && passLead) {
    const lead = await loadQualifiedLead(passLead);
    if (lead) return { lead, via: 'rebook', token: pass };
  }

  return null;
}
