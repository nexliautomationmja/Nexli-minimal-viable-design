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
