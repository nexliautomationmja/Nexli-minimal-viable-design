'use client';

// ---------------------------------------------------------------------------
// Demo funnel — page 3. The six qualification questions.
//
// Why mode="foundation" and not mode="call":
// QualificationStepsCard in call mode short-circuits the moment it hits a
// disqualifier (step 0, 1 or 4), POSTs to /api/forms/qualification and hands
// back 'not-qualified' — and the booking funnel's QualificationProvider then
// renders its "We Might Not Be the Right Fit" modal. Neither is wanted here:
// in this funnel an unqualified firm is routed to a real offer, and we need
// all six answers regardless of the outcome. Foundation mode never
// disqualifies and never POSTs, so we collect the full set and decide the
// path ourselves with the same three rules the call mode applies.
// ---------------------------------------------------------------------------

import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import {
  QualificationStepsCard,
  type QualificationAnswers,
} from '@/components/QualificationProvider';
import {
  DISQUALIFYING_REVENUE,
  DISQUALIFYING_ROLE,
  QUALIFICATION_STEP_COUNT,
} from '@/lib/qualification-steps';
import { DEMO_CALL_PATH, DEMO_OFFER_PATH, type FunnelPath } from '@/lib/demo-config';
import { generateEventId, trackMetaEvent } from '@/lib/meta-events';
import { getAttribution } from '@/lib/attribution';

const OUTFIT: React.CSSProperties = {
  fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif",
};
const CARD: React.CSSProperties = {
  backgroundColor: 'rgba(255,255,255,0.03)',
  borderColor: 'rgba(255,255,255,0.08)',
};

/** The same three hard rules /api/demo/qualify applies server-side. */
export function decideFunnelPath(a: QualificationAnswers): FunnelPath {
  if (a.usBased === false) return 'web';
  if (a.decisionRole === DISQUALIFYING_ROLE) return 'web';
  if (a.annualRevenue === DISQUALIFYING_REVENUE) return 'web';
  return 'agency';
}

const QualifyFlow: React.FC<{ intent?: 'leads' | 'website' }> = ({ intent = 'leads' }) => {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  /**
   * A visitor who came through the "Claim the website" button was promised a
   * website, so if they qualify and get routed to the call instead, the call
   * page has to say the website is still theirs. The funnel path lives in the
   * database rather than a cookie, so that intent can only travel in the URL.
   * Only tag the call path — /demo/offer already gives them what they asked for.
   */
  const withIntent = useCallback(
    (next: string) =>
      intent === 'website' && next.startsWith(DEMO_CALL_PATH) ? `${next}?from=website` : next,
    [intent],
  );

  const handleComplete = useCallback(
    async (answers: QualificationAnswers) => {
      setSubmitting(true);

      // Browser pixel first so the server CAPI event can dedupe against it.
      const eventId = generateEventId();
      trackMetaEvent(
        'CompleteRegistration',
        { content_name: 'Demo Qualifier', content_category: 'Qualification' },
        eventId,
      );

      const fallback = decideFunnelPath(answers) === 'agency' ? DEMO_CALL_PATH : DEMO_OFFER_PATH;

      try {
        const res = await fetch('/api/demo/qualify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            answers,
            event_id: eventId,
            attribution: getAttribution(),
          }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.next) {
          // The answers are already banked client-side; never dead-end anyone.
          router.push(withIntent(fallback));
          return;
        }
        router.push(withIntent(data.next as string));
      } catch {
        router.push(withIntent(fallback));
      }
    },
    [router, withIntent],
  );

  const pct = submitting
    ? 100
    : Math.round((step / QUALIFICATION_STEP_COUNT) * 100);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress */}
      <div className="px-4 mb-6 md:mb-8">
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-[11px] font-bold tracking-[0.15em] uppercase"
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            {submitting
              ? 'Complete'
              : `Question ${Math.min(step + 1, QUALIFICATION_STEP_COUNT)} of ${QUALIFICATION_STEP_COUNT}`}
          </span>
          <span className="text-[11px] font-bold text-blue-400">{pct}%</span>
        </div>
        <div
          className="h-1.5 w-full rounded-full overflow-hidden"
          style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Card */}
      <div
        className="relative rounded-2xl md:rounded-3xl border py-8 md:py-10 overflow-hidden"
        style={CARD}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[520px] h-[220px] rounded-full blur-[110px] bg-blue-500/8 pointer-events-none" />

        <div className="relative z-10">
          {submitting ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-6 py-10 text-center"
            >
              <div
                className="w-14 h-14 mx-auto mb-5 rounded-2xl flex items-center justify-center border"
                style={{ backgroundColor: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.25)' }}
              >
                <Loader2 size={26} className="text-blue-400 animate-spin" />
              </div>
              <h3
                className="text-lg md:text-2xl font-black text-white mb-2"
                style={OUTFIT}
              >
                Matching you to the right next step...
              </h3>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                One moment while we line up what fits your firm.
              </p>
            </motion.div>
          ) : (
            <QualificationStepsCard
              mode="foundation"
              hideHeader
              hideProgress
              onStepChange={setStep}
              onComplete={handleComplete}
            />
          )}
        </div>
      </div>

      <p
        className="mt-5 px-4 text-center text-xs"
        style={{ color: 'rgba(255,255,255,0.4)' }}
      >
        Six questions. About a minute. No sales pitch until we know you are a fit.
      </p>
    </div>
  );
};

export default QualifyFlow;
