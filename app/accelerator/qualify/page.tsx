// ---------------------------------------------------------------------------
// Accelerator funnel, page 2 — the qualifier. Reached from /accelerator.
//
// Five questions, and the contact step is the last one but one. There is
// NO budget question: nothing in this funnel costs anything, and asking a
// firm what it can spend before handing it a free guide is the quickest
// way to lose the lead the funnel exists to collect.
//
// The fork is about what they are SHOWN, not whether they are helped —
// both branches get the guide. Clear the bar and the next page is the
// done-for-you pitch with a calendar under it; miss it and it is just the
// delivery confirmation.
//
// Mode "foundation" on the card underneath, so nobody is disqualified
// client-side and every answer reaches GoHighLevel even for a firm below
// the bar.
// ---------------------------------------------------------------------------
import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import FunnelLogo from '@/components/FunnelLogo';
import QualifyFlow from '@/components/demo/QualifyFlow';
import { ACCELERATOR_QUALIFICATION_STEPS } from '@/lib/qualification-steps';
import {
  ACCELERATOR_NEXT_PATH,
  ACCELERATOR_SENDING_PATH,
} from '@/lib/accelerator-config';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Where should we send it? | Nexli',
  robots: 'noindex, nofollow',
};

const OUTFIT: CSSProperties = {
  fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif",
};

export default function AcceleratorQualifyPage() {
  return (
    <main className="relative min-h-screen overflow-hidden" style={{ backgroundColor: '#0a0f1c' }}>
      <FunnelLogo />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[800px] h-[520px] rounded-full blur-[130px] bg-emerald-500/10" />
      </div>

      <section className="relative z-10 px-4 pt-24 pb-16 md:pt-28">
        <div className="text-center mb-8 md:mb-10">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-5"
            style={{ backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.25)' }}
          >
            <span
              className="text-[11px] font-bold tracking-[0.15em] uppercase"
              style={{ color: '#34d399' }}
            >
              Free — no card
            </span>
          </div>

          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-black leading-[1.1] tracking-tight text-white max-w-2xl mx-auto"
            style={OUTFIT}
          >
            Five quick questions, then it is yours.
          </h1>

          <p
            className="mt-4 hidden md:block text-base md:text-lg leading-relaxed max-w-xl mx-auto"
            style={{ color: 'rgba(255,255,255,0.65)' }}
          >
            They tell us which version of the playbook applies to your firm, and
            where to send it. About a minute.
          </p>
        </div>

        <QualifyFlow
          steps={ACCELERATOR_QUALIFICATION_STEPS}
          endpoint="/api/accelerator/qualify"
          // NO partialEndpoint, and this is deliberate — do not add one.
          //
          // The contact step is LAST here, because dropping budget left it
          // at the end of the list. QualificationProvider.handleContact
          // fires onContact and then advance(), and with no step after
          // contact that advance calls finish() in the SAME TICK. Both
          // callbacks would POST, both would run upsertLeadByEmail, and
          // leads.email has no unique constraint — so the two SELECTs both
          // miss and you get two rows for one person. The partial's
          // "already finished" guard reads a row written microseconds
          // earlier and loses the race, tagging a qualified lead as
          // incomplete forever.
          //
          // The advisory funnel is safe only because its contact step is
          // fifth of six, with a human answering a question in between.
          //
          // There is nothing to pre-bank anyway: abandon before contact
          // here and you have left no email.
          contentName="Accelerator Qualifier"
          qualifiedPath={ACCELERATOR_NEXT_PATH}
          unqualifiedPath={ACCELERATOR_SENDING_PATH}
          footnote="Five questions. About a minute. The guide is free either way."
        />
      </section>
    </main>
  );
}
