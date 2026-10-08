// ---------------------------------------------------------------------------
// Advisory funnel, page 3 — the six questions. Reached from the VSL.
//
// Opted-in visitors, not buyers. This is the fork in the funnel: clear the bar
// and the next page is the calendar, miss it and the next page is the $297
// Accelerator. Nothing here is gated on a purchase.
//
// Mode "foundation" on the card underneath, so nobody is disqualified
// client-side and all six answers are always collected: we want the full set
// in GoHighLevel even for a firm that ends up below the bar, so the reason is
// visible rather than guessed at.
// ---------------------------------------------------------------------------
import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import FunnelLogo from '@/components/FunnelLogo';
import QualifyFlow from '@/components/demo/QualifyFlow';
import { requireAdvisoryLeadRow } from '@/lib/advisory-session';
import { ADVISORY_CALL_PATH, ADVISORY_OFFER_PATH } from '@/lib/advisory-config';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Is your firm a fit? | Nexli',
  robots: 'noindex, nofollow',
};

const OUTFIT: CSSProperties = {
  fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif",
};

export default async function AdvisoryQualifyPage() {
  const { lead } = await requireAdvisoryLeadRow();
  const firstName = (lead?.firstName || '').trim();

  return (
    <main className="relative min-h-screen overflow-hidden" style={{ backgroundColor: '#0a0f1c' }}>
      <FunnelLogo />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[800px] h-[520px] rounded-full blur-[130px] bg-blue-500/10" />
      </div>

      <section className="relative z-10 px-4 pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="max-w-2xl mx-auto text-center mb-8 md:mb-12">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-5"
            style={{ backgroundColor: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.25)' }}
          >
            <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-blue-300">
              Six questions
            </span>
          </div>

          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-black leading-[1.1] tracking-tight text-white"
            style={OUTFIT}
          >
            {firstName ? `${firstName}, is your firm one we can do this for?` : 'Is your firm one we can do this for?'}
          </h1>

          <p
            className="mt-4 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl mx-auto"
            style={{ color: 'rgba(255,255,255,0.65)' }}
          >
            We only run the done-for-you system for firms it actually works for. These
            six answers tell us whether yours is one of them — and if it is not, we
            will say so rather than sell you a call.
          </p>
        </div>

        <QualifyFlow
          endpoint="/api/advisory-pricing/qualify"
          qualifiedPath={ADVISORY_CALL_PATH}
          unqualifiedPath={ADVISORY_OFFER_PATH}
          footnote="Six questions. About a minute. We tell you either way."
        />
      </section>
    </main>
  );
}
