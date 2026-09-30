'use client';
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle, XCircle, Building2, Target, DollarSign, Crown, X } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { trackMetaEvent, generateEventId } from '@/lib/meta-events';
import { getAttribution } from '@/lib/attribution';
import {
  type QualificationAnswers,
  type QualificationStepDef,
  EMPTY_QUALIFICATION_ANSWERS,
  QUALIFICATION_STEPS,
  QUALIFICATION_STEP_COUNT,
  DISQUALIFYING_ROLE,
  DISQUALIFYING_REVENUE,
  decisionRoleOptions,
  goalOptions,
  goalTagMap,
  problemDurationOptions,
  annualRevenueOptions,
  taxSavingsOptions,
  taxSavingsTagMap,
} from '@/lib/qualification-steps';

// ---------------------------------------------------------------------------
// Qualification types & data — Optimized 6-step "High-Signal" funnel
// Geography → Authority → Intent → Duration → Revenue → Tax-Planning Value
// The data lives in lib/qualification-steps.ts (server-safe) and is
// re-exported here for client code.
// ---------------------------------------------------------------------------
export type { QualificationAnswers, QualificationStepDef, QualificationOption, QualificationStepKey } from '@/lib/qualification-steps';
export {
  EMPTY_QUALIFICATION_ANSWERS,
  QUALIFICATION_STEPS,
  QUALIFICATION_STEP_COUNT,
  DISQUALIFYING_ROLE,
  DISQUALIFYING_REVENUE,
  decisionRoleOptions,
  goalOptions,
  goalTagMap,
  problemDurationOptions,
  annualRevenueOptions,
  taxSavingsOptions,
  taxSavingsTagMap,
} from '@/lib/qualification-steps';

export type QualificationStatus = 'pending' | 'qualified' | 'not-qualified';

/**
 * 'call'       — the booking funnel: hard disqualifiers, POSTs to
 *                /api/forms/qualification, then onResult('qualified'|'not-qualified').
 * 'foundation' — Firm Foundation preview: nobody is disqualified, nothing is
 *                POSTed; the final step calls onComplete(answers).
 */
export type QualificationMode = 'call' | 'foundation';

// Map raw answer values to human-readable labels for Cal.com notes
function formatAnswersAsNotes(answers: QualificationAnswers): string {
  const roleLabel = decisionRoleOptions.find((o) => o.value === answers.decisionRole)?.label ?? answers.decisionRole;
  const goalLabel = goalOptions.find((o) => o.value === answers.goal)?.label ?? answers.goal;
  const durationLabel = problemDurationOptions.find((o) => o.value === answers.problemDuration)?.label ?? answers.problemDuration;
  const revenueLabel = annualRevenueOptions.find((o) => o.value === answers.annualRevenue)?.label ?? answers.annualRevenue;
  const taxSavingsLabel = taxSavingsOptions.find((o) => o.value === answers.taxSavings)?.label ?? answers.taxSavings;

  const lines = [
    '--- Prequalification Answers ---',
    `US Based: ${answers.usBased ? 'Yes' : 'No'}`,
    `Decision Role: ${roleLabel ?? 'N/A'}`,
    `Primary Goal: ${goalLabel ?? 'N/A'}`,
    `Goal Tag: ${answers.goalTag ?? 'N/A'}`,
    `Problem Duration: ${durationLabel ?? 'N/A'}`,
    `Annual Revenue: ${revenueLabel ?? 'N/A'}`,
    `Biggest Tax Savings: ${taxSavingsLabel ?? 'N/A'}`,
  ];
  return lines.join('\n');
}

const GHL_WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/yamjttuJWWdstfF9N0zu/webhook-trigger/c08ab845-6f7c-4016-bdf0-bbcb6b5782e6';

async function sendQualificationToServer(answers: QualificationAnswers, qualified: boolean, eventId?: string) {
  const attribution = getAttribution();
  try {
    // Send to server route (handles GHL webhook, DB insert, scoring, CAPI)
    await fetch('/api/forms/qualification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        qualified,
        us_based: answers.usBased,
        decision_role: answers.decisionRole,
        goal: answers.goal,
        goal_tag: answers.goalTag,
        problem_duration: answers.problemDuration,
        annual_revenue: answers.annualRevenue,
        tax_savings: answers.taxSavings,
        tax_savings_tag: answers.taxSavingsTag,
        event_id: eventId || null,
        attribution,
      }),
    });
  } catch {
    // Silently fail — don't block the user experience
    // Fallback: try direct GHL webhook
    fetch(GHL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'qualification-gate',
        qualified,
        us_based: answers.usBased,
        decision_role: answers.decisionRole,
        goal: answers.goal,
        goal_tag: answers.goalTag,
        problem_duration: answers.problemDuration,
        annual_revenue: answers.annualRevenue,
        tax_savings: answers.taxSavings,
        tax_savings_tag: answers.taxSavingsTag,
        submitted_at: new Date().toISOString(),
      }),
    }).catch(() => {});
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
interface QualificationContextType {
  openBooking: () => void;
  qualificationStatus: QualificationStatus;
}

const QualificationContext = createContext<QualificationContextType | undefined>(undefined);

export const useBooking = () => {
  const context = useContext(QualificationContext);
  if (!context) throw new Error('useBooking must be used within a QualificationProvider');
  return context;
};

// ---------------------------------------------------------------------------
// Qualification steps card — shared by the booking modal (overlay) and the
// Firm Foundation /foundation/start page (inline).
// ---------------------------------------------------------------------------
const STEP_ICONS: Record<QualificationStepDef['key'], React.ElementType> = {
  usBased: Building2,
  decisionRole: Crown,
  goal: Target,
  problemDuration: Target,
  annualRevenue: DollarSign,
  taxSavings: Crown,
};

const STEP_MOTION_KEYS: Record<QualificationStepDef['key'], string> = {
  usBased: 'q-us',
  decisionRole: 'q-decision',
  goal: 'q-goal',
  problemDuration: 'q-duration',
  annualRevenue: 'q-revenue',
  taxSavings: 'q-taxplan',
};

const OPTION_BUTTON_CLASS =
  'w-full text-left p-3 md:p-4 rounded-xl md:rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-main)] font-medium text-xs md:text-sm hover:border-blue-500/40 hover:bg-blue-500/5 active:scale-[0.99] transition-all cursor-pointer';

export interface QualificationStepsCardProps {
  mode?: QualificationMode;
  /** Call mode: fires on qualified / not-qualified exactly as the booking funnel always has. */
  onResult?: (status: QualificationStatus, answers: QualificationAnswers) => void;
  /** Foundation mode: fires once after the sixth answer. Also fired in call mode after 'qualified'. */
  onComplete?: (answers: QualificationAnswers) => void;
  /** Hide the icon/heading block (the host page supplies its own). */
  hideHeader?: boolean;
  /** Hide the six progress dots (the host page renders its own progress UI). */
  hideProgress?: boolean;
  /** Called on every step change with the zero-based index (for external progress UI). */
  onStepChange?: (step: number) => void;
}

export function QualificationStepsCard({
  mode = 'call',
  onResult,
  onComplete,
  hideHeader = false,
  hideProgress = false,
  onStepChange,
}: QualificationStepsCardProps) {
  const isCall = mode === 'call';
  const [step, setStepState] = useState(0);
  const [answers, setAnswers] = useState<QualificationAnswers>({ ...EMPTY_QUALIFICATION_ANSWERS });

  const setStep = (next: number) => {
    setStepState(next);
    onStepChange?.(next);
  };

  const disqualify = (updated: QualificationAnswers) => {
    sendQualificationToServer(updated, false);
    onResult?.('not-qualified', updated);
  };

  // Step 0: Geography — hard disqualifier (call mode only)
  const handleUsBased = (value: boolean) => {
    const updated = { ...answers, usBased: value };
    setAnswers(updated);
    if (isCall && !value) {
      disqualify(updated);
    } else {
      setStep(1);
    }
  };

  // Step 1: Authority — disqualifies non-decision-makers (call mode only)
  const handleDecisionRole = (value: string) => {
    const updated = { ...answers, decisionRole: value };
    setAnswers(updated);
    if (isCall && value === DISQUALIFYING_ROLE) {
      disqualify(updated);
    } else {
      setStep(2);
    }
  };

  // Step 2: Intent — no disqualifiers; store goal + derived tag
  const handleGoal = (value: string) => {
    const updated = { ...answers, goal: value, goalTag: goalTagMap[value] ?? null };
    setAnswers(updated);
    setStep(3);
  };

  // Step 3: Duration — no disqualifiers; informational
  const handleProblemDuration = (value: string) => {
    const updated = { ...answers, problemDuration: value };
    setAnswers(updated);
    setStep(4);
  };

  // Step 4: Revenue — under-400k is a hard disqualifier (call mode only)
  const handleAnnualRevenue = (value: string) => {
    const updated = { ...answers, annualRevenue: value };
    setAnswers(updated);
    if (isCall && value === DISQUALIFYING_REVENUE) {
      disqualify(updated);
    } else {
      setStep(5);
    }
  };

  // Step 5: Tax-planning value — no disqualifiers; store answer + derived segment tag, then finalize
  const handleTaxSavings = (value: string) => {
    const updated = { ...answers, taxSavings: value, taxSavingsTag: taxSavingsTagMap[value] ?? null };
    setAnswers(updated);
    if (isCall) {
      sendQualificationToServer(updated, true);
      onResult?.('qualified', updated);
    }
    onComplete?.(updated);
  };

  const optionHandlers: Record<QualificationStepDef['key'], (value: string) => void> = {
    usBased: () => undefined,
    decisionRole: handleDecisionRole,
    goal: handleGoal,
    problemDuration: handleProblemDuration,
    annualRevenue: handleAnnualRevenue,
    taxSavings: handleTaxSavings,
  };

  const totalSteps = QUALIFICATION_STEP_COUNT;
  const current = QUALIFICATION_STEPS[step];
  const Icon = STEP_ICONS[current.key];
  const hint = isCall ? current.hint : current.foundationHint;

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {!hideHeader && (
        <div className="text-center mb-6 md:mb-10">
          <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Target className="text-blue-400" size={28} />
          </div>
          <h3 className="text-[var(--text-main)] text-lg md:text-2xl font-bold mb-2">
            {isCall ? 'Tell Us About Your Firm' : 'Tell us about your firm'}
          </h3>
          <p className="text-[var(--text-muted)] text-xs md:text-sm max-w-md mx-auto">
            {isCall
              ? "We work exclusively with established CPA firms. A few quick questions to make sure we're the right fit."
              : 'So your preview fits your firm. Takes about a minute.'}
          </p>
        </div>
      )}

      {/* Progress dots */}
      {!hideProgress && (
        <div className="flex justify-center gap-2 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? 'w-8 bg-blue-500' : i < step ? 'w-4 bg-blue-500/50' : 'w-4 bg-[var(--glass-border)]'
              }`}
            />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={STEP_MOTION_KEYS[current.key]}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
          className={current.key === 'usBased' ? 'space-y-6' : 'space-y-4'}
        >
          <div className={`flex items-start gap-3 md:gap-4${current.key === 'usBased' ? '' : ' mb-2'}`}>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 flex-shrink-0">
              <Icon className="text-blue-400" size={20} />
            </div>
            <div>
              <p className="text-[var(--text-main)] font-bold text-sm md:text-lg">{current.question}</p>
              <p className="text-[var(--text-muted)] text-xs md:text-sm mt-1">{hint}</p>
            </div>
          </div>

          {current.key === 'usBased' ? (
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <button
                onClick={() => handleUsBased(true)}
                className="flex items-center justify-center gap-2 p-3 md:p-4 rounded-xl md:rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-main)] font-bold text-sm md:text-base hover:border-blue-500/40 hover:bg-blue-500/5 active:scale-[0.98] transition-all cursor-pointer"
              >
                <CheckCircle size={16} className="text-green-500" />
                Yes
              </button>
              <button
                onClick={() => handleUsBased(false)}
                className="flex items-center justify-center gap-2 p-3 md:p-4 rounded-xl md:rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-main)] font-bold text-sm md:text-base hover:border-red-500/40 hover:bg-red-500/5 active:scale-[0.98] transition-all cursor-pointer"
              >
                <XCircle size={16} className="text-red-400" />
                No
              </button>
            </div>
          ) : (
            <div className="space-y-2 md:space-y-3">
              {(current.options ?? []).map((opt) => (
                <button key={opt.value} onClick={() => optionHandlers[current.key](opt.value)} className={OPTION_BUTTON_CLASS}>
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Qualification Gate (modal version) — the overlay content used by the
// booking funnel. Kept as a named export for other callers.
// ---------------------------------------------------------------------------
export function QualificationGateModal({
  onResult,
  mode = 'call',
  onComplete,
}: {
  onResult: (status: QualificationStatus, answers: QualificationAnswers) => void;
  mode?: QualificationMode;
  onComplete?: (answers: QualificationAnswers) => void;
}) {
  return <QualificationStepsCard mode={mode} onResult={onResult} onComplete={onComplete} />;
}

// ---------------------------------------------------------------------------
// Not Qualified (modal version)
// ---------------------------------------------------------------------------
function NotQualifiedModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 text-center">
      <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
        <Building2 className="text-orange-400" size={32} />
      </div>
      <h3 className="text-[var(--text-main)] text-lg md:text-2xl font-bold mb-3">
        We Might Not Be the Right Fit — Yet
      </h3>
      <p className="text-[var(--text-muted)] text-sm md:text-base max-w-lg mx-auto mb-8 leading-relaxed">
        Our Digital Rainmaker system is built specifically for established, US-based CPA firms who need to amplify the business they&apos;re already getting — not generate it from scratch.
        If that&apos;s not where you are right now, no worries. We&apos;ve got a free resource that can help you get there.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a
          href="/free-guide"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-full text-sm font-bold hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-blue-600/20 group"
        >
          Get Our Free Guide
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </a>
        <button
          onClick={onClose}
          className="inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 rounded-full text-sm font-bold text-[var(--text-muted)] border border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-blue-500/30 active:scale-[0.98] transition-all"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export default function QualificationProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [qualificationStatus, setQualificationStatus] = useState<QualificationStatus>('pending');
  const answersRef = useRef<QualificationAnswers | null>(null);
  // Initialize Cal.com embed script once
  useEffect(() => {
    (function (C: any, A: string, L: string) {
      let p = function (a: any, ar: any) { a.q.push(ar); };
      let d = C.document;
      C.Cal = C.Cal || function () {
        let cal = C.Cal;
        let ar = arguments;
        if (!cal.loaded) {
          cal.ns = {};
          cal.q = cal.q || [];
          d.head.appendChild(d.createElement("script")).src = A;
          cal.loaded = true;
        }
        if (ar[0] === L) {
          const api: any = function () { p(api, arguments); };
          const namespace = ar[1];
          api.q = api.q || [];
          if (typeof namespace === "string") {
            cal.ns[namespace] = cal.ns[namespace] || api;
            p(cal.ns[namespace], ar);
            p(cal, ["initNamespace", namespace]);
          } else p(cal, ar);
          return;
        }
        p(cal, ar);
      };
    })(window, "https://app.cal.com/embed/embed.js", "init");

    const Cal = (window as any).Cal;
    Cal("init", "nexli-demo", { origin: "https://app.cal.com" });

    // Send prequalification data to GHL on successful booking, then redirect to /thank-you
    // (Meta pixel Lead + Schedule events now fire on the /thank-you page instead)
    Cal("on", {
      action: "bookingSuccessful",
      callback: (e: any) => {
        // Pages that run their own inline Cal embed handle their own booking
        // flow (and their own thank-you page) — never redirect those buyers to
        // the homepage funnel's /thank-you.
        const path = window.location.pathname;
        if (path.startsWith('/foundation') || path === '/demo' || path.startsWith('/demo/')) return;

        // Send prequalification answers to GHL with booking info
        const savedAnswers = answersRef.current;
        const bookingData = e?.detail?.data ?? {};
        if (savedAnswers) {
          fetch(GHL_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              source: 'booking-with-qualification',
              qualified: true,
              booking_uid: bookingData.uid ?? '',
              booking_confirmed: bookingData.confirmed ?? true,
              us_based: savedAnswers.usBased,
              decision_role: savedAnswers.decisionRole,
              goal: savedAnswers.goal,
              goal_tag: savedAnswers.goalTag,
              problem_duration: savedAnswers.problemDuration,
              annual_revenue: savedAnswers.annualRevenue,
              tax_savings: savedAnswers.taxSavings,
              tax_savings_tag: savedAnswers.taxSavingsTag,
              qualification_notes: formatAnswersAsNotes(savedAnswers),
              submitted_at: new Date().toISOString(),
            }),
          }).catch(() => {});
        }

        // The attendee's email is the only place in the whole funnel where we
        // learn who the visitor actually is. The inbound webhook above cannot
        // use it (it fires a workflow, it does not write the contact), so send
        // it to our own route as well: with an email, the server can upsert the
        // GoHighLevel contact and attach every qualifier answer to it.
        const attendeeEmail = bookingData.booking?.attendees?.[0]?.email
          || bookingData.attendees?.[0]?.email
          || '';
        const attendeeName = bookingData.booking?.attendees?.[0]?.name
          || bookingData.attendees?.[0]?.name
          || '';

        if (savedAnswers && attendeeEmail) {
          fetch('/api/forms/qualification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              qualified: true,
              us_based: savedAnswers.usBased,
              decision_role: savedAnswers.decisionRole,
              goal: savedAnswers.goal,
              goal_tag: savedAnswers.goalTag,
              problem_duration: savedAnswers.problemDuration,
              annual_revenue: savedAnswers.annualRevenue,
              tax_savings: savedAnswers.taxSavings,
              tax_savings_tag: savedAnswers.taxSavingsTag,
              email: attendeeEmail,
              name: attendeeName,
              booking_uid: bookingData.uid ?? '',
              stage: 'booked',
              attribution: getAttribution(),
            }),
            keepalive: true,
          }).catch(() => {});
        }

        // Redirect to thank-you page (fires Meta Lead + Schedule pixel events)
        // then thank-you page links to /booking-confirmed for call prep
        const params = new URLSearchParams();
        if (attendeeEmail) params.set('email', attendeeEmail);
        if (attendeeName) params.set('name', attendeeName);
        const qs = params.toString();
        window.location.href = `/thank-you${qs ? `?${qs}` : ''}`;
      },
    });

  }, []);

  const openCalPopup = useCallback(() => {
    const savedAnswers = answersRef.current;
    const notes = savedAnswers ? formatAnswersAsNotes(savedAnswers) : undefined;
    const calLink = notes
      ? `nexli-automation-6fgn8j/nexli-demo?notes=${encodeURIComponent(notes)}`
      : 'nexli-automation-6fgn8j/nexli-demo';

    const fallbackUrl = `https://cal.com/${calLink}`;

    const Cal = (window as any).Cal;
    console.log('[Nexli] openCalPopup called', { Cal: !!Cal, ns: Cal?.ns, nexliDemo: Cal?.ns?.["nexli-demo"], calLink });

    if (Cal && Cal.ns && Cal.ns["nexli-demo"]) {
      console.log('[Nexli] Calling Cal.ns["nexli-demo"]("modal", ...)');
      Cal.ns["nexli-demo"]("modal", {
        calLink,
        config: { "layout": "month_view", "theme": theme },
      });
    } else {
      console.log('[Nexli] Cal embed not ready, opening fallback URL');
      window.location.href = fallbackUrl;
    }
  }, [theme]);

  const openBooking = useCallback(() => {
    if (qualificationStatus === 'qualified') {
      openCalPopup();
    } else {
      setQualificationStatus('pending');
      setIsOpen(true);
    }
  }, [qualificationStatus, openCalPopup]);

  const handleResult = useCallback((status: QualificationStatus, answers: QualificationAnswers) => {
    setQualificationStatus(status);
    answersRef.current = answers;
    if (status === 'qualified') {
      // Fire Meta Pixel CompleteRegistration with dedup eventId
      const eventId = generateEventId();
      trackMetaEvent('CompleteRegistration', {
        content_name: 'Qualified CPA Firm',
        content_category: 'Qualification',
      }, eventId);
      // Pass eventId to server so CAPI can deduplicate
      sendQualificationToServer(answers, true, eventId);
      setIsOpen(false);
      setTimeout(() => {
        openCalPopup();
      }, 500);
    }
  }, [openCalPopup]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    // Reset to pending if they were not-qualified so they can try again later
    if (qualificationStatus === 'not-qualified') {
      setTimeout(() => setQualificationStatus('pending'), 300);
    }
  }, [qualificationStatus]);

  return (
    <QualificationContext.Provider value={{ openBooking, qualificationStatus }}>
      {children}

      {/* Fullscreen Qualification Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={closeModal}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative z-10 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto glass-card rounded-2xl md:rounded-[48px] border border-[var(--glass-border)] shadow-3xl p-6 md:p-12"
            >
              {/* Close button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 md:top-6 md:right-6 w-8 h-8 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-blue-500/30 transition-all z-20"
              >
                <X size={16} />
              </button>

              {qualificationStatus !== 'not-qualified' ? (
                <QualificationGateModal onResult={handleResult} />
              ) : (
                <NotQualifiedModal onClose={closeModal} />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </QualificationContext.Provider>
  );
}
