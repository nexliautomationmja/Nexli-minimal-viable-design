// ---------------------------------------------------------------------------
// /book: the calendar for a firm that already qualified (Marcel, 2026-11-16).
//
// Firms that booked are retargeted back to /math, /candor and /ai-avatars,
// often after missing the call. Making them answer the qualifier again is
// friction for nothing: they cleared it once. The sticky button on those
// pages sends them here, and so can GHL's no-show and retargeting messages.
//
// Three states (lib/booking-access):
//   session cookie, qualified  the calendar, filled in as /agency/call is
//   rebook pass, qualified     the calendar with the email they typed and
//                              nothing else: the email proved little, so
//                              their name, phone and answers stay off screen
//   neither                    "use the email you qualified with", or the
//                              qualifier if they are new
//
// Not angle-specific, so the booking carries no VSL angle; the contact kept
// its tag from the first time. The booked route tells GHL it was a rebook.
// ---------------------------------------------------------------------------
import type { Metadata } from 'next';
import FunnelLogo from '@/components/FunnelLogo';
import RebookEmailForm from '@/components/booking/RebookEmailForm';
import AdvisoryCallClient from '@/app/_funnel/call-client';
import { buildNotes } from '@/app/_funnel/call-step';
import { readBookingAccess } from '@/lib/booking-access';
import { toE164 } from '@/lib/contact-validation';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Pick a time | Nexli',
  description: 'Book your strategy call with Nexli.',
  robots: 'noindex, nofollow',
};

const OUTFIT = { fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif" } as const;
const MUTED = { color: 'rgba(255,255,255,0.65)' } as const;

/** Prefilled into Cal for a rebook pass: nothing about the firm, since the
 *  booker sees this field. The answers are on the GHL contact. */
const REBOOK_NOTES =
  '--- Nexli advisory funnel: rebooked from /book with the email they qualified with. Their qualifier answers are on the GHL contact. ---';

function Badge({ children, tone }: { children: React.ReactNode; tone: 'green' | 'blue' }) {
  const c =
    tone === 'green'
      ? { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', text: '#34d399' }
      : { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.28)', text: '#93c5fd' };
  return (
    <div
      className="mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5"
      style={{ backgroundColor: c.bg, borderColor: c.border }}
    >
      <span className="text-[11px] font-bold uppercase tracking-[0.15em]" style={{ color: c.text }}>
        {children}
      </span>
    </div>
  );
}

export default async function BookPage() {
  const access = await readBookingAccess();
  const lead = access?.lead ?? null;
  const full = access?.via === 'session';
  const bookedBefore = Boolean(lead?.bookedCallAt);

  const firstName = full ? (lead?.firstName || '').trim() : '';
  const lastName = full ? (lead?.lastName || '').trim() : '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ');

  let heading: string;
  if (!access) heading = 'Book your call again.';
  else if (full && firstName) heading = `${firstName}, pick ${bookedBefore ? 'a new' : 'a'} time.`;
  else heading = bookedBefore ? 'Welcome back. Pick a new time.' : 'Welcome back. Pick a time.';

  return (
    <main className="relative min-h-screen overflow-hidden" style={{ backgroundColor: '#0a0f1c' }}>
      <FunnelLogo />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-[130px]" />
      </div>

      <section className="relative z-10 px-4 pb-6 pt-24 text-center md:pb-8 md:pt-28">
        {access ? <Badge tone="green">Already qualified</Badge> : <Badge tone="blue">Welcome back</Badge>}

        <h1
          className="mx-auto max-w-2xl text-2xl font-black leading-[1.08] tracking-tight text-white sm:text-3xl md:text-4xl"
          style={OUTFIT}
        >
          {heading}
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed sm:text-base" style={MUTED}>
          {access
            ? 'You already cleared the qualifier, so there are no questions this time. 45 minutes, camera on, no slide deck.'
            : 'Already qualified? Use the email you qualified with and you’ll go straight to the calendar. No questions this time.'}
        </p>

        {access && bookedBefore && (
          <p className="mx-auto mt-3 max-w-xl text-xs leading-relaxed sm:text-[13px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Still have a call on the calendar? The reschedule link in your confirmation email moves it
            instead of adding a second one.
          </p>
        )}
      </section>

      {!access && (
        <section className="relative z-10 px-4 pb-24">
          <RebookEmailForm />
        </section>
      )}

      {access && lead && (
        <AdvisoryCallClient
          fullName={fullName}
          email={lead.email || ''}
          phone={full ? toE164(lead.phone || '') : ''}
          leadToken={access.token}
          notes={full ? buildNotes(lead) : REBOOK_NOTES}
          angle=""
        />
      )}
    </main>
  );
}
