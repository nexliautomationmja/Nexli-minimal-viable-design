import { createHash } from 'crypto';
import type { CAPIEvent, CAPIUserData } from '@/lib/meta-capi';
import type { leads } from '@/lib/leads-schema';
import { SITE_URL } from '@/lib/site';

// ---------------------------------------------------------------------------
// QualifiedLead FROM THE GOHIGHLEVEL PIPELINE (Marcel, 2026-11-20)
//
// "Whenever I move somebody over in a pipeline, it goes back to the Meta
// Conversions API and tells Facebook, send me more people like this." The
// ads optimize on it, through a custom conversion built on this event.
//
// THE SAME EVENT THE OLD QUALIFIER SENT: "QualifiedLead", a custom event,
// action_source website (app/api/forms/qualification). That is what the ads
// were optimized on before, and they did better on it. The VSLs have no
// qualifier (the booking is the bar), so now a person decides: moving the
// opportunity to the qualified stage runs a GHL workflow that posts here.
// Same name and source, so a custom conversion already built on it keeps
// counting.
//
// A WEBSITE EVENT NEEDS THE VISITOR'S BROWSER. Meta requires
// client_user_agent on website events. VSL bookings carry it in the Cal
// metadata from 2026-11-20 (components/funnel/VslBooking), and the opt-in
// and qualifier forms always saved it. Without one (a booking from before,
// or a contact the site never saw) the event goes as system_generated, so
// Meta takes it rather than refusing it, matched on email and phone.
//
// ONE PER PERSON. The event id is fixed per person, so a second move sends
// Meta the same id and it keeps one (it drops a repeat of the same event
// name and id within 48 hours). The workflow does not allow re-entry either.
// ---------------------------------------------------------------------------

export const QUALIFIED_LEAD_EVENT = 'QualifiedLead';

type LeadRow = typeof leads.$inferSelect;

/** What the GHL workflow sends, from its Webhook or Custom Webhook action. */
export interface QualifiedLeadRequest {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  /** The stage and pipeline the opportunity moved to, when GHL sends them. */
  stage: string;
  pipeline: string;
  /** CRM_WEBHOOK_SECRET, when it comes in the body instead of a header. */
  secret: string;
  /** Events Manager's Test events code, while the workflow is being tested. */
  testEventCode: string;
}

const text = (v: unknown, max = 320): string => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/**
 * Reads either action's body. GHL's plain Webhook action posts the whole
 * contact (email, phone, first_name, last_name at the top) with the
 * action's "Custom Data" pairs under `customData`; a Custom Webhook posts
 * whatever JSON it was given. Either way, these names.
 */
export function readQualifiedLeadRequest(body: unknown): QualifiedLeadRequest {
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  const custom = (b.customData && typeof b.customData === 'object' ? b.customData : {}) as Record<string, unknown>;
  const contact = (b.contact && typeof b.contact === 'object' ? b.contact : {}) as Record<string, unknown>;
  const pick = (...keys: string[]) => {
    for (const k of keys) {
      const v = text(custom[k]) || text(b[k]) || text(contact[k]);
      if (v) return v;
    }
    return '';
  };
  return {
    email: pick('email').toLowerCase(),
    phone: pick('phone'),
    firstName: pick('first_name', 'firstName'),
    lastName: pick('last_name', 'lastName'),
    // GHL's own payload spells it "pipleline_stage".
    stage: pick('pipeline_stage', 'pipleline_stage', 'stage'),
    pipeline: pick('pipeline_name', 'pipeline'),
    secret: text(custom.secret, 200) || text(b.secret, 200),
    testEventCode: text(custom.test_event_code, 40) || text(b.test_event_code, 40),
  };
}

const sha = (s: string) => createHash('sha256').update(s).digest('hex');

/** Which match keys an event carries, by name only, for the workflow's log. */
export function matchKeys(u: CAPIUserData): string[] {
  const names: Array<[keyof CAPIUserData, string]> = [
    ['em', 'email'],
    ['ph', 'phone'],
    ['fn', 'first name'],
    ['ln', 'last name'],
    ['fbc', 'click id (fbc)'],
    ['fbp', 'browser id (fbp)'],
    ['client_ip_address', 'ip'],
    ['client_user_agent', 'user agent'],
  ];
  return names.filter(([k]) => Boolean(u[k])).map(([, label]) => label);
}

/**
 * The event, from the site's lead row (the click id, browser id and user
 * agent from when they booked) with what GHL sent filling any gaps. `lead`
 * is null for a contact the site never saw.
 */
export function qualifiedLeadEvent(lead: LeadRow | null, req: QualifiedLeadRequest, now = Date.now()): CAPIEvent {
  const ip = lead?.ipAddress && lead.ipAddress !== 'unknown' ? lead.ipAddress : undefined;
  const userAgent = lead?.userAgent || undefined;
  const user_data: CAPIUserData = {
    em: lead?.email || req.email || undefined,
    ph: lead?.phone || req.phone || undefined,
    fn: lead?.firstName || req.firstName || undefined,
    ln: lead?.lastName || req.lastName || undefined,
    fbp: lead?.fbp || undefined,
    fbc: lead?.fbc || undefined,
    client_ip_address: ip,
    client_user_agent: userAgent,
  };
  const who = lead?.id ?? sha(req.email).slice(0, 24);
  return {
    event_name: QUALIFIED_LEAD_EVENT,
    event_time: Math.floor(now / 1000),
    event_id: `ql_pipeline_${who}`,
    action_source: userAgent ? 'website' : 'system_generated',
    event_source_url: lead?.landingPage || `${SITE_URL}/agency`,
    user_data,
    custom_data: {
      content_name: 'Qualified Lead',
      lead_score: 'qualified',
      qualified_by: 'pipeline',
      ...(lead?.id ? { lead_id: lead.id } : {}),
      ...(req.stage ? { pipeline_stage: req.stage } : {}),
      ...(req.pipeline ? { pipeline_name: req.pipeline } : {}),
    },
  };
}
