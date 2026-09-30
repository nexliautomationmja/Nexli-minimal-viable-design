'use client';
/**
 * Page 4B of the demo funnel — the self-serve offer for firms that did not
 * qualify for the agency call (and for qualified firms that would rather buy
 * the infrastructure than book).
 *
 * $999 one-time setup fee + $497/month, month-to-month. The sandbox is on
 * this page too, so the thing being bought is visible while they decide.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  CalendarCheck,
  Check,
  ChevronDown,
  CreditCard,
  ExternalLink,
  Info,
  Loader2,
  LayoutDashboard,
  Globe,
  Monitor,
  Moon,
  ShieldCheck,
  Smartphone,
  Sun,
  X,
} from 'lucide-react';
import FunnelLogo from '@/components/FunnelLogo';
import { trackMetaEvent, generateEventId } from '@/lib/meta-events';
import BrowserFrame, { type BrowserDevice } from '@/components/demo/BrowserFrame';
import PortalDemo from '@/components/demo/PortalDemo';
import {
  DEMO_CALL_PATH,
  DEMO_FIRM_ACCENT,
  DEMO_FIRM_ACCENT_2,
  DEMO_FIRM_NAME,
  DEMO_FIRM_OWNER,
  demoFirmLogo,
  DEMO_FIRM_SITE_PATH,
} from '@/lib/demo-config';
import {
  FOUNDATION_CURRENCY,
  FOUNDATION_FIRST_PAYMENT_DISPLAY,
  FOUNDATION_FIRST_PAYMENT_VALUE,
  FOUNDATION_GUARANTEE,
  FOUNDATION_LIVE_IN_DAYS,
  FOUNDATION_PERIOD_LABEL,
  FOUNDATION_PRICE_DISPLAY,
  FOUNDATION_PRODUCT_ID,
  FOUNDATION_PRODUCT_NAME,
  FOUNDATION_SETUP_FEE_DISPLAY,
  RAINMAKER_NAME,
  RAINMAKER_PATH,
} from '@/lib/foundation-config';

type Theme = 'dark' | 'light';

const CANVAS = '#0a0f1c';
const SYNE: React.CSSProperties = { fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif" };
const CARD: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  borderColor: 'rgba(255,255,255,0.08)',
};

// The iframed firm site reports its theme out and accepts one in.
const THEME_MESSAGE_OUT = 'firm-site-theme';
const THEME_MESSAGE_IN = 'set-firm-site-theme';

function isTheme(v: unknown): v is Theme {
  return v === 'dark' || v === 'light';
}

/* ------------------------------------------------------------------------ */
/* Small UI pieces                                                           */
/* ------------------------------------------------------------------------ */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="relative inline-flex items-center rounded-full overflow-hidden"
      style={{ isolation: 'isolate', padding: '1.5px' }}
    >
      <span
        aria-hidden="true"
        className="absolute"
        style={{
          left: '-60%',
          top: '-60%',
          width: '220%',
          aspectRatio: '1 / 1',
          transformOrigin: 'center',
          animation: 'shimmer 3s linear infinite',
          zIndex: -2,
          background:
            'conic-gradient(from 90deg at 50% 50%, #3b82f6 0%, #8b5cf6 25%, #06b6d4 50%, #10b981 75%, #3b82f6 100%)',
        }}
      />
      <span
        aria-hidden="true"
        className="absolute rounded-full"
        style={{ inset: 1.5, zIndex: -1, background: 'rgba(10,15,28,0.92)' }}
      />
      <span className="relative px-3.5 py-1.5 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-white">
        {children}
      </span>
    </span>
  );
}

function GlassCard({
  children,
  className = '',
  style,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={`rounded-2xl border p-6 ${className}`}
      style={{ ...CARD, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', ...style }}
    >
      {children}
    </div>
  );
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; icon?: React.ReactNode }[];
  label: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex items-center gap-1 rounded-full p-1"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
            style={{
              background: active ? '#2563eb' : 'transparent',
              color: active ? '#fff' : 'rgba(255,255,255,0.65)',
              boxShadow: active ? '0 6px 20px -8px rgba(37,99,235,0.8)' : 'none',
            }}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  sub,
  id,
}: {
  eyebrow: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  id?: string;
}) {
  return (
    <div id={id} className="max-w-3xl scroll-mt-24">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2
        className="mt-4 text-2xl sm:text-3xl md:text-[2.5rem] font-black tracking-[-0.03em] leading-[1.08] text-white"
        style={SYNE}
      >
        {title}
      </h2>
      {sub && (
        <p className="mt-4 text-base md:text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
          {sub}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* What's included                                                           */
/* ------------------------------------------------------------------------ */

const INCLUDED: { title: string; body: string }[] = [
  {
    title: 'A custom website on your own domain',
    body: 'Designed for your firm and built on our framework — fast, mobile-first, and written to turn searchers into booked consultations.',
  },
  {
    title: 'Your branded client portal',
    body: 'Your logo, your colours, your domain. Clients log in to your firm, not to a piece of software with our name on it.',
  },
  {
    title: 'Invoicing with online payments',
    body: 'Send invoices from the portal and clients pay by card or bank transfer. The money lands in your own bank account — we never touch it.',
  },
  {
    title: 'Engagement letters with e-signature',
    body: 'Send, track and countersign engagement letters in the portal. No more printing, scanning or chasing PDFs by email.',
  },
  {
    title: 'Document collection that clients finish',
    body: 'Request lists, reminders and a secure upload area, so you stop rebuilding the same tax-organiser email thread every January.',
  },
  {
    title: 'Secure client messaging',
    body: 'One thread per client, inside the portal, so sensitive documents and questions stay out of plain email.',
  },
  {
    title: 'Hosting, SSL and daily backups',
    body: 'We host it, secure it, patch it and back it up. Nothing to install, nothing to renew, nobody to chase when it breaks.',
  },
  {
    title: 'Onboarding and training for your team',
    body: 'We migrate your details, set up your services and walk your staff through the portal until they are comfortable with it.',
  },
  {
    title: `Live in ${FOUNDATION_LIVE_IN_DAYS} days`,
    body: 'One kickoff call, one review round, then it goes live on your domain. No six-month agency project.',
  },
  {
    title: 'Unlimited content edits',
    body: 'Email us any copy, page or service change while you are subscribed and we make it. No hourly rates, no change orders.',
  },
];

const NOT_INCLUDED = [
  'Paid advertising and campaign management',
  'Lead generation and outbound',
  'AI automations — missed-call text-back, 24/7 intake, nurture sequences',
  'The Google review engine',
];

/* ------------------------------------------------------------------------ */
/* FAQ                                                                       */
/* ------------------------------------------------------------------------ */

const FAQS: { q: string; a: string }[] = [
  {
    q: 'How is this different from TaxDome or Canopy?',
    a: `Those are software subscriptions you configure, run and pay for per seat — and neither of them does anything for your marketing website. ${FOUNDATION_PRODUCT_NAME} is done-for-you: we design and build your website, we set up and brand your client portal, we host both, and we keep making changes for you. One flat fee, no per-seat pricing, and a real team behind it instead of a help centre.`,
  },
  {
    q: `What is the ${FOUNDATION_SETUP_FEE_DISPLAY} setup fee for?`,
    a: `The build itself: the design of your site, writing every page around your services, configuring and branding your portal, migrating your details, connecting your domain and payments, and training your team. It is a one-time charge on your first invoice — it is not charged again, and there is no second setup fee if you later add anything.`,
  },
  {
    q: 'Do I own my website?',
    a: 'Your content, your brand assets, your domain and all of your client data are yours, always. The site framework and the portal software are licensed to you while your subscription is active. If you ever leave, we hand you a full export of your content and your client data.',
  },
  {
    q: 'Can I cancel?',
    a: `Yes — it is month to month with no minimum term. Cancel any time with 30 days' notice and you are billed for that final month only. The ${FOUNDATION_SETUP_FEE_DISPLAY} setup fee is non-refundable once we have started building.`,
  },
  {
    q: 'Can I upgrade to the full system later?',
    a: `Yes. ${FOUNDATION_PRODUCT_NAME} is the foundation the ${RAINMAKER_NAME} plugs into. When you are ready for paid ads, the AI automation layer and the review engine, your website and portal carry over exactly as they are — we add the growth layer on top, nothing gets rebuilt.`,
  },
];

/* ------------------------------------------------------------------------ */
/* Props                                                                     */
/* ------------------------------------------------------------------------ */

export interface OfferPageProps {
  firstName: string;
  firmName: string;
  /** True when the visitor also qualified for the agency call. */
  qualifiedForCall?: boolean;
  /** Stripe sent them back without paying. */
  cancelled?: boolean;
}

/* ------------------------------------------------------------------------ */
/* Page                                                                      */
/* ------------------------------------------------------------------------ */

export default function OfferPage({
  firstName,
  firmName,
  qualifiedForCall = false,
  cancelled = false,
}: OfferPageProps) {
  /* ---- sandbox: tabs, theme, device ------------------------------------ */
  const [theme, setTheme] = useState<Theme>('dark');
  const [device, setDevice] = useState<BrowserDevice>('desktop');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeReady, setIframeReady] = useState(false);
  const [src, setSrc] = useState(`${DEMO_FIRM_SITE_PATH}?theme=dark`);

  // Lifted from the preview experience: prefer postMessage, fall back to a
  // reload with ?theme= when the iframe has not announced itself yet.
  const changeTheme = useCallback((next: Theme) => {
    setTheme(next);
    const win = iframeRef.current?.contentWindow;
    if (iframeReady && win) {
      try {
        win.postMessage({ type: THEME_MESSAGE_IN, theme: next }, window.location.origin);
        return;
      } catch {
        /* fall through to reload */
      }
    }
    setSrc(`${DEMO_FIRM_SITE_PATH}?theme=${next}`);
  }, [iframeReady]);

  const changeDevice = useCallback(
    (next: BrowserDevice) => {
      setDevice(next);
      setIframeReady(false);
      setSrc(`${DEMO_FIRM_SITE_PATH}?theme=${theme}`);
    },
    [theme],
  );

  // The iframed site reports its theme on load and whenever its own toggle fires.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== iframeRef.current?.contentWindow) return;
      const data = event.data as { type?: string; theme?: unknown } | null;
      if (!data || data.type !== THEME_MESSAGE_OUT || !isTheme(data.theme)) return;
      setIframeReady(true);
      setTheme(data.theme);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  /* ---- ViewContent ------------------------------------------------------ */
  const viewed = useRef(false);
  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    trackMetaEvent('ViewContent', {
      content_name: FOUNDATION_PRODUCT_NAME,
      content_type: 'product',
      content_ids: [FOUNDATION_PRODUCT_ID],
      content_category: 'Offer Page',
      value: FOUNDATION_FIRST_PAYMENT_VALUE,
      currency: FOUNDATION_CURRENCY,
    });
  }, []);

  /* ---- checkout --------------------------------------------------------- */
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = useCallback(async () => {
    if (pending) return;
    setPending(true);
    setError(null);

    // Same event_id on the browser pixel and the server CAPI call → dedup.
    const eventId = generateEventId();
    trackMetaEvent(
      'InitiateCheckout',
      {
        content_name: FOUNDATION_PRODUCT_NAME,
        content_type: 'product',
        content_ids: [FOUNDATION_PRODUCT_ID],
        value: FOUNDATION_FIRST_PAYMENT_VALUE,
        currency: FOUNDATION_CURRENCY,
        num_items: 1,
      },
      eventId,
    );

    try {
      const res = await fetch('/api/foundation/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        checkoutUrl?: string;
        error?: string;
      };
      if (!res.ok || !data.checkoutUrl) {
        throw new Error(data.error || 'We could not start checkout. Please try again.');
      }
      window.location.assign(data.checkoutUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setPending(false);
    }
  }, [pending]);

  const ctaLabel = `Launch your website and portal — ${FOUNDATION_FIRST_PAYMENT_DISPLAY} today`;

  const ctaButton = (extraClass = '') => (
    <button
      type="button"
      onClick={startCheckout}
      disabled={pending}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 sm:px-8 text-sm sm:text-base font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 cursor-pointer disabled:cursor-wait ${extraClass}`}
      style={{ background: '#2563eb', boxShadow: '0 14px 40px -12px rgba(37,99,235,0.8)' }}
    >
      {pending ? (
        <Loader2 size={18} className="animate-spin" aria-hidden="true" />
      ) : (
        <CreditCard size={18} aria-hidden="true" />
      )}
      {pending ? 'Opening secure checkout…' : ctaLabel}
    </button>
  );

  const frameHeight = device === 'phone' ? 720 : 660;
  const sandboxNote = useMemo(
    () =>
      `This is ${DEMO_FIRM_NAME}, the demo firm — yours is built the same way, in your brand, on your domain.`,
    [],
  );

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div
      className="relative min-h-screen text-white pb-32 md:pb-24"
      style={{ background: CANVAS, fontFamily: "'Outfit', system-ui, sans-serif" }}
    >
      <FunnelLogo />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[70vh]"
        style={{
          background: 'radial-gradient(60% 60% at 50% 0%, rgba(59,130,246,0.14) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="relative px-4 sm:px-6 pt-28 md:pt-32 max-w-6xl mx-auto space-y-20 md:space-y-28">
        {/* ------------------------------------------------------------- */}
        {/* a. Header                                                      */}
        {/* ------------------------------------------------------------- */}
        <header className="max-w-3xl">
          {cancelled && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              role="status"
              className="mb-6 flex items-start gap-3 rounded-xl border px-4 py-3 text-xs sm:text-sm"
              style={{
                background: 'rgba(59,130,246,0.08)',
                borderColor: 'rgba(59,130,246,0.3)',
                color: 'rgba(255,255,255,0.8)',
              }}
            >
              <Info size={16} className="mt-0.5 shrink-0 text-blue-400" aria-hidden="true" />
              <p>
                No charge was made — checkout was cancelled. Everything below is still here whenever you are
                ready.
              </p>
            </motion.div>
          )}

          <Eyebrow>Your firm&apos;s infrastructure</Eyebrow>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-5 text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-black tracking-[-0.035em] leading-[1.05] text-white"
            style={SYNE}
          >
            {firstName ? `${firstName}, stop ` : 'Stop '}looking like the{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, #60a5fa, #22d3ee)' }}
            >
              cheapest firm
            </span>{' '}
            your prospect is comparing
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-5 text-base md:text-lg leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            The fee a client expects is set before they ever speak to you. The same system you just
            test-drove, rebuilt for {firmName || 'your firm'} and live on your own domain in{' '}
            {FOUNDATION_LIVE_IN_DAYS} days — built, hosted and maintained for you at{' '}
            {FOUNDATION_PRICE_DISPLAY}
            {FOUNDATION_PERIOD_LABEL}, month to month.
          </motion.p>

          {qualifiedForCall && (
            <p className="mt-5 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Would rather talk it through first?{' '}
              <Link
                href={DEMO_CALL_PATH}
                className="inline-flex items-center gap-1 font-semibold underline underline-offset-2"
                style={{ color: '#60a5fa' }}
              >
                <CalendarCheck size={14} aria-hidden="true" />
                Book your call instead
              </Link>
              .
            </p>
          )}

          <div className="mt-8 flex flex-col items-start gap-3">
            {ctaButton()}
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {FOUNDATION_FIRST_PAYMENT_DISPLAY} today, then {FOUNDATION_PRICE_DISPLAY} monthly. Cancel any
              time with 30 days&apos; notice.
            </p>
            {error && (
              <p className="text-sm font-medium" style={{ color: '#fca5a5' }} role="alert">
                {error}
              </p>
            )}
          </div>
        </header>

        {/* ------------------------------------------------------------- */}
        {/* b. The sandbox                                                 */}
        {/* ------------------------------------------------------------- */}
        <section aria-labelledby="offer-sandbox">
          <SectionHeading
            id="offer-sandbox"
            eyebrow="What you are buying"
            title="A firm that looks like it charges more."
            sub={sandboxNote}
          />

          {/* Half one: the website */}
          <div className="mt-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg sm:text-xl font-black tracking-[-0.02em] text-white" style={SYNE}>
                The website that brings them in
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <Segmented<Theme>
                  label="Color theme"
                  value={theme}
                  onChange={changeTheme}
                  options={[
                    { value: 'dark', label: 'Dark', icon: <Moon size={13} aria-hidden="true" /> },
                    { value: 'light', label: 'Light', icon: <Sun size={13} aria-hidden="true" /> },
                  ]}
                />
                <Segmented<BrowserDevice>
                  label="Device"
                  value={device}
                  onChange={changeDevice}
                  options={[
                    { value: 'desktop', label: 'Desktop', icon: <Monitor size={13} aria-hidden="true" /> },
                    { value: 'phone', label: 'Phone', icon: <Smartphone size={13} aria-hidden="true" /> },
                  ]}
                />
              </div>
            </div>

            <div className="mt-5">
              <BrowserFrame
                key={device}
                src={src}
                title={`${DEMO_FIRM_NAME} — website`}
                device={device}
                height={frameHeight}
                address="evergreentax.com"
                iframeRef={iframeRef}
              />
              <p className="mt-3 flex flex-wrap items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                <a
                  href={`${DEMO_FIRM_SITE_PATH}?theme=${theme}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-semibold"
                  style={{ color: '#60a5fa' }}
                >
                  Open the site in a new tab
                  <ExternalLink size={13} aria-hidden="true" />
                </a>
              </p>
            </div>
          </div>

          {/* Half two: the client portal */}
          <div className="mt-12">
            <h3 className="text-lg sm:text-xl font-black tracking-[-0.02em] text-white" style={SYNE}>
              The client portal that keeps them
            </h3>
            <div className="mt-5">
              <PortalDemo
                firmName={DEMO_FIRM_NAME}
                accent={DEMO_FIRM_ACCENT}
                accent2={DEMO_FIRM_ACCENT_2}
                theme={theme}
                ownerName={DEMO_FIRM_OWNER}
                logoUrl={demoFirmLogo(theme)}
              />
              <p className="mt-3 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Sample data. Your clients pick their own light or dark theme — both are included.
              </p>
            </div>
          </div>
        </section>
        {/* ------------------------------------------------------------- */}
        {/* c. What's included                                             */}
        {/* ------------------------------------------------------------- */}
        <section aria-labelledby="offer-included">
          <SectionHeading
            id="offer-included"
            eyebrow="What's included"
            title="Everything, built and run for you."
            sub="No modules to buy, no per-seat pricing, no implementation partner to hire."
          />
          <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {INCLUDED.map((item) => (
              <li key={item.title}>
                <GlassCard className="h-full p-5 sm:p-6">
                  <div className="flex gap-3">
                    <span
                      className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                      style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399' }}
                    >
                      <Check size={14} aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-base font-bold tracking-tight text-white" style={SYNE}>
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.62)' }}>
                        {item.body}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </li>
            ))}
          </ul>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* d + e. Price + CTA                                             */}
        {/* ------------------------------------------------------------- */}
        <section aria-labelledby="offer-price" id="price" className="scroll-mt-24">
          <GlassCard
            className="md:p-10 lg:p-12 relative overflow-hidden"
            style={{ borderColor: 'rgba(59,130,246,0.3)' }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-40 -right-40 h-[480px] w-[480px] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)',
                filter: 'blur(60px)',
              }}
            />
            <div className="relative grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-start">
              <div>
                <Eyebrow>{FOUNDATION_PRODUCT_NAME}</Eyebrow>
                <h2
                  id="offer-price"
                  className="mt-4 text-2xl sm:text-3xl md:text-4xl font-black tracking-[-0.03em] leading-[1.05] text-white"
                  style={SYNE}
                >
                  One price. Nothing left on your plate.
                </h2>

                <div className="mt-7 flex items-end gap-2">
                  <span
                    className="text-6xl sm:text-7xl font-black tracking-[-0.045em] leading-none text-white"
                    style={SYNE}
                  >
                    {FOUNDATION_PRICE_DISPLAY}
                  </span>
                  <span className="pb-2 text-lg font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {FOUNDATION_PERIOD_LABEL}
                  </span>
                </div>

                <p className="mt-3 text-sm sm:text-base font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  plus a one-time {FOUNDATION_SETUP_FEE_DISPLAY} setup fee, charged with your first month
                </p>
                <p className="mt-2 text-sm sm:text-base" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  {FOUNDATION_FIRST_PAYMENT_DISPLAY} today, then {FOUNDATION_PRICE_DISPLAY} on the same day
                  each month.
                </p>
                <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  Month to month. Cancel any time with 30 days&apos; notice.
                </p>

                <p
                  className="mt-6 inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs sm:text-sm font-bold uppercase tracking-wide"
                  style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}
                >
                  <ShieldCheck size={15} aria-hidden="true" />
                  {FOUNDATION_GUARANTEE}.
                </p>

                <div className="mt-8 flex flex-col items-start gap-3">
                  {ctaButton()}
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    Secure checkout by Stripe. You confirm the service terms before you pay.
                  </p>
                  {error && (
                    <p className="text-sm font-medium" style={{ color: '#fca5a5' }} role="alert">
                      {error}
                    </p>
                  )}
                </div>
              </div>

              {/* Not included */}
              <div
                className="rounded-2xl border p-6"
                style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.09)' }}
              >
                <h3 className="text-base font-black tracking-tight text-white" style={SYNE}>
                  Not included
                </h3>
                <p className="mt-1.5 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  This is the infrastructure, not the growth engine.
                </p>
                <ul className="mt-5 space-y-2.5">
                  {NOT_INCLUDED.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.62)' }}>
                      <X size={15} className="mt-0.5 shrink-0" style={{ color: '#f87171' }} aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-5 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  Those are the{' '}
                  <Link
                    href={RAINMAKER_PATH}
                    className="font-semibold underline underline-offset-2"
                    style={{ color: '#60a5fa' }}
                  >
                    {RAINMAKER_NAME}
                  </Link>
                  , which {FOUNDATION_PRODUCT_NAME} plugs straight into when you are ready.
                </p>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* f. FAQ                                                         */}
        {/* ------------------------------------------------------------- */}
        <section aria-labelledby="offer-faq">
          <SectionHeading id="offer-faq" eyebrow="Before you decide" title="The five questions we always get." />
          <div className="mt-8 space-y-3">
            {FAQS.map((faq, i) => {
              const open = openFaq === i;
              return (
                <div key={faq.q}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : i)}
                    aria-expanded={open}
                    className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-left transition-colors sm:px-6 sm:py-5"
                    style={{
                      background: open ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)',
                      borderColor: open ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.08)',
                    }}
                  >
                    <span className="text-sm sm:text-base font-semibold text-white">{faq.q}</span>
                    <ChevronDown
                      size={20}
                      aria-hidden="true"
                      style={{
                        color: 'rgba(255,255,255,0.5)',
                        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        flexShrink: 0,
                      }}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <p
                          className="px-5 pt-3 pb-1 text-sm leading-relaxed sm:px-6 sm:text-base"
                          style={{ color: 'rgba(255,255,255,0.7)' }}
                        >
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* Closer                                                         */}
        {/* ------------------------------------------------------------- */}
        <section className="pb-4 text-center">
          <h2
            className="mx-auto max-w-2xl text-2xl sm:text-3xl md:text-4xl font-black tracking-[-0.03em] leading-[1.1] text-white"
            style={SYNE}
          >
            {firmName
              ? `${firmName} could look like a different firm in ${FOUNDATION_LIVE_IN_DAYS} days.`
              : `Your firm could look like a different firm in ${FOUNDATION_LIVE_IN_DAYS} days.`}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {FOUNDATION_FIRST_PAYMENT_DISPLAY} today, {FOUNDATION_PRICE_DISPLAY} a month after that, and
            nothing for you to build, host or maintain.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            {ctaButton()}
            {error && (
              <p className="text-sm font-medium" style={{ color: '#fca5a5' }} role="alert">
                {error}
              </p>
            )}
            <a
              href="#offer-sandbox"
              className="inline-flex items-center gap-1.5 text-xs font-semibold"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              Take another look first
              <ArrowRight size={13} aria-hidden="true" />
            </a>
          </div>
        </section>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Sticky mobile bar                                              */}
      {/* ------------------------------------------------------------- */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t px-4 py-3 md:hidden"
        style={{
          background: 'rgba(10,15,28,0.94)',
          borderColor: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <button
          type="button"
          onClick={startCheckout}
          disabled={pending}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-bold text-white transition-transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait"
          style={{ background: '#2563eb', boxShadow: '0 10px 30px -12px rgba(37,99,235,0.9)' }}
        >
          {pending ? (
            <Loader2 size={17} className="animate-spin" aria-hidden="true" />
          ) : (
            <CreditCard size={17} aria-hidden="true" />
          )}
          {pending ? 'Opening secure checkout…' : `Launch it — ${FOUNDATION_FIRST_PAYMENT_DISPLAY} today`}
        </button>
        <p className="mt-1.5 text-center text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
          then {FOUNDATION_PRICE_DISPLAY}/mo · cancel any time with 30 days&apos; notice
        </p>
      </div>
    </div>
  );
}
