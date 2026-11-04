// ---------------------------------------------------------------------------
// Advisory funnel, page 2 — the qualifier. Reached from the VSL.
//
// ONE IMPLEMENTATION, FOUR ROUTES. Every angle has its own
// /<angle>/qualify, and each of those route files is a thin wrapper that
// renders this with its own angle. The question list, the copy and the
// layout are identical across all four and must stay that way — the angle
// changes which argument got them here, not what is asked of them.
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
import {
  ADVISORY_OFFER_PATH,
  callPathForAngle,
  isVslAngle,
  type VslAngle,
} from '@/lib/advisory-config';

/** Re-exported by each of the four route files. */
export const qualifyMetadata: Metadata = {
  title: 'Is your firm a fit? | Nexli',
  robots: 'noindex, nofollow',
};

const OUTFIT: CSSProperties = {
  fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif",
};

/**
 * The angle now comes from the ROUTE, so `?angle=` is no longer how a visitor
 * is attributed — /systems/qualify is self-describing.
 *
 * It is still read, and still wins when valid, for one reason: the old
 * /advisory-pricing/qualify 301s to /agency/qualify and Next forwards the
 * query string with it. An ad or an email sent before the restructure
 * carries ?angle=systems, and honouring it keeps that click attributed to
 * Systems instead of silently re-badging it as Agency.
 *
 * Untrusted (it is a URL), so it is clamped to a short slug and then checked
 * against the known angles before it is allowed to override anything.
 */
function readAngle(raw: string | string[] | undefined): string | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return undefined;
  const slug = value.trim().toLowerCase().slice(0, 32);
  return /^[a-z0-9-]+$/.test(slug) ? slug : undefined;
}

export default async function QualifyStep({
  angle: routeAngle,
  searchParams,
}: {
  angle: VslAngle;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const fromQuery = readAngle((await searchParams).angle);
  const angle = isVslAngle(fromQuery) ? fromQuery : routeAngle;
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
          angle={angle}
          qualifiedPath={callPathForAngle(angle)}
          // Still the $97 page. Each angle now has its own /next-steps
          // route, but nothing routes to it until that tier is retired and
          // this fork is repointed.
          unqualifiedPath={ADVISORY_OFFER_PATH}
          footnote="A few questions. About a minute. We tell you either way."
        />
      </section>
    </main>
  );
}
