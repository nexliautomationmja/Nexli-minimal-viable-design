// ---------------------------------------------------------------------------
// Upsert a `leads` row from contact details, matched on email.
//
// Lifted out of recordQualification because there are now two writers. The
// qualifier writes at the END of the flow, when every answer is in; the
// partial-capture route writes in the MIDDLE, the moment someone finishes
// the contact step. Both must land on the same row, so both must match
// identically — a second copy of this logic would drift and start minting
// duplicate leads for the same person.
//
// Matched on email rather than with onConflict because leads.email has no
// unique constraint, and most-recent-first because a historical duplicate
// should not shadow the row currently in play.
//
// Attribution and the IP/UA pair are written on INSERT only. The partial
// capture usually gets there first, so it is the one that records where
// they came from; the completing write must not overwrite that with a
// later page's referrer.
// ---------------------------------------------------------------------------
import { eq, sql as dsql } from "drizzle-orm";
import type { getDb } from "./db";
import { leads } from "./leads-schema";

type Db = NonNullable<ReturnType<typeof getDb>>;
export type LeadRow = typeof leads.$inferSelect;

export interface LeadContact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  firmName: string;
  marketingSmsOptIn: boolean;
}

export interface LeadAttribution {
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
  fbclid?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  landing_page?: string | null;
  referrer?: string | null;
}

export interface UpsertLeadResult {
  /** The row as it was BEFORE this write, or null on a fresh insert. */
  lead: LeadRow | null;
  leadId: string | null;
  /** True when this call created the row. */
  created: boolean;
}

export async function upsertLeadByEmail(opts: {
  db: Db;
  contact: LeadContact;
  formSource: string;
  attribution: LeadAttribution;
  ip: string;
  userAgent: string;
  /** Prefix for console lines, e.g. "Qualify" or "Partial". */
  logTag: string;
}): Promise<UpsertLeadResult> {
  const { db, contact, formSource, attribution, ip, userAgent, logTag } = opts;

  let lead: LeadRow | null = null;
  try {
    const [existing] = await db
      .select()
      .from(leads)
      .where(dsql`lower(${leads.email}) = ${contact.email}`)
      .orderBy(dsql`${leads.createdAt} desc`)
      .limit(1);
    if (existing) lead = existing;
  } catch (err) {
    console.error(`[${logTag}] email lookup failed:`, err);
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
      return { lead, leadId: lead.id, created: false };
    }
    const [inserted] = await db
      .insert(leads)
      .values({
        ...contactValues,
        formSource,
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
    return { lead: null, leadId: inserted?.id ?? null, created: true };
  } catch (err) {
    // leadId null, NOT lead.id, even when the row was found. The caller
    // treats a null id as "could not save, tell them to try again", and
    // that is what the inline version this replaced did — the assignment
    // sat after the write inside the same try, so a failed UPDATE left
    // the id unset. Returning the id here instead would quietly carry on
    // against a row we just failed to write to.
    console.error(`[${logTag}] lead upsert failed:`, err);
    return { lead, leadId: null, created: false };
  }
}
