// ---------------------------------------------------------------------------
// Advisory funnel, page 1 — /advisory-pricing
//
// Left: the pitch. Right: the form. The form posts to the advisory opt-in
// route, which sets the shared signed cookie and returns the VSL.
//
// What this page sells is the VIDEO, not the $297 — the Accelerator is the
// downsell the qualifier routes to now, and nothing here should mention a
// price or a PDF. The headline deliberately poses the question the VSL opens
// by answering ("Stop competing for the $800 client. Get positioned for the
// $15,000 one") so the handoff reads as one conversation rather than a switch.
//
// No DeadlinePill either: December 31 is a tax-year argument for the $297
// play, and in front of a video about ads infrastructure it is a non-sequitur.
// It still runs on the offer page, where it is true.
// ---------------------------------------------------------------------------
import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { Megaphone, SearchX, Users } from 'lucide-react';
import FunnelLogo from '@/components/FunnelLogo';
import OptInForm from '@/components/demo/OptInForm';
// The Meta event name stays on the product, not the video. It pairs with the
// server CAPI contentName in the opt-in route, and renaming it would split
// this funnel's history in Events Manager for no gain.
import { ADVISORY_PRODUCT_NAME } from '@/lib/advisory-config';
// The headline figure is the engagement average the whole funnel runs on —
// $15,000, the midpoint of the $5,000-$25,000 band in lib/agency-offer.ts, and
// the same number in PipelineMath, the nurture emails and the call page.
// Derived rather than typed so the opt-in cannot drift from the rest.
import { AGENCY_ENGAGEMENT_AVG, usd } from '@/lib/agency-offer';

const HEADLINE_FEE = usd(AGENCY_ENGAGEMENT_AVG);

const TITLE = `Why the ${HEADLINE_FEE} client never calls your firm | Nexli`;
const DESCRIPTION =
  'A short video on what established CPA firms put in place before they spend a dollar on ads — and why the firms that skip it burn the budget finding out.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  robots: { index: true, follow: true },
  alternates: { canonical: '/advisory-pricing' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/advisory-pricing',
    type: 'website',
  },
};

const OUTFIT: CSSProperties = {
  fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif",
};
const CANVAS = '#0a0f1c';

const BENEFITS = [
  {
    icon: SearchX,
    title: `Why the ${HEADLINE_FEE} client cannot find you`,
    text: 'They are searching, and they are hiring someone. What they see when they look at your firm decides which — and most firms have never looked at it from that side.',
  },
  {
    icon: Megaphone,
    title: 'What has to exist before you run ads',
    text: 'Most firms turn ads on and conclude ads do not work for accountants. The ads were fine. The thing the ads pointed at was not.',
  },
  {
    icon: Users,
    title: 'What the firms winning them actually built',
    text: 'Not a bigger team and not a better website. A specific piece of infrastructure, and you can see it in the video.',
  },
];

export default function AdvisoryOptInPage() {
  return (
    <div
      className="min-h-screen text-white"
      style={{ background: CANVAS, fontFamily: "'Outfit', system-ui, sans-serif" }}
    >
      <FunnelLogo />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[70vh]"
        style={{
          background:
            'radial-gradient(60% 60% at 50% 0%, rgba(59,130,246,0.14) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <main className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-28 md:pt-32 pb-20">
        {/* Mobile order is headline -> form -> benefits. The form used to stack
            below the whole pitch, which put it ~970px down a 844px screen on
            the one page whose entire job is lead capture. Two lines of hook
            above it, the rest of the argument below. Desktop keeps the
            two-column layout via explicit row/column placement. */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-start">
          <section className="lg:col-start-1 lg:row-start-1">
            <span className="inline-flex items-center rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 uppercase tracking-[0.2em] text-[10px] font-black px-3.5 py-1.5">
              For established CPA firms · Free training
            </span>

            <h1
              className="mt-5 text-[2rem] sm:text-4xl md:text-5xl font-black tracking-[-0.035em] leading-[1.05] text-white"
              style={OUTFIT}
            >
              Why the {HEADLINE_FEE} client never calls your firm.
            </h1>

            <p
              className="mt-5 text-base md:text-lg leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.7)' }}
            >
              You are not short of skill or clients. You are short of the client who
              can write a five-figure cheque for advice without blinking — and right
              now they are hiring someone else. The video shows what has to be in
              place before you spend a dollar on ads.
            </p>

          </section>

          <section
            id="opt-in"
            className="order-2 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-24 lg:order-none"
          >
            <OptInForm
              endpoint="/api/advisory-pricing/opt-in"
              eventName={`${ADVISORY_PRODUCT_NAME} - Opt In`}
              ctaLabel="Watch the training"
              heading="Watch the training"
              subheading="Free, and it plays on the next page. Tell us where to send the replay."
              pendingLabel="Opening the training…"
              trustLine="No card. Unsubscribe any time."
            />
          </section>

          <section className="order-3 lg:col-start-1 lg:row-start-2 lg:order-none">
            <ul className="space-y-4">
              {BENEFITS.map((b) => {
                const Icon = b.icon;
                return (
                  <li key={b.title} className="flex items-start gap-3.5">
                    <span
                      className="inline-flex w-10 h-10 shrink-0 rounded-xl items-center justify-center"
                      style={{
                        background: 'rgba(59,130,246,0.12)',
                        border: '1px solid rgba(59,130,246,0.25)',
                        color: '#60a5fa',
                      }}
                    >
                      <Icon size={18} aria-hidden="true" />
                    </span>
                    <span>
                      <span
                        className="block text-sm md:text-base font-bold text-white"
                        style={OUTFIT}
                      >
                        {b.title}
                      </span>
                      <span
                        className="mt-0.5 block text-sm leading-relaxed"
                        style={{ color: 'rgba(255,255,255,0.6)' }}
                      >
                        {b.text}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
