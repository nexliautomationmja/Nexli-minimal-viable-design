/**
 * The one function the funnel routes call to push a lead into GoHighLevel.
 *
 * It does three things, in order, and never throws:
 *   1. Upsert the contact by email, with the qualifier answers as custom
 *      fields and the right tags.
 *   2. Add the tags again explicitly, so they land even if the upsert
 *      ignored them (GHL has historically been inconsistent here).
 *   3. Append a note containing every answer in plain English. This is the
 *      belt-and-braces surface: even with no custom fields mapped in the
 *      account, a human opening the contact sees the whole picture.
 */
import {
  addContactNote,
  addContactTags,
  buildCustomFields,
  isGhlConfigured,
  upsertContact,
} from './ghl';
import { qualificationLabel, type QualificationAnswers } from './qualification-steps';
import type { FunnelPath } from './demo-config';

export interface SyncContactInput {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  firmName?: string | null;
  websiteUrl?: string | null;
  source: string;
  tags: string[];
  attribution?: Record<string, string | null | undefined> | null;
  /** Present once the qualifier has run. */
  answers?: QualificationAnswers | null;
  leadScore?: string | null;
  funnelPath?: FunnelPath | null;
  /** Extra lines appended to the note, e.g. "Booked the growth call". */
  noteHeading?: string;
  extraNoteLines?: string[];
}

/**
 * Every qualifier answer as a readable block. Unlike the older
 * formatAnswersAsNotes in QualificationProvider, this includes tax savings
 * and the funnel path.
 */
export function formatQualificationNote(input: SyncContactInput): string {
  const a = input.answers;
  const lines: string[] = [input.noteHeading || 'Nexli demo funnel'];

  if (input.firmName) lines.push(`Firm: ${input.firmName}`);
  if (input.websiteUrl) lines.push(`Website: ${input.websiteUrl}`);

  if (a) {
    lines.push('', '--- Qualification answers ---');
    lines.push(`US based: ${a.usBased === null ? 'N/A' : a.usBased ? 'Yes' : 'No'}`);
    lines.push(`Decision role: ${qualificationLabel('decisionRole', a.decisionRole) ?? 'N/A'}`);
    lines.push(`Primary goal: ${qualificationLabel('goal', a.goal) ?? 'N/A'}`);
    lines.push(`Problem duration: ${qualificationLabel('problemDuration', a.problemDuration) ?? 'N/A'}`);
    lines.push(`Annual revenue: ${qualificationLabel('annualRevenue', a.annualRevenue) ?? 'N/A'}`);
    lines.push(`Biggest tax saving: ${qualificationLabel('taxSavings', a.taxSavings) ?? 'N/A'}`);
    if (a.goalTag) lines.push(`Goal tag: ${a.goalTag}`);
    if (a.taxSavingsTag) lines.push(`Tax planning tier: ${a.taxSavingsTag}`);
  }

  if (input.leadScore) lines.push('', `Lead score: ${input.leadScore}`);
  if (input.funnelPath) {
    lines.push(
      `Routed to: ${input.funnelPath === 'agency' ? 'agency pitch (booking call)' : 'web pitch (self-serve website + portal)'}`,
    );
  }
  if (input.extraNoteLines?.length) lines.push('', ...input.extraNoteLines);
  lines.push('', `Recorded ${new Date().toISOString()}`);
  return lines.join('\n');
}

export interface SyncResult {
  ok: boolean;
  contactId?: string;
  skipped?: boolean;
  error?: string;
}

/**
 * Push a lead and its qualifier answers onto the GoHighLevel contact.
 * Safe to call from any route: it never throws and logs its own failures.
 */
export async function syncContactToGhl(input: SyncContactInput): Promise<SyncResult> {
  if (!isGhlConfigured()) {
    console.warn('[GHL] GHL_API_KEY / GHL_LOCATION_ID not set — skipping contact sync');
    return { ok: false, skipped: true, error: 'not configured' };
  }
  if (!input.email) return { ok: false, error: 'no email' };

  const a = input.answers;
  const customFields = buildCustomFields({
    nexli_us_based: a?.usBased === null || a?.usBased === undefined ? null : a.usBased ? 'Yes' : 'No',
    nexli_decision_role: qualificationLabel('decisionRole', a?.decisionRole ?? null),
    nexli_primary_goal: qualificationLabel('goal', a?.goal ?? null),
    nexli_problem_duration: qualificationLabel('problemDuration', a?.problemDuration ?? null),
    nexli_annual_revenue: qualificationLabel('annualRevenue', a?.annualRevenue ?? null),
    nexli_tax_savings: qualificationLabel('taxSavings', a?.taxSavings ?? null),
    nexli_lead_score: input.leadScore ?? null,
    nexli_funnel_path: input.funnelPath ?? null,
  });

  const upserted = await upsertContact({
    email: input.email,
    phone: input.phone,
    firstName: input.firstName,
    lastName: input.lastName,
    companyName: input.firmName,
    website: input.websiteUrl,
    tags: input.tags,
    customFields,
    source: input.source,
    attribution: input.attribution,
  });

  if (!upserted.ok || !upserted.data) {
    return { ok: false, error: upserted.error };
  }
  const contactId = upserted.data.id;

  // Tags and the note are independent of the upsert succeeding at field level.
  await addContactTags(contactId, input.tags);
  const note = await addContactNote(contactId, formatQualificationNote(input));

  return { ok: note.ok, contactId, error: note.ok ? undefined : note.error };
}
