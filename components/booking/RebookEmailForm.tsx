'use client';

// ---------------------------------------------------------------------------
// /book for a browser we do not recognise: a firm that already qualified
// types the email it qualified with and goes straight to the calendar.
//
// A match sets the rebook pass (an httpOnly cookie, set by the API) and
// router.refresh() re-renders /book, which then shows the calendar. No match
// sends them to the qualifier: it takes about a minute, and it is the only
// way onto the calendar for a firm we have no record of.
// ---------------------------------------------------------------------------
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2 } from 'lucide-react';
import { ADVISORY_QUALIFY_PATH } from '@/lib/advisory-config';

type Status = 'idle' | 'sending' | 'not-found' | 'error';

export default function RebookEmailForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/advisory-pricing/rebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (data?.ok) {
        router.refresh();
        return;
      }
      if (res.ok) {
        setStatus('not-found');
        return;
      }
      setError(typeof data?.error === 'string' ? data.error : 'Something went wrong. Try again.');
      setStatus('error');
    } catch {
      setError('Something went wrong. Try again.');
      setStatus('error');
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row" noValidate>
        <label htmlFor="rebook-email" className="sr-only">
          The email you qualified with
        </label>
        <input
          id="rebook-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          required
          placeholder="you@yourfirm.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status !== 'sending') setStatus('idle');
          }}
          className="h-12 w-full min-w-0 rounded-full border sm:flex-1 border-white/12 bg-white/[0.05] px-5 text-[15px] text-white placeholder:text-white/35 outline-none transition-colors focus:border-cyan-400/60 focus:bg-white/[0.07]"
        />
        <button
          type="submit"
          disabled={status === 'sending' || !email.trim()}
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-6 text-sm font-bold text-white shadow-xl shadow-blue-600/25 transition-opacity disabled:opacity-50"
        >
          {status === 'sending' ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <>
              Continue
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      <div aria-live="polite" className="mt-4 min-h-[1.5rem] text-center text-sm">
        {status === 'error' && <p style={{ color: '#fca5a5' }}>{error}</p>}
        {status === 'not-found' && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-5">
            <p className="leading-relaxed text-white/80">
              We couldn&apos;t find a qualified firm under that email. Check it for a typo, or
              see if your firm qualifies. It takes about a minute.
            </p>
            <Link
              href={ADVISORY_QUALIFY_PATH}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 text-sm font-bold text-white no-underline shadow-xl shadow-blue-600/25"
            >
              See if you qualify
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>

      {status !== 'not-found' && (
        <p className="mt-2 text-center text-sm text-white/55">
          New here?{' '}
          <Link href={ADVISORY_QUALIFY_PATH} className="font-semibold text-cyan-300 no-underline hover:text-cyan-200">
            See if you qualify →
          </Link>
        </p>
      )}
    </div>
  );
}
