// ---------------------------------------------------------------------------
// The whole Candor conversation, once, when the visitor leaves.
//
// The page calls this on visibilitychange→hidden / pagehide (tab closed, app
// switched, phone locked) and when they start or open a different chat. It
// forwards the whole conversation to GHL_CANDOR_WEBHOOK_URL as `final: true`
// — the one Marcel gets emailed. See lib/candor-transcript.
//
// The turns come from the browser, so this is the visitor's own copy of the
// chat, not the server's. The optional per-answer webhook is the
// server-authored record if the two ever need comparing.
//
// Always 204: the page has usually gone by the time this lands, and nothing
// reads the response.
// ---------------------------------------------------------------------------
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import {
  formatTranscript,
  sameOrigin,
  sendTranscript,
  type TranscriptTurn,
} from '@/lib/candor-transcript';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Generous: an answer runs longer than a question, and this is a record. */
const MAX_TURN_CHARS = 6000;
const MAX_TURNS = 80;

const done = () => new NextResponse(null, { status: 204 });

function parseTurns(raw: unknown): TranscriptTurn[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (m): m is TranscriptTurn =>
        !!m &&
        typeof m === 'object' &&
        ((m as TranscriptTurn).role === 'user' || (m as TranscriptTurn).role === 'assistant') &&
        typeof (m as TranscriptTurn).content === 'string' &&
        (m as TranscriptTurn).content.trim() !== '',
    )
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_TURN_CHARS) }))
    .slice(-MAX_TURNS);
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return done();

  // Several hides per chat are normal (switching apps twice), but the page
  // only re-sends when something new was said. This bounds a script.
  const ip = getClientIp(req);
  if (!checkRateLimit(`candor-transcript:${ip}`, 30, 15 * 60 * 1000).allowed) return done();

  const body = await req.json().catch(() => null);
  const sessionId =
    typeof body?.sessionId === 'string' && /^[A-Za-z0-9_-]{1,32}$/.test(body.sessionId)
      ? body.sessionId
      : null;
  const turns = parseTurns(body?.turns);
  const questionCount = turns.filter((t) => t.role === 'user').length;
  if (!sessionId || questionCount === 0) return done();

  const leadId = typeof body?.leadId === 'string' ? body.leadId.slice(0, 64) : null;

  // Awaited, not fired and forgotten: there is nothing else to do here, and
  // an un-awaited request can be frozen once the 204 goes out.
  await sendTranscript('conversation', {
    source: 'candor',
    stage: 'candor_conversation',
    // The whole conversation. Per-answer posts (optional) carry final: false.
    final: true,
    session_id: sessionId,
    lead_id: leadId,
    question_count: questionCount,
    // True when the page had to drop the oldest turns to fit the browser's
    // 64KB limit on a send made while the page is closing.
    truncated: body?.truncated === true,
    transcript: formatTranscript(turns),
    ended_at: new Date().toISOString(),
  });

  return done();
}
