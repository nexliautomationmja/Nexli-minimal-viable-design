// ---------------------------------------------------------------------------
// Advisory funnel, page 2 — the qualifier. Reached from the VSL.
//
// Open to anyone: there is no opt-in in front of this funnel, so this page
// is where a visitor first identifies themselves. Four questions, then
// contact details, then the budget question — and that is the fork. Clear
// the bar and the next page is the calendar; miss it and it is the $97.
//
// Mode "foundation" on the card underneath, so nobody is disqualified
// client-side and every answer is collected: we want the full set in
// GoHighLevel even for a firm below the bar, so the reason is visible
// rather than guessed at.
// ---------------------------------------------------------------------------
import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import FunnelLogo from '@/components/FunnelLogo';
import QualifyFlow from '@/components/demo/QualifyFlow';
import { ADVISORY_QUALIFICATION_STEPS } from '@/lib/qualification-steps';
import { ADVISORY_CALL_PATH, ADVISORY_OFFER_PATH } from '@/lib/advisory-config';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Is your firm a fit? | Nexli',
  robots: 'noindex, nofollow',
};

const OUTFIT: CSSProperties = {
  fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif",
};

export default function AdvisoryQualifyPage() {
  return (
    <main className="relative min-h-screen overflow-hidden" style={{ backgroundColor: '#0a0f1c' }}>
      <FunnelLogo />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[800px] h-[520px] rounded-full blur-[130px] bg-blue-500/10" />
      </div>

      <section className="relative z-10 px-4 pt-20 pb-16 md:pt-36 md:pb-28">
        <div className="max-w-2xl mx-auto text-center mb-6 md:mb-12">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-5"
            style={{ backgroundColor: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.25)' }}
          >
            <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-blue-300">
              A few questions
            </span>
          </div>

          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-black leading-[1.1] tracking-tight text-white"
            style={OUTFIT}
          >
            Is your firm one we can do this for?
          </h1>

          <p
            className="mt-4 hidden md:block text-base md:text-lg leading-relaxed max-w-xl mx-auto"
            style={{ color: 'rgba(255,255,255,0.65)' }}
          >
            We only run the done-for-you system for firms it actually works for. These
            six answers tell us whether yours is one of them — and if it is not, we
            will say so rather than sell you a call.
          </p>
        </div>

        <QualifyFlow
          steps={ADVISORY_QUALIFICATION_STEPS}
          endpoint="/api/advisory-pricing/qualify"
          // The contact step is fifth of six, so without this a firm that
          // gives us their details and never answers the budget question
          // leaves no trace at all.
          partialEndpoint="/api/advisory-pricing/partial"
          contentName="Advisory Qualifier"
          qualifiedPath={ADVISORY_CALL_PATH}
          unqualifiedPath={ADVISORY_OFFER_PATH}
          footnote="A few questions. About a minute. We tell you either way."
        />
      </section>
    </main>
  );
}
