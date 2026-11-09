// ---------------------------------------------------------------------------
// Candor transcripts to GoHighLevel — shared by the two routes that send one.
//
// TWO KINDS OF POST, TO TWO WEBHOOKS:
//
//   'conversation' → GHL_CANDOR_WEBHOOK_URL, `final: true`
//       From app/api/candor/transcript, ONCE per conversation, when the
//       visitor leaves (tab closed, app switched, phone locked, new chat
//       started). The whole conversation. This is what Marcel gets emailed,
//       and the only thing that webhook receives — so the GHL workflow is
//       just "webhook → email {{inboundWebhookRequest.transcript}}", with no
//       branching to build.
//
//   'answer' → GHL_CANDOR_ANSWER_WEBHOOK_URL, `final: false` — OPTIONAL
//       From app/api/candor, once per answer, the thread so far. Written by
//       the server, so exactly what Candor said. Off unless that variable is
//       set. It used to be the only kind, which meant one email per answer.
//
// There is no reliable "conversation ended" event in a chat. The old
// `unload` beacon really is the thing that silently stops firing; the
// browser's visibilitychange/pagehide pair replaced it and is what the page
// uses. It can still miss — a crashed tab, a dead battery. Every question is
// also logged as a [Candor] line in the platform logs, and the per-answer
// webhook is there for anyone who wants a record that cannot miss.
// ---------------------------------------------------------------------------
import type { NextRequest } from 'next/server';
import { SITE_URL } from '@/lib/site';

export type TranscriptTurn = { role: 'user' | 'assistant'; content: string };

/**
 * The GHL contact the Candor link was sent to — `?c={{contact.id}}` on the
 * booking-flow SMS and email. Without it a conversation opened on a phone
 * arrives anonymous: phones that tap a text link carry no funnel cookie, so
 * lead_id is null.
 *
 * Strict on purpose. GHL ids are alphanumeric, ~20 characters. Anything else
 * — including a literal "{{contact.id}}" GHL failed to render — is dropped,
 * and the page works exactly as it did without one.
 */
export function parseContactId(raw: unknown): string | null {
  return typeof raw === 'string' && /^[A-Za-z0-9]{10,40}$/.test(raw) ? raw : null;
}

/**
 * The finished Candor link for a booking-flow email or SMS. Written to the
 * contact's candor_url custom field by lib/ghl-sync (candorUrl: true) and
 * used as {{contact.candor_url}}.
 *
 * Built here rather than as `/candor?c={{contact.id}}` in the template: GHL's
 * editor flags a merge tag inside a URL as a custom-variable error. Without
 * a valid contact id it is the plain link, which still works.
 */
export function candorLink(contactId: string | null | undefined): string {
  const id = parseContactId(contactId);
  return id ? `${SITE_URL}/candor?c=${id}` : `${SITE_URL}/candor`;
}

/**
 * One click from the transcript email to the contact record. Null without a
 * GHL_LOCATION_ID. Uses the stock app.gohighlevel.com host; a white-label
 * login domain would need swapping here.
 */
export function ghlContactUrl(contactId: string | null): string | null {
  const location = process.env.GHL_LOCATION_ID;
  if (!contactId || !location) return null;
  return `https://app.gohighlevel.com/v2/location/${encodeURIComponent(location)}/contacts/detail/${contactId}`;
}

/** Readable in a GHL notification email without any templating. */
export function formatTranscript(turns: TranscriptTurn[]): string {
  return turns
    .map((t) => `${t.role === 'user' ? 'THEM' : 'CANDOR'}: ${t.content}`)
    .join('\n\n');
}

/**
 * Never throws, so a caller can fire and forget it — the answer route does,
 * because this must never delay or fail an answer. Returns the promise so a
 * caller with nothing else to do can await it instead: on a serverless
 * function, an un-awaited request can be frozen mid-flight once the
 * response is sent.
 *
 * NOT silent. The first version swallowed everything, which meant a
 * rotated webhook URL or a GHL outage would lose transcripts with nothing
 * anywhere to say so — and the only symptom would be Marcel slowly noticing
 * he had stopped receiving them.
 */
export function sendTranscript(
  kind: 'conversation' | 'answer',
  payload: Record<string, unknown>,
): Promise<void> {
  const envName = kind === 'conversation' ? 'GHL_CANDOR_WEBHOOK_URL' : 'GHL_CANDOR_ANSWER_WEBHOOK_URL';
  const url = process.env[envName];
  if (!url) {
    // The per-answer webhook is optional, so its absence is not news.
    if (kind === 'conversation') {
      console.warn(`[Candor] ${envName} not set — transcript not sent`);
    }
    return Promise.resolve();
  }
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
    .then((res) => {
      if (!res.ok) {
        console.error(`[Candor] transcript webhook returned ${res.status}`);
      }
    })
    .catch((err) => {
      console.error('[Candor] transcript webhook failed:', err);
    });
}

/**
 * Not security — a determined caller sets any header they like. It stops the
 * casual case of someone pointing a script at a public endpoint, which is the
 * realistic threat for these routes.
 */
export function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true; // same-origin fetches may omit it
  try {
    const host = new URL(origin).host;
    return host === new URL(SITE_URL).host || host.startsWith('localhost');
  } catch {
    return false;
  }
}
