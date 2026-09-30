'use client';

// ---------------------------------------------------------------------------
// Demo funnel, page 1 — the only form in the funnel.
// Posts to /api/demo/opt-in, which sets the signed cookie and hands back the
// next path (/demo).
// ---------------------------------------------------------------------------
import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle, Loader2, ShieldCheck } from 'lucide-react';
import { trackLeadEvent } from '@/lib/meta-events';

const OUTFIT: React.CSSProperties = {
  fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif",
};

const inputCls =
  'w-full rounded-xl border px-4 py-3 text-sm sm:text-base text-white placeholder:text-white/30 outline-none transition-colors focus:border-blue-500';
const inputStyle: React.CSSProperties = {
  backgroundColor: 'rgba(255,255,255,0.04)',
  borderColor: 'rgba(255,255,255,0.1)',
};
const errorInputStyle: React.CSSProperties = {
  backgroundColor: 'rgba(255,255,255,0.04)',
  borderColor: 'rgba(248,113,113,0.6)',
};
const labelCls = 'block text-[11px] font-bold tracking-[0.15em] uppercase mb-1.5';
const labelStyle: React.CSSProperties = { color: 'rgba(255,255,255,0.5)' };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldKey = 'firstName' | 'lastName' | 'email' | 'phone' | 'firmName';

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  firmName: string;
  marketingSmsOptIn: boolean;
}

const EMPTY: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  firmName: '',
  marketingSmsOptIn: false,
};

function ConsentRow({
  checked,
  onToggle,
  children,
}: {
  checked: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={checked}
      className="w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-colors hover:border-blue-500/30"
      style={{
        background: 'rgba(255,255,255,0.03)',
        borderColor: checked ? 'rgba(37,99,235,0.5)' : 'rgba(255,255,255,0.08)',
      }}
    >
      <span
        className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
          checked ? 'bg-blue-600 border-blue-600' : ''
        }`}
        style={checked ? undefined : { borderColor: 'rgba(255,255,255,0.2)' }}
        aria-hidden="true"
      >
        {checked && <CheckCircle className="text-white" size={12} />}
      </span>
      <span className="flex-1 text-[11px] md:text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.72)' }}>
        {children}
      </span>
    </button>
  );
}

export default function OptInForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const set = useCallback(
    (key: keyof FormState, value: string | boolean) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        if (!(key in prev)) return prev;
        const next = { ...prev };
        delete next[key as FieldKey];
        return next;
      });
    },
    [],
  );

  const validate = useCallback((): Partial<Record<FieldKey, string>> => {
    const next: Partial<Record<FieldKey, string>> = {};
    if (!form.firstName.trim()) next.firstName = 'Enter your first name.';
    if (!form.lastName.trim()) next.lastName = 'Enter your last name.';
    if (!EMAIL_RE.test(form.email.trim())) next.email = 'Enter a valid work email.';
    if (form.phone.replace(/\D/g, '').length < 10) next.phone = 'Enter a mobile number with at least 10 digits.';
    if (!form.firmName.trim()) next.firmName = 'Enter your firm name.';
    else if (form.firmName.trim().length > 200) next.firmName = 'Firm name is too long.';
    return next;
  }, [form]);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (pending) return;

      const found = validate();
      setErrors(found);
      if (Object.keys(found).length > 0) return;

      setPending(true);
      setSubmitError(null);

      const { eventId, attribution } = trackLeadEvent('Nexli Demo - Guest Access');

      try {
        const res = await fetch('/api/demo/opt-in', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            firmName: form.firmName.trim(),
            marketingSmsOptIn: form.marketingSmsOptIn,
            // Consent for service texts is given by the disclosure above the
            // submit button; marketing consent is the checkbox and only that.
            nonMarketingSmsOptIn: true,
            event_id: eventId,
            attribution,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          next?: string;
          error?: string;
        };
        if (!res.ok || !data.ok || !data.next) {
          throw new Error(data.error || 'Something went wrong. Please try again.');
        }
        router.push(data.next);
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
        setPending(false);
      }
    },
    [form, pending, router, validate],
  );

  const field = (
    key: FieldKey,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement>,
  ) => (
    <div>
      <label htmlFor={`demo-${key}`} className={labelCls} style={labelStyle}>
        {label}
      </label>
      <input
        id={`demo-${key}`}
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
        disabled={pending}
        aria-invalid={errors[key] ? true : undefined}
        aria-describedby={errors[key] ? `demo-${key}-error` : undefined}
        className={inputCls}
        style={errors[key] ? errorInputStyle : inputStyle}
        {...props}
      />
      {errors[key] && (
        <p id={`demo-${key}-error`} className="mt-1.5 text-xs font-semibold" style={{ color: '#f87171' }}>
          {errors[key]}
        </p>
      )}
    </div>
  );

  return (
    <div
      className="rounded-2xl border p-5 sm:p-7"
      style={{
        background: 'rgba(255,255,255,0.03)',
        borderColor: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <h2 className="text-xl sm:text-2xl font-black tracking-[-0.02em] text-white" style={OUTFIT}>
        See it for yourself
      </h2>
      <p className="mt-1.5 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
        30 seconds and you are inside. No credit card, no sales call.
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field('firstName', 'First name', {
            type: 'text',
            autoComplete: 'given-name',
            placeholder: 'Jane',
          })}
          {field('lastName', 'Last name', {
            type: 'text',
            autoComplete: 'family-name',
            placeholder: 'Smith',
          })}
        </div>

        {field('email', 'Work email', {
          type: 'email',
          inputMode: 'email',
          autoComplete: 'email',
          placeholder: 'jane@yourfirm.com',
        })}

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

        {/*
          MARKETING consent must stay an unticked, affirmative opt-in: the TCPA
          does not accept a pre-ticked box as prior express written consent, and
          carriers reject A2P 10DLC campaigns that collect it that way.
          Non-marketing (service) texts about the guest access they just asked
          for are covered by the disclosure under the button instead.
        */}
        <div className="pt-1">
          <ConsentRow
            checked={form.marketingSmsOptIn}
            onToggle={() => set('marketingSmsOptIn', !form.marketingSmsOptIn)}
          >
            Text me tips and offers too. I consent to receive marketing text messages from{' '}
            <strong className="text-white">Nexli Automation LLC</strong> at the phone number provided. Frequency may
            vary. Message &amp; data rates may apply. Text HELP for assistance, reply STOP to opt out.
          </ConsentRow>
        </div>

        {submitError && (
          <div
            className="p-3 rounded-xl border text-xs font-semibold"
            style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.25)', color: '#fca5a5' }}
            role="alert"
          >
            {submitError}
          </div>
        )}

        <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
          By unlocking your guest access you agree we may text or email you about it — your access link and anything
          you ask us for. Message and data rates may apply; reply STOP to opt out.
        </p>

        <button
          type="submit"
          disabled={pending}
          className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 rounded-full font-bold text-white px-6 py-4 text-sm sm:text-base transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          style={{ boxShadow: '0 14px 40px -12px rgba(37,99,235,0.8)' }}
        >
          {pending ? (
            <>
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
              Opening the sandbox…
            </>
          ) : (
            <>
              Show me the sandbox
              <ArrowRight size={18} aria-hidden="true" />
            </>
          )}
        </button>

        <p className="flex items-center justify-center gap-1.5 text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
          <ShieldCheck size={12} aria-hidden="true" />
          No card. No call required. Unsubscribe any time.
        </p>

        <p className="text-center text-[10px] leading-relaxed italic" style={{ color: 'rgba(255,255,255,0.35)' }}>
          View our{' '}
          <a href="/privacy" className="underline hover:text-blue-400 transition-colors">
            Privacy Policy
          </a>{' '}
          and{' '}
          <a href="/terms" className="underline hover:text-blue-400 transition-colors">
            Terms &amp; Conditions
          </a>
          .
        </p>
      </form>
    </div>
  );
}

