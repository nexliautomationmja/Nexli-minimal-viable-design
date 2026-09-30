import type { Metadata } from 'next';
import FunnelLogo from '@/components/FunnelLogo';
import QualifyFlow from '@/components/demo/QualifyFlow';
import { requireDemoLead } from '@/lib/demo-session';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Is your firm ready for 50 advisory leads? | Nexli',
  description: 'Six quick questions to see whether your firm is ready for 50 qualified advisory leads in 90 days.',
  robots: 'noindex, nofollow',
};

const OUTFIT = { fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif" } as const;

/**
 * The two doors into this page.
 *
 * Same six questions, same scoring, same routing — only the framing differs.
 * Someone who clicked "Claim the website" is told the questions exist so we
 * build it around their firm; someone who clicked the leads button is told
 * plainly that this is a qualifier. Anything other than `website` falls
 * through to the leads copy, so a bare /demo/qualify behaves as it always has.
 */
const INTENTS = {
  leads: {
    heading: 'Can your firm handle 50 advisory leads?',
    sub: 'Six questions, about a minute. They decide whether your firm is ready for a calendar full of $15,000 advisory work, or whether the website and portal is the right place to start.',
  },
  website: {
    heading: "Let's set your website up properly.",
    sub: 'Six questions, about a minute. They tell us how to build it around your firm instead of handing you a template — and whether you also qualify for the system that fills it. Either way, the website and portal are yours.',
  },
} as const;

/**
 * Demo funnel page 3. Gated on the opt-in cookie: no cookie, no page.
 * The answers decide whether the visitor is sent to /demo/call (agency
 * pitch on a call) or /demo/offer (self-serve website + portal).
 */
export default async function DemoQualifyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireDemoLead();

  const params = await searchParams;
  const raw = Array.isArray(params.intent) ? params.intent[0] : params.intent;
  const intent: keyof typeof INTENTS = raw === 'website' ? 'website' : 'leads';
  const copy = INTENTS[intent];

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
              Step 3 of 3
            </span>
          </div>

          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-black leading-[1.1] tracking-tight text-white"
            style={OUTFIT}
          >
            {copy.heading}
          </h1>

          <p
            className="mt-4 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl mx-auto"
            style={{ color: 'rgba(255,255,255,0.65)' }}
          >
            {copy.sub}
          </p>
        </div>

        <QualifyFlow intent={intent} />
      </section>
    </main>
  );
}
