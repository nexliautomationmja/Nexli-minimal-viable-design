// ---------------------------------------------------------------------------
// Advisory funnel, page 4 — the calendar.
//
// Firms that cleared the qualifier. No purchase needed: the $97 is the
// downsell for firms that miss the bar, not the toll for getting here.
//
// This page is a header and a calendar. It used to render the demo funnel's
// DemoCallClient, which re-pitched the entire offer over ~5,800px before
// showing a booking button — to someone who had just watched the VSL. The
// pitch is done by the time anyone lands here.
// ---------------------------------------------------------------------------
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import FunnelLogo from '@/components/FunnelLogo';
import { DEMO_COOKIE } from '@/lib/demo-session';
import { requireAdvisoryLeadRow } from '@/lib/advisory-session';
import { qualificationLabel } from '@/lib/qualification-steps';
import { leads } from '@/lib/leads-schema';
import { ADVISORY_OFFER_PATH, ADVISORY_QUALIFY_PATH } from '@/lib/advisory-config';
import { toE164 } from '@/lib/contact-validation';
import AdvisoryCallClient from './call-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Your firm is a fit | Nexli',
  description: 'Pick a time to walk through the advisory engine.',
  robots: 'noindex, nofollow',
};

const OUTFIT = { fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif" } as const;

/** The call-prep block Cal.com shows alongside the booking. */
function buildNotes(lead: typeof leads.$inferSelect): string {
  const lines = ['--- Nexli advisory funnel — cleared the qualifier ---'];
  if (lead.firmName) lines.push(`Firm: ${lead.firmName}`);
  lines.push(`US based: ${lead.usBased === null ? 'N/A' : lead.usBased ? 'Yes' : 'No'}`);
  lines.push(`Decision role: ${qualificationLabel('decisionRole', lead.decisionRole) ?? 'N/A'}`);
  lines.push(`Primary goal: ${qualificationLabel('goal', lead.goal) ?? 'N/A'}`);
  lines.push(`Problem duration: ${qualificationLabel('problemDuration', lead.problemDuration) ?? 'N/A'}`);
  lines.push(`Annual revenue: ${qualificationLabel('annualRevenue', lead.annualRevenue) ?? 'N/A'}`);
  lines.push(`Biggest tax saving: ${qualificationLabel('taxSavings', lead.taxSavings) ?? 'N/A'}`);
  if (lead.goalTag) lines.push(`Goal tag: ${lead.goalTag}`);
  if (lead.leadScore) lines.push(`Lead score: ${lead.leadScore}`);
  if (lead.advisoryPurchasedAt) {
    lines.push(`Bought the Accelerator: ${lead.advisoryPurchasedAt.toISOString().slice(0, 10)}`);
  }
  return lines.join('\n');
}

export default async function AdvisoryCallPage() {
  const { lead } = await requireAdvisoryLeadRow();

  // A missing row fails closed: no funnelPath means not qualified, so back to
  // the qualifier rather than through to the calendar.
  //
  // Checked explicitly rather than by copying the demo page's `=== 'web'`
  // test: this funnel's unqualified value is 'not-a-fit', and a firm that
  // missed the bar goes to the $97 downsell.
  if (!lead?.funnelPath) redirect(ADVISORY_QUALIFY_PATH);
  if (lead.funnelPath !== 'agency') redirect(ADVISORY_OFFER_PATH);

  const leadToken = (await cookies()).get(DEMO_COOKIE)?.value || '';
  const firstName = (lead.firstName || '').trim();
  const lastName = (lead.lastName || '').trim();
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || firstName || 'there';
  // Given at the opt-in, stored as typed. Normalised here rather than at
  // write time: the raw string is what GHL and Meta already received, and
  // rewriting the column would put this funnel's rows out of step with
  // every other one.
  const phone = toE164(lead.phone || '');

  return (
    <main className="relative min-h-screen overflow-hidden" style={{ backgroundColor: '#0a0f1c' }}>
      <FunnelLogo />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[560px] rounded-full blur-[130px] bg-blue-500/10" />
      </div>

      <section className="relative z-10 px-4 pt-24 pb-6 md:pt-28 md:pb-8 text-center">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-5"
          style={{ backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.25)' }}
        >
          <span className="text-[11px] font-bold tracking-[0.15em] uppercase" style={{ color: '#34d399' }}>
            Your firm is a fit
          </span>
        </div>

        <h1
          className="text-2xl sm:text-3xl md:text-4xl font-black leading-[1.08] tracking-tight text-white max-w-2xl mx-auto"
          style={OUTFIT}
        >
          {firstName ? `${firstName}, pick a time.` : 'Pick a time.'}
        </h1>

        <p
          className="mt-4 text-sm sm:text-base leading-relaxed max-w-xl mx-auto"
          style={{ color: 'rgba(255,255,255,0.65)' }}
        >
          Your answers cleared the bar, so there is nothing else to fill in. 45 minutes,
          camera on, no slide deck.
        </p>
      </section>

      <AdvisoryCallClient
        fullName={fullName}
        email={lead.email || ''}
        phone={phone}
        leadToken={leadToken}
        notes={buildNotes(lead)}
      />
    </main>
  );
}
