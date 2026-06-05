import { createHash } from 'crypto';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CAPIUserData {
  em?: string;                 // email — will be hashed
  ph?: string;                 // phone — will be hashed
  fn?: string;                 // first name — will be hashed
  ln?: string;                 // last name — will be hashed
  country?: string;            // country code — will be hashed
  fbp?: string;                // _fbp cookie value (NOT hashed)
  fbc?: string;                // fbc value (NOT hashed)
  client_ip_address?: string;  // (NOT hashed)
  client_user_agent?: string;  // (NOT hashed)
}

export interface CAPIEvent {
  event_name: string;
  event_time: number;          // Unix timestamp in seconds
  event_id: string;            // For deduplication with browser Pixel
  action_source: 'website' | 'system_generated';
  event_source_url?: string;
  user_data: CAPIUserData;
  custom_data?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// SHA-256 hashing (per Meta normalization spec)
// ---------------------------------------------------------------------------

function sha256(value: string): string {
  return createHash('sha256')
    .update(value.trim().toLowerCase())
    .digest('hex');
}

// ---------------------------------------------------------------------------
// Normalize and hash user data for Meta CAPI
// ---------------------------------------------------------------------------

function hashUserData(raw: CAPIUserData): Record<string, unknown> {
  const hashed: Record<string, unknown> = {};

  // PII fields — normalize (trim + lowercase) then SHA-256 hash
  if (raw.em) hashed.em = [sha256(raw.em)];
  if (raw.ph) {
    // Remove spaces, dashes, parens before hashing
    const cleaned = raw.ph.replace(/[\s\-()]/g, '');
    hashed.ph = [sha256(cleaned)];
  }
  if (raw.fn) hashed.fn = [sha256(raw.fn)];
  if (raw.ln) hashed.ln = [sha256(raw.ln)];
  if (raw.country) hashed.country = [sha256(raw.country)];

  // Pass-through fields — NOT hashed per Meta spec
  if (raw.fbp) hashed.fbp = raw.fbp;
  if (raw.fbc) hashed.fbc = raw.fbc;
  if (raw.client_ip_address) hashed.client_ip_address = raw.client_ip_address;
  if (raw.client_user_agent) hashed.client_user_agent = raw.client_user_agent;

  return hashed;
}

// ---------------------------------------------------------------------------
// Send event to Meta Conversions API
// ---------------------------------------------------------------------------

export async function sendCAPIEvent(
  event: CAPIEvent
): Promise<{ success: boolean; error?: string }> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  const apiVersion = process.env.META_API_VERSION || 'v21.0';
  const testEventCode = process.env.META_TEST_EVENT_CODE;

  if (!pixelId || !accessToken) {
    console.warn('[Meta CAPI] Missing PIXEL_ID or ACCESS_TOKEN — skipping event:', event.event_name);
    return { success: false, error: 'Missing configuration' };
  }

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: event.event_name,
        event_time: event.event_time,
        event_id: event.event_id,
        action_source: event.action_source,
        event_source_url: event.event_source_url,
        user_data: hashUserData(event.user_data),
        custom_data: event.custom_data,
      },
    ],
  };

  if (testEventCode) {
    payload.test_event_code = testEventCode;
  }

  const url = `https://graph.facebook.com/${apiVersion}/${pixelId}/events?access_token=${accessToken}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errBody = await res.text();
      // Log error without PII — only status and Meta error structure
      console.error('[Meta CAPI] Error sending', event.event_name, '- status:', res.status);
      return { success: false, error: `HTTP ${res.status}: ${errBody}` };
    }

    return { success: true };
  } catch (err) {
    console.error('[Meta CAPI] Network error sending', event.event_name);
    return { success: false, error: 'Network error' };
  }
}
