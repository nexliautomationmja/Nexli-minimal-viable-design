// ---------------------------------------------------------------------------
// Demo funnel, page 1 — /demo-opt-in
// Left: the pitch. Right: the form. Below: what's behind the door.
// ---------------------------------------------------------------------------
import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { CreditCard, Layout, MonitorSmartphone, Timer } from 'lucide-react';
import FunnelLogo from '@/components/FunnelLogo';
import OptInForm from '@/components/demo/OptInForm';
import ClientExperienceCards from '@/components/demo/ClientExperienceCards';
import { DEMO_FIRM_NAME, DEMO_HEADLINE } from '@/lib/demo-config';

export const metadata: Metadata = {
  title: 'What a $15,000 advisory client sees before they pay you | Nexli',
  description:
    'The firms charging advisory fees do not look like $800 filing shops. See what they look like — free guest access, no card, no call.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/demo-opt-in' },
  openGraph: {
    title: 'What a $15,000 advisory client sees before they pay you | Nexli',
    description:
      'The firms charging advisory fees do not look like $800 filing shops. See what they look like. No card, no call.',
    url: '/demo-opt-in',
    type: 'website',
  },
};

const OUTFIT: CSSProperties = {
  fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif",
};
const CANVAS = '#0a0f1c';

const BENEFITS = [
  {
    icon: MonitorSmartphone,
    title: 'A firm that looks worth $15,000',
    text: `A full firm site (${DEMO_FIRM_NAME}) in dark and light, on desktop and phone. The same template your own build starts from.`,
  },
  {
    icon: Layout,
    title: 'Clients who pay without being chased',
    text: 'Invoices, engagement letters, document requests and messaging — click through every tab yourself.',
  },
  {
    icon: CreditCard,
    title: 'No card, no call',
    text: 'Nothing to buy and nothing to book. Access opens the second you submit the form.',
  },
  {
    icon: Timer,
    title: 'Takes 30 seconds',
    text: 'Five fields. You are inside the sandbox on the next screen.',
  },
];

export default function DemoOptInPage() {
  return (
    <div
      className="min-h-screen text-white"
      style={{ background: CANVAS, fontFamily: "'Outfit', system-ui, sans-serif" }}
    >
      <FunnelLogo />

      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[70vh]"
        style={{
          background: 'radial-gradient(60% 60% at 50% 0%, rgba(59,130,246,0.14) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <main className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-28 md:pt-32 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-start">
          {/* ---- Left: the pitch ------------------------------------- */}
          <section>
            <span className="inline-flex items-center rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 uppercase tracking-[0.2em] text-[10px] font-black px-3.5 py-1.5">
              Free guest access
            </span>

            <h1
              className="mt-5 text-[2rem] sm:text-4xl md:text-5xl font-black tracking-[-0.035em] leading-[1.05] text-white"
              style={OUTFIT}
            >
              {DEMO_HEADLINE}
            </h1>

            <p className="mt-5 text-base md:text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
              The firms charging advisory fees are not smarter than you — they just do not look like a $800 filing
              shop. This is what that looks like. Open the sandbox and click through it yourself before you decide
              anything.
            </p>

            <ul className="mt-8 space-y-4">
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
                      <span className="block text-sm md:text-base font-bold text-white" style={OUTFIT}>
                        {b.title}
                      </span>
                      <span className="mt-0.5 block text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        {b.text}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* ---- Right: the form -------------------------------------- */}
          <section id="opt-in" className="lg:sticky lg:top-24">
            <OptInForm />
          </section>
        </div>

        {/* ---- What a client actually experiences ---------------------- */}
        <section className="mt-16 md:mt-24">
          <div className="text-center max-w-2xl mx-auto">
            <span
              className="inline-flex items-center rounded-full border px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400"
              style={{ background: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.2)' }}
            >
              What a client actually experiences
            </span>
            <h2
              className="mt-5 text-2xl sm:text-3xl md:text-[2.25rem] font-black tracking-[-0.03em] leading-[1.1] text-white"
              style={OUTFIT}
            >
              Three moments that decide what they think you are worth.
            </h2>
            <p className="mt-4 text-sm sm:text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Tap any one to see what happens underneath it.
            </p>
          </div>

          <div className="mt-10">
            <ClientExperienceCards />
          </div>
        </section>
      </main>
    </div>
  );
}
