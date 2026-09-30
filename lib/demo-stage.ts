// ---------------------------------------------------------------------------
// Demo funnel stage tracking.
//
// Every page in the funnel calls markDemoStage() once, so GoHighLevel knows
// how far a lead actually got rather than only which pitch they were assigned.
// That is the difference between "qualified for the call" and "saw the call
// page" — the gap between the two is your drop-off.
//
// Two properties this has to hold:
//
//   1. Write-once. Page views repeat (refresh, back button, a second tab), and
//      without a guard every one of them is another GHL API call. The claim is
//      a conditional UPDATE ... WHERE col IS NULL RETURNING, so two concurrent
//      renders cannot both win.
//   2. Never blocks or breaks the page. Callers wrap this in after() so it runs
//      once the response is already sent, and nothing in here throws.
// ---------------------------------------------------------------------------

import { and, eq, isNull } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { leads } from '@/lib/leads-schema';
import { addContactTags } from '@/lib/ghl';
import { syncContactToGhl } from '@/lib/ghl-sync';
import {
  TAG_AGENCY_PITCH_VIEWED,
  TAG_DEMO_VIEWED,
  TAG_WEB_PITCH_VIEWED,
} from '@/lib/demo-config';

export type DemoStage = 'demo' | 'agencyPitch' | 'webPitch';

const STAGES = {
  demo: {
    key: 'demoViewedAt',
    column: leads.demoViewedAt,
    tag: TAG_DEMO_VIEWED,
    source: 'Nexli Demo - Sandbox',
    note: 'Opened the demo sandbox',
  },
  agencyPitch: {
    key: 'agencyPitchViewedAt',
    column: leads.agencyPitchViewedAt,
    tag: TAG_AGENCY_PITCH_VIEWED,
    source: 'Nexli Demo - Agency Pitch',
    note: 'Reached the agency pitch page',
  },
  webPitch: {
    key: 'webPitchViewedAt',
    column: leads.webPitchViewedAt,
    tag: TAG_WEB_PITCH_VIEWED,
    source: 'Nexli Demo - Web Pitch',
    note: 'Reached the website + portal offer page',
  },
} as const;

/**
 * Record that `leadId` reached `stage`, and push the matching tag to GHL.
 * Safe to call on every render: the second call is a no-op.
 */
export async function markDemoStage(leadId: string, stage: DemoStage): Promise<void> {
  const cfg = STAGES[stage];
  const db = getDb();
  if (!db) return;

  let claimed;
  try {
    // Atomic claim: only the first render for this lead+stage gets a row back.
    claimed = await db
      .update(leads)
      .set({ [cfg.key]: new Date(), updatedAt: new Date() })
      .where(and(eq(leads.id, leadId), isNull(cfg.column)))
      .returning({
        email: leads.email,
        firstName: leads.firstName,
        lastName: leads.lastName,
        phone: leads.phone,
        firmName: leads.firmName,
        websiteUrl: leads.websiteUrl,
        ghlContactId: leads.ghlContactId,
        funnelPath: leads.funnelPath,
      });
  } catch (err) {
    console.error(`[Demo Stage] claim failed (${stage}):`, err);
    return;
  }

  const lead = claimed[0];
  if (!lead) return; // Already recorded — nothing to push.
  if (!lead.email) return;

  try {
    if (lead.ghlContactId) {
      // Known contact: a tag add is one call, versus an upsert plus a note.
      const res = await addContactTags(lead.ghlContactId, [cfg.tag]);
      if (!res.ok) console.warn(`[Demo Stage] tag failed (${stage}):`, res.error);
      return;
    }

    // No contact id yet — GHL was unreachable or unconfigured earlier in the
    // funnel. Fall back to the full sync so the contact exists to be tagged.
    const sync = await syncContactToGhl({
      email: lead.email,
      firstName: lead.firstName,
      lastName: lead.lastName,
      phone: lead.phone,
      firmName: lead.firmName,
      websiteUrl: lead.websiteUrl,
      source: cfg.source,
      tags: [cfg.tag],
      funnelPath: lead.funnelPath as 'agency' | 'web' | undefined,
      noteHeading: cfg.note,
    });
    if (sync.contactId) {
      await db
        .update(leads)
        .set({ ghlContactId: sync.contactId, updatedAt: new Date() })
        .where(eq(leads.id, leadId));
    }
  } catch (err) {
    console.error(`[Demo Stage] GHL push failed (${stage}):`, err);
  }
}
