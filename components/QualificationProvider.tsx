'use client';
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle, XCircle, Building2, Target, DollarSign, Crown, X, User, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import { trackMetaEvent, generateEventId } from '@/lib/meta-events';
import { getAttribution } from '@/lib/attribution';
import { ADVISORY_PATH } from '@/lib/advisory-config';
import {
  type ContactErrors,
  type ContactInput,
  validateContact,
} from '@/lib/contact-validation';
import {
  type QualificationAnswers,
  type QualificationContact,
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
export type {
  QualificationAnswers,
  QualificationContact,
  QualificationStepDef,
  QualificationOption,
  QualificationStepKey,
} from '@/lib/qualification-steps';
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
// Partial on purpose. These used to be exhaustive Records keyed by step, so
// adding a question meant editing three lookups and a ternary before the
// thing would even compile. A step now only needs an entry here if it wants
// something other than the default icon.
const STEP_ICONS: Partial<Record<QualificationStepDef['key'], React.ElementType>> = {
  usBased: Building2,
  decisionRole: Crown,
  goal: Target,
  problemDuration: Target,
  annualRevenue: DollarSign,
  taxSavings: Crown,
  contact: User,
  budget: Wallet,
};

const OPTION_BUTTON_CLASS =
  'w-full text-left p-3 md:p-4 rounded-xl md:rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-main)] font-medium text-xs md:text-sm hover:border-blue-500/40 hover:bg-blue-500/5 active:scale-[0.99] transition-all cursor-pointer';

// ---------------------------------------------------------------------------
// Contact step — the only step that cannot advance on a single click.
//
// It sits mid-qualifier rather than in front of it: by the time a visitor
// reaches this they have answered three questions, and it comes BEFORE the
// budget question so a firm that fails on budget has still identified itself.
// That is who the downsell is for.
// ---------------------------------------------------------------------------
const EMPTY_CONTACT: ContactInput = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  firmName: '',
};

const FIELD_CLASS =
  'w-full px-3.5 py-3 rounded-xl border bg-[var(--glass-bg)] text-[var(--text-main)] text-sm placeholder:text-[var(--text-muted)]/60 outline-none transition-colors focus:border-blue-500/50';

function ContactStep({
  onSubmit,
}: {
  onSubmit: (value: QualificationContact) => void;
}) {
  const [form, setForm] = useState<ContactInput>({ ...EMPTY_CONTACT });
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [smsError, setSmsError] = useState(false);
  const [errors, setErrors] = useState<ContactErrors>({});

  const set = (key: keyof ContactInput, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    // Clear this field's error the moment they start fixing it.
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateContact(form);
    // Consent is required to continue, so it gets the same treatment as a
    // missing field rather than failing silently.
    setSmsError(!smsOptIn);
    if (Object.keys(found).length || !smsOptIn) {
      setErrors(found);
      return;
    }
    onSubmit({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      firmName: form.firmName.trim(),
      marketingSmsOptIn: smsOptIn,
    });
  };

  const field = (
    key: keyof ContactInput,
    label: string,
    extra: React.InputHTMLAttributes<HTMLInputElement>,
  ) => (
    <div>
      <label htmlFor={`q-${key}`} className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">
        {label}
        {/* Every field here is required. Marking them says so before the
            visitor finds out by failing. The asterisk is aria-hidden and
            `required` on the input carries the same fact to a screen
            reader, so it is not read out as punctuation mid-label. */}
        <span className="ml-0.5 text-red-400" aria-hidden="true">
          *
        </span>
      </label>
      <input
        id={`q-${key}`}
        value={form[key]}
        onChange={(ev) => set(key, ev.target.value)}
        required
        aria-invalid={errors[key] ? true : undefined}
        aria-describedby={errors[key] ? `q-${key}-err` : undefined}
        className={FIELD_CLASS}
        style={{ borderColor: errors[key] ? 'rgba(248,113,113,0.6)' : 'var(--glass-border)' }}
        {...extra}
      />
      {errors[key] && (
        <p id={`q-${key}-err`} className="mt-1 text-xs" style={{ color: '#fca5a5' }}>
          {errors[key]}
        </p>
      )}
    </div>
  );

  return (
    <form onSubmit={submit} noValidate className="space-y-3">
      <p className="text-[11px] text-[var(--text-muted)]">
        <span className="text-red-400" aria-hidden="true">
          *
        </span>{' '}
        All fields required
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {field('firstName', 'First name', { type: 'text', autoComplete: 'given-name', placeholder: 'Jane' })}
        {field('lastName', 'Last name', { type: 'text', autoComplete: 'family-name', placeholder: 'Smith' })}
      </div>
      {field('email', 'Work email', {
        type: 'email',
        inputMode: 'email',
        autoComplete: 'email',
        placeholder: 'jane@yourfirm.com',
      })}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {field('phone', 'Mobile phone', {
          type: 'tel',
          inputMode: 'tel',
          autoComplete: 'tel',
          placeholder: '+1 (555) 000-0000',
        })}
        {field('firmName', 'Firm name', {
          type: 'text',
          autoComplete: 'organization',
          placeholder: 'Smith & Associates CPAs',
        })}
      </div>

      {/*
        TCPA: unticked by default, so ticking it is an affirmative act by
        the visitor — which is what consent means. It is also REQUIRED to
        continue, on Marcel's instruction (13 Oct 2026).

        Requiring it is a deliberate trade, not an oversight. The rule that
        consent cannot be a condition applies to the purchase of goods or
        services; this gates a free consultation, so it sits outside that
        prong. Do not pre-tick it — that is the thing A2P 10DLC registration
        rejects, and a deregistered brand loses appointment reminders along
        with the marketing.
      */}
      <button
        type="button"
        onClick={() => {
          setSmsOptIn((v) => !v);
          setSmsError(false);
        }}
        aria-pressed={smsOptIn}
        className="flex w-full items-start gap-2.5 text-left pt-1"
      >
        <span
          className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors"
          style={{
            borderColor: smsOptIn ? '#2563eb' : 'var(--glass-border)',
            backgroundColor: smsOptIn ? '#2563eb' : 'transparent',
          }}
        >
          {smsOptIn && <CheckCircle size={11} className="text-white" />}
        </span>
        <span className="text-[11px] leading-relaxed text-[var(--text-muted)]">
          Text me occasional tips and offers
          <span className="ml-0.5 text-red-400" aria-hidden="true">
            *
          </span>
          . Message and data rates may apply; reply STOP to opt out at any time.
        </span>
      </button>

      {smsError && (
        <p className="text-xs text-red-400" role="alert">
          Tick the box above to continue — we send call reminders and planning deadlines by text.
        </p>
      )}

      <button
        type="submit"
        className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-blue-500 active:scale-[0.98]"
        style={{ boxShadow: '0 14px 40px -12px rgba(37,99,235,0.8)' }}
      >
        Continue
        <ArrowRight size={16} aria-hidden="true" />
      </button>

      <p className="text-center text-[11px] text-[var(--text-muted)]">
        We use this to send your results and prepare the call. No spam.
      </p>
    </form>
  );
}

export interface QualificationStepsCardProps {
  mode?: QualificationMode;
  /**
   * Which questions to ask. Defaults to the original six, so every existing
   * caller is unchanged; the advisory funnel passes its own list, which ends
   * with a contact step and a budget question.
   */
  steps?: QualificationStepDef[];
  /** Call mode: fires on qualified / not-qualified exactly as the booking funnel always has. */
  onResult?: (status: QualificationStatus, answers: QualificationAnswers) => void;
  /**
   * Fires once after the final step. Also fired in call mode after
   * 'qualified'. `contact` is present only when the step list included a
   * contact step — existing callers can keep ignoring it.
   */
  onComplete?: (answers: QualificationAnswers, contact?: QualificationContact) => void;
  /**
   * Fires the moment the contact step is submitted, before the remaining
   * questions. Only meaningful for a step list that has a contact step
   * which is not last — the advisory funnel's is fifth of six.
   *
   * It exists so the details can be banked before someone abandons. The
   * handler must not block or throw: this fires while the next question is
   * already animating in, and nothing in the UI waits for it.
   */
  onContact?: (contact: QualificationContact, answersSoFar: QualificationAnswers) => void;
  /** Hide the icon/heading block (the host page supplies its own). */
  hideHeader?: boolean;
  /** Hide the six progress dots (the host page renders its own progress UI). */
  hideProgress?: boolean;
  /** Called on every step change with the zero-based index (for external progress UI). */
  onStepChange?: (step: number) => void;
}

export function QualificationStepsCard({
  mode = 'call',
  steps = QUALIFICATION_STEPS,
  onResult,
  onComplete,
  onContact,
  hideHeader = false,
  hideProgress = false,
  onStepChange,
}: QualificationStepsCardProps) {
  const isCall = mode === 'call';
  const [step, setStepState] = useState(0);
  const [answers, setAnswers] = useState<QualificationAnswers>({ ...EMPTY_QUALIFICATION_ANSWERS });
  const [contact, setContact] = useState<QualificationContact | null>(null);

  const setStep = (next: number) => {
    setStepState(next);
    onStepChange?.(next);
  };

  const disqualify = (updated: QualificationAnswers) => {
    sendQualificationToServer(updated, false);
    onResult?.('not-qualified', updated);
  };

  // Advancing is generic now: land the answer, then either disqualify (call
  // mode only) or move to the next step, finishing when there is no next.
  // Previously each step had its own handler with a literal setStep(n), so
  // inserting a question meant renumbering every handler after it.
  const finish = (updated: QualificationAnswers, withContact: QualificationContact | null) => {
    if (isCall) {
      sendQualificationToServer(updated, true);
      onResult?.('qualified', updated);
    }
    onComplete?.(updated, withContact ?? undefined);
  };

  const advance = (updated: QualificationAnswers, withContact = contact) => {
    setAnswers(updated);
    const next = step + 1;
    if (next < steps.length) setStep(next);
    else finish(updated, withContact);
  };

  const handleUsBased = (value: boolean) => {
    const updated = { ...answers, usBased: value };
    // Call mode disqualifies in the browser. The advisory funnel runs in
    // 'foundation' mode precisely so it does not: every answer is collected
    // and the server decides, so the reason is visible in GoHighLevel.
    if (isCall && !value) {
      setAnswers(updated);
      disqualify(updated);
      return;
    }
    advance(updated);
  };

  const handleChoice = (key: QualificationStepDef['key'], value: string) => {
    const updated: QualificationAnswers = { ...answers, [key]: value };
    if (key === 'goal') updated.goalTag = goalTagMap[value] ?? null;
    if (key === 'taxSavings') updated.taxSavingsTag = taxSavingsTagMap[value] ?? null;

    const hardNo =
      (key === 'decisionRole' && value === DISQUALIFYING_ROLE) ||
      (key === 'annualRevenue' && value === DISQUALIFYING_REVENUE);
    if (isCall && hardNo) {
      setAnswers(updated);
      disqualify(updated);
      return;
    }
    advance(updated);
  };

  const handleContact = (value: QualificationContact) => {
    setContact(value);
    // Bank it before they answer anything else. Wrapped because a throw
    // here would strand them on the contact step with no way forward, and
    // a lead we failed to pre-save is still a lead we can save at the end.
    try {
      onContact?.(value, answers);
    } catch {
      /* never block the flow */
    }
    advance(answers, value);
  };

  const totalSteps = steps.length;
  const current = steps[step];
  const Icon = STEP_ICONS[current.key] ?? Target;
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
          key={current.key}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
          className={current.type === 'boolean' ? 'space-y-6' : 'space-y-4'}
        >
          <div className={`flex items-start gap-3 md:gap-4${current.type === 'boolean' ? '' : ' mb-2'}`}>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 flex-shrink-0">
              <Icon className="text-blue-400" size={20} />
            </div>
            <div>
              <p className="text-[var(--text-main)] font-bold text-sm md:text-lg">{current.question}</p>
              <p className="text-[var(--text-muted)] text-xs md:text-sm mt-1">{hint}</p>
            </div>
          </div>

          {current.type === 'contact' ? (
            <ContactStep onSubmit={handleContact} />
          ) : current.type === 'boolean' ? (
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
                <button
                  key={opt.value}
                  onClick={() => handleChoice(current.key, opt.value)}
                  className={OPTION_BUTTON_CLASS}
                >
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
  const router = useRouter();
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
        if (
          path.startsWith('/foundation') ||
          path === '/demo' ||
          path.startsWith('/demo/') ||
          // The advisory funnel books through its own inline embed on the
          // 'advisory-growth-call' namespace and lands on /booking-confirmed-b.
          // That namespace already keeps it off this handler; the path check
          // is belt and braces, so a future page on the default namespace
          // cannot silently bypass /api/advisory-pricing/booked.
          path.startsWith('/advisory-pricing')
        ) {
          return;
        }

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
        // then thank-you page links to /booking-confirmed-b for call prep
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

  /**
   * Every "book a call" button on the site routes through here, so this is
   * the one place that decides where booking starts.
   *
   * It sends people to the advisory VSL — the top of the funnel, not the
   * qualifier and not the old modal.
   *
   * The video is the real first filter. It states the price and what the
   * system is built to produce, so anyone who reaches the questions has
   * been told before they answer. Dropping someone straight onto the form
   * gets you people who book a call on "yeah, sure" with no idea what they
   * are walking into — and the modal it replaced was worse again, because
   * anyone who failed its six questions hit a dead end with no contact
   * captured and nothing to downsell them.
   *
   * The modal below is left in place rather than ripped out. It is dead
   * weight while this points elsewhere, but removing it is a separate
   * change with its own blast radius.
   */
  const openBooking = useCallback(() => {
    router.push(ADVISORY_PATH);
  }, [router]);

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
