/**
 * GoHighLevel API v2 client — writes contacts, tags and notes.
 *
 * WHY THIS EXISTS. Every other GHL integration in this app POSTs to an
 * inbound webhook. That fires a workflow, but it does not write anything onto
 * the contact record: arbitrary keys in a webhook payload only land on a
 * contact if a workflow maps each one to a custom field that already exists.
 * The qualifier payload was worse still — it carried no email, phone or name,
 * so GHL had nothing to attach the answers to at all. This module writes the
 * data directly.
 *
 * The inbound webhooks stay: they trigger the automations. This is additive.
 *
 * Auth is a Private Integration token (starts `pit-`) in GHL_API_KEY, with
 * the location in GHL_LOCATION_ID. Modelled on nexli-portal's ghl-client.ts,
 * which reads; these are the write helpers that did not exist anywhere.
 *
 * Nothing here ever throws at the caller. A CRM outage must not fail a
 * visitor's request, so every function returns a result object and logs.
 */

const GHL_BASE_URL = 'https://services.leadconnectorhq.com';
const GHL_VERSION = '2021-07-28';
const TIMEOUT_MS = 8_000;

export interface GhlResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

/** True when the token and location are both configured. */
export function isGhlConfigured(): boolean {
  return !!process.env.GHL_API_KEY && !!process.env.GHL_LOCATION_ID;
}

function getLocationId(): string {
  return process.env.GHL_LOCATION_ID || '';
}

async function ghlFetch<T>(
  path: string,
  init: { method: 'GET' | 'POST' | 'PUT'; body?: unknown },
): Promise<GhlResult<T>> {
  const key = process.env.GHL_API_KEY;
  if (!key || !getLocationId()) {
    return { ok: false, error: 'GHL_API_KEY or GHL_LOCATION_ID is not set' };
  }
  try {
    const res = await fetch(new URL(path, GHL_BASE_URL).toString(), {
      method: init.method,
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Version: GHL_VERSION,
      },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const text = await res.text();
    if (!res.ok) {
      // Log the body: a missing Private Integration scope shows up here and
      // nowhere else.
      const msg = `${res.status} ${res.statusText} — ${text.slice(0, 400)}`;
      console.error(`[GHL] ${init.method} ${path} failed: ${msg}`);
      return { ok: false, error: msg };
    }
    return { ok: true, data: (text ? JSON.parse(text) : {}) as T };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[GHL] ${init.method} ${path} threw: ${msg}`);
    return { ok: false, error: msg };
  }
}

// ── Custom fields ─────────────────────────────────────────────────────────

/**
 * Field ids from `node scripts/ghl/setup-custom-fields.mjs`, as JSON in
 * GHL_CUSTOM_FIELD_IDS, e.g. {"nexli_annual_revenue":"abc123", ...}.
 *
 * When it is unset we fall back to sending `key`, which GHL accepts for
 * fields whose key matches. Either way the note still carries every answer,
 * so the data is never lost to a misconfiguration.
 */
let _fieldIds: Record<string, string> | null = null;
function fieldIds(): Record<string, string> {
  if (_fieldIds) return _fieldIds;
  try {
    _fieldIds = JSON.parse(process.env.GHL_CUSTOM_FIELD_IDS || '{}');
  } catch {
    console.warn('[GHL] GHL_CUSTOM_FIELD_IDS is not valid JSON — falling back to field keys');
    _fieldIds = {};
  }
  return _fieldIds!;
}

export interface GhlCustomField {
  id?: string;
  key?: string;
  field_value: string;
}

/** Build the customFields array, preferring ids and falling back to keys. */
export function buildCustomFields(values: Record<string, string | null | undefined>): GhlCustomField[] {
  const ids = fieldIds();
  const out: GhlCustomField[] = [];
  for (const [key, value] of Object.entries(values)) {
    if (value === null || value === undefined || value === '') continue;
    const id = ids[key];
    out.push(id ? { id, field_value: String(value) } : { key, field_value: String(value) });
  }
  return out;
}

// ── Contacts ──────────────────────────────────────────────────────────────

export interface UpsertContactInput {
  email: string;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  /** GHL's standard company field — use it for the firm name. */
  companyName?: string | null;
  website?: string | null;
  tags?: string[];
  customFields?: GhlCustomField[];
  source?: string;
  attribution?: Record<string, string | null | undefined> | null;
}

export interface GhlContactRef {
  id: string;
  isNew: boolean;
}

/**
 * Create or update a contact by email within the location.
 * Returns the contact id so later calls can target it directly.
 */
export async function upsertContact(input: UpsertContactInput): Promise<GhlResult<GhlContactRef>> {
  const a = input.attribution || {};
  const body: Record<string, unknown> = {
    locationId: getLocationId(),
    email: input.email,
    ...(input.phone ? { phone: input.phone } : {}),
    ...(input.firstName ? { firstName: input.firstName } : {}),
    ...(input.lastName ? { lastName: input.lastName } : {}),
    ...(input.companyName ? { companyName: input.companyName } : {}),
    ...(input.website ? { website: input.website } : {}),
    ...(input.tags?.length ? { tags: input.tags } : {}),
    ...(input.customFields?.length ? { customFields: input.customFields } : {}),
    ...(input.source ? { source: input.source } : {}),
  };
  // GHL stores first-touch attribution on the contact when supplied.
  if (a.utm_source || a.utm_medium || a.utm_campaign || a.fbclid) {
    body.attributionSource = {
      ...(a.utm_source ? { utmSource: a.utm_source } : {}),
      ...(a.utm_medium ? { utmMedium: a.utm_medium } : {}),
      ...(a.utm_campaign ? { campaign: a.utm_campaign } : {}),
      ...(a.fbclid ? { fbclid: a.fbclid } : {}),
      ...(a.landing_page ? { url: a.landing_page } : {}),
      ...(a.referrer ? { referrer: a.referrer } : {}),
      medium: 'form',
    };
  }

  const res = await ghlFetch<{ contact?: { id?: string }; new?: boolean }>(
    '/contacts/upsert',
    { method: 'POST', body },
  );
  if (!res.ok) return { ok: false, error: res.error };
  const id = res.data?.contact?.id;
  if (!id) return { ok: false, error: 'upsert returned no contact id' };
  return { ok: true, data: { id, isNew: !!res.data?.new } };
}

/** Add tags to an existing contact without touching its other fields. */
export async function addContactTags(contactId: string, tags: string[]): Promise<GhlResult> {
  if (!tags.length) return { ok: true };
  return ghlFetch(`/contacts/${encodeURIComponent(contactId)}/tags`, {
    method: 'POST',
    body: { tags },
  });
}

/**
 * Append a note to the contact's timeline. This is the surface that always
 * shows the qualifier answers to a human, whether or not the custom fields
 * are mapped correctly in the account.
 */
export async function addContactNote(contactId: string, body: string): Promise<GhlResult> {
  return ghlFetch(`/contacts/${encodeURIComponent(contactId)}/notes`, {
    method: 'POST',
    body: { body: body.slice(0, 5000) },
  });
}
