// ---------------------------------------------------------------------------
// The sticky "book again" button's two calls (Marcel, 2026-11-16).
//
// GET   what the button on /math, /candor and /ai-avatars should say. Those
//       pages are static, so they ask here once they load:
//         booked     cleared the qualifier and booked before → "Pick a new time"
//         qualified  cleared it, never booked                → "Book your call"
//         unknown    anyone else                             → "See if you qualify"
//       Read from the session cookie only. The state carries no name: the
//       cookie belongs to whoever last went through the funnel on this
//       browser (see app/candor/page.tsx).
//
//       A qualified visitor's cookie is re-issued on the way out, so its 30
//       days count from the last visit rather than from the qualifier. A firm
//       retargeted in week five is still recognised.
//
// POST  { email } from /book, for a qualified firm on a browser we do not
//       recognise. A match sets the two-hour rebook pass (lib/demo-session)
//       and /book then shows the calendar with that email and nothing else.
//       Read-only: no GHL, no webhook, no write. Rate-limited, because the
//       answer says whether an email belongs to a qualified firm.
// ---------------------------------------------------------------------------
import { NextRequest, NextResponse } from 'next/server';
import {
  DEMO_COOKIE,
  REBOOK_COOKIE,
  createDemoToken,
  createRebookToken,
  demoCookieOptions,
  rebookCookieOptions,
  verifyDemoToken,
} from '@/lib/demo-session';
import { bookingStateOf, findQualifiedLeadByEmail, loadQualifiedLead } from '@/lib/booking-access';
import { EMAIL_RE } from '@/lib/contact-validation';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };

export async function GET(req: NextRequest) {
  const leadId = await verifyDemoToken(req.cookies.get(DEMO_COOKIE)?.value);
  const lead = leadId ? await loadQualifiedLead(leadId) : null;
  const res = NextResponse.json({ state: bookingStateOf(lead) }, { headers: NO_STORE });
  if (lead) res.cookies.set(DEMO_COOKIE, await createDemoToken(lead.id), demoCookieOptions());
  return res;
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = checkRateLimit(`advisory-rebook:${ip}`, 5, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many tries. Wait a few minutes and try again.' },
      { status: 429, headers: NO_STORE },
    );
  }

  const body = await req.json().catch(() => ({}));
  const email = typeof body?.email === 'string' ? body.email.trim().slice(0, 254) : '';
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, error: 'Enter the email you used when you qualified.' },
      { status: 400, headers: NO_STORE },
    );
  }

  const lead = await findQualifiedLeadByEmail(email);
  if (!lead) return NextResponse.json({ ok: false }, { headers: NO_STORE });

  const res = NextResponse.json({ ok: true }, { headers: NO_STORE });
  res.cookies.set(REBOOK_COOKIE, await createRebookToken(lead.id), rebookCookieOptions());
  return res;
}
