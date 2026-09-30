'use client';

// ---------------------------------------------------------------------------
// Demo funnel, page 2 — /demo
// The sandbox (website + portal, one shared theme), the bridge video, and the
// hand-off into the qualifier.
// ---------------------------------------------------------------------------
import React, { useCallback, useEffect, useRef, useState } from 'react';
import MuxPlayer from '@mux/mux-player-react';
import {
  ArrowRight,
  Check,
  ExternalLink,
  Film,
  Monitor,
  Moon,
  Plus,
  Smartphone,
  Sun,
} from 'lucide-react';
import FunnelLogo from '@/components/FunnelLogo';
import { trackMetaEvent } from '@/lib/meta-events';
import { useVideoTracking } from '@/lib/use-video-tracking';
import BrowserFrame, { type BrowserDevice } from './BrowserFrame';
import PortalDemo from './PortalDemo';
import {
  DEMO_BRIDGE_CTA,
  DEMO_BRIDGE_VIDEO_PLAYBACK_ID,
  DEMO_BRIDGE_VIDEO_TITLE,
  DEMO_FIRM_ACCENT,
  DEMO_FIRM_ACCENT_2,
  DEMO_FIRM_NAME,
  DEMO_FIRM_OWNER,
  demoFirmLogo,
  DEMO_FIRM_SITE_PATH,
  DEMO_QUALIFY_PATH,
} from '@/lib/demo-config';
import { RAINMAKER_NAME } from '@/lib/foundation-config';
import { RAINMAKER_CONIC, ShimmerBadge } from '@/components/TransformationCards';
import AnimatedNumber from '@/components/AnimatedNumber';

type Theme = 'dark' | 'light';

const OUTFIT: React.CSSProperties = {
  fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif",
};
const CANVAS = '#0a0f1c';

// The two halves of the pitch.
//
// ADDS used to mirror /demo/offer's NOT_INCLUDED word for word. It no longer
// does, deliberately: this list leads with the outcome the firm gets, while
// NOT_INCLUDED stays feature-shaped because its job is to say what Firm
// Foundation lacks. Do not "restore" the symmetry — they answer different
// questions.
const HAVE = [
  'A premium firm website on your own domain',
  'The branded client portal — invoices, engagement letters, documents',
  'Hosting, SSL and unlimited content edits',
];

const ADDS = [
  'Paid advertising and campaign management',
  '50 qualified leads — a $750,000 pipeline opportunity',
  '$15,000+ advisory clients',
  'AI automations',
  'The Google review engine',
];

// The iframed firm site reports its own theme and accepts ours.
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
    <span className="inline-flex items-center rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 uppercase tracking-[0.2em] text-[10px] font-black px-3.5 py-1.5">
      {children}
    </span>
  );
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  size = 'sm',
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; icon?: React.ReactNode }[];
  label: string;
  size?: 'sm' | 'lg';
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
            className={`inline-flex items-center gap-1.5 rounded-full font-semibold transition-colors ${
              size === 'lg' ? 'px-4 sm:px-6 py-2.5 text-sm' : 'px-3 py-1.5 text-xs'
            }`}
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
  align = 'left',
}: {
  eyebrow: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  id?: string;
  align?: 'left' | 'center';
}) {
  return (
    <div
      id={id}
      className={`max-w-3xl scroll-mt-24${align === 'center' ? ' mx-auto text-center' : ''}`}
    >
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2
        className="mt-4 text-2xl sm:text-3xl md:text-[2.5rem] font-black tracking-[-0.03em] leading-[1.08] text-white"
        style={OUTFIT}
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

/**
 * The turn in the argument, rendered once after the website and once after
 * the portal. Same headline both times — the repetition is the point — with a
 * body that answers whichever half the visitor just clicked through.
 *
 * It nests INSIDE the section it responds to rather than sitting as a sibling
 * of it: <main> puts space-y-20/28 between its direct children, which would
 * float this midway between the two halves and orphan it.
 */
/**
 * What the funnel actually does, as a flow. Same shape as the calculator's
 * results strip (components/ProfitCalculator.tsx:709) — micro-labelled stages,
 * a chevron between each, numbers that count up once scrolled into view.
 *
 * `Qualified` and `Booked` deliberately match the ads dashboard on /demo/call
 * so the two pages cannot disagree. The first two stages are illustrative,
 * which the line underneath says outright.
 */
const PIPELINE = [
  { label: 'Reached', value: 2400, hint: 'owners and high earners' },
  { label: 'Warm', value: 186, hint: 'engaged with your offer' },
  { label: 'Qualified', value: 50, hint: 'guaranteed in 90 days', highlight: true },
  { label: 'Booked', value: 34, hint: 'on your calendar' },
];

function LeadPipeline() {
  return (
    <div className="mt-4">
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-2 rounded-2xl border px-3.5 py-3.5"
        style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' }}
      >
        {PIPELINE.map((s, i) => (
          <div key={s.label} className="relative text-center">
            {i > 0 && (
              <ArrowRight
                size={13}
                aria-hidden="true"
                className="hidden sm:block absolute -left-[9px] top-[18px] -translate-y-1/2"
                style={{ color: 'rgba(96,165,250,0.45)' }}
              />
            )}
            <div
              className="text-[9px] font-black tracking-[0.15em] uppercase mb-1"
              style={{ color: s.highlight ? '#60a5fa' : 'rgba(255,255,255,0.45)' }}
            >
              {s.label}
            </div>
            <div
              className="text-base sm:text-xl font-black tracking-tight leading-none"
              style={{ ...OUTFIT, color: s.highlight ? '#ffffff' : 'rgba(255,255,255,0.75)' }}
            >
              <AnimatedNumber
                value={s.value}
                format={(n) => Math.round(n).toLocaleString('en-US')}
                animateOnView
                duration={1100}
              />
            </div>
            <div className="mt-1 text-[10px] leading-snug" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {s.hint}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2.5 text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
        The 50 qualified leads are the figure in your agreement. Reach and warm volume vary by market.
      </p>
    </div>
  );
}

function QualifyTurn({
  body,
  variant = 'compact',
  className = 'mt-10 md:mt-12',
}: {
  body: React.ReactNode;
  variant?: 'feature' | 'compact';
  /** Spacing override. The copy above the hero is the first child of <main>
   *  and gets its gap from space-y, so it passes mt-0. */
  className?: string;
}) {
  const inner = (
    <>
      <h2
        className={
          variant === 'feature'
            ? 'text-xl sm:text-2xl md:text-[1.9rem] font-black tracking-[-0.03em] leading-[1.12] text-white'
            : 'text-xl sm:text-2xl md:text-[1.75rem] font-black tracking-[-0.03em] leading-[1.15] text-white'
        }
        style={OUTFIT}
      >
        A new website does not come with new clients.
      </h2>

      {variant === 'feature' && (
        <p
          className="mt-2.5 text-base sm:text-lg font-black tracking-[-0.02em] bg-clip-text text-transparent"
          style={{
            ...OUTFIT,
            backgroundImage: 'linear-gradient(90deg, #60a5fa, #a78bfa, #22d3ee)',
          }}
        >
          Still relying on referrals?
        </p>
      )}

      <p
        className={
          variant === 'feature'
            ? 'mt-3 max-w-3xl text-sm sm:text-base leading-relaxed'
            : 'mt-3.5 text-sm sm:text-base leading-relaxed'
        }
        style={{ color: 'rgba(255,255,255,0.72)' }}
      >
        {body}
      </p>

      {variant === 'feature' && <LeadPipeline />}

      {/* Two doors. Both run the same six questions — only the framing before
          them differs (see app/demo/qualify/page.tsx). The grey one is
          deliberately plain: it is the consolation path, and making it compete
          with the blue would flatten the choice. */}
      <div
        className={`${variant === 'feature' ? 'mt-5' : 'mt-6'} flex flex-col items-stretch sm:items-start gap-2.5`}
      >
        <a
          href={`${DEMO_QUALIFY_PATH}?intent=leads`}
          className={`${
            variant === 'feature' ? 'px-7 py-3.5 text-sm sm:text-base' : 'px-7 py-3.5 text-sm sm:text-base'
          } w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 rounded-full font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]`}
          style={{ boxShadow: '0 14px 40px -12px rgba(37,99,235,0.8)' }}
        >
          Send me 50 high-paying advisory leads
          <ArrowRight size={17} aria-hidden="true" />
        </a>

        {variant === 'feature' && (
          <a
            href={`${DEMO_QUALIFY_PATH}?intent=website`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full border text-sm font-semibold transition-colors"
            style={{
              background: 'rgba(255,255,255,0.07)',
              borderColor: 'rgba(255,255,255,0.14)',
              color: 'rgba(255,255,255,0.72)',
            }}
          >
            Claim the website
          </a>
        )}
      </div>

      {/* Not a gate: non-qualifiers land on /demo/offer and can buy exactly
          what they just clicked through. Saying so is what stops the buttons
          reading as a trap. */}
      <p className="mt-3 text-xs sm:text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
        {variant === 'feature'
          ? 'Six questions either way, about a minute. The website and portal are yours regardless.'
          : 'Six questions, about a minute. The website and portal are yours either way.'}
      </p>
    </>
  );

  if (variant === 'compact') {
    return (
      <div
        className={`${className} max-w-3xl rounded-3xl border px-6 sm:px-8 py-7 sm:py-9`}
        style={{
          background:
            'linear-gradient(140deg, rgba(37,99,235,0.16) 0%, rgba(255,255,255,0.03) 55%, rgba(6,182,212,0.1) 100%)',
          borderColor: 'rgba(96,165,250,0.3)',
        }}
      >
        {inner}
      </div>
    );
  }

  // The showpiece. House animated rim (components/Services.tsx:196): two
  // spinning conic layers, one crisp and one blurred, over an OPAQUE interior
  // — at any alpha the blurred layer bleeds through and washes the card.
  // Wider than the max-w-3xl the rest of the page uses, so it visibly breaks
  // the column the sandbox sections sit in.
  return (
    <div className={`relative ${className} max-w-4xl rounded-3xl overflow-hidden p-[1.5px] isolate`}>
      <span
        aria-hidden="true"
        className="absolute inset-[-200%] animate-[shimmer_6s_linear_infinite] opacity-90 pointer-events-none"
        style={{ background: RAINMAKER_CONIC }}
      />
      <span
        aria-hidden="true"
        className="absolute inset-[-200%] animate-[shimmer_6s_linear_infinite] blur-xl opacity-30 pointer-events-none"
        style={{ background: RAINMAKER_CONIC }}
      />
      <div
        className="relative z-10 overflow-hidden rounded-[calc(1.5rem-1.5px)] px-5 sm:px-7 py-5 sm:py-7"
        style={{ background: 'linear-gradient(140deg, #101c33 0%, #0a1020 55%, #0b1f28 100%)' }}
      >
        {/* The "lit from inside" read is mostly these two, not the rim — same
            pair the centerpiece panels on /rainmaker and /profit-calculator use. */}
        <div
          aria-hidden="true"
          className="absolute top-0 right-0 w-64 h-64 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-blue-500/10 blur-[80px] pointer-events-none"
        />

        <div className="relative z-10 mb-4">
          <ShimmerBadge
            conicStops="#60a5fa, #a78bfa, #22d3ee, #60a5fa"
            starClass="text-blue-400 fill-blue-400"
            labelClass="text-blue-300"
          >
            The half that brings the clients
          </ShimmerBadge>
        </div>
        <div className="relative z-10">{inner}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Page                                                                      */
/* ------------------------------------------------------------------------ */

export interface DemoExperienceProps {
  firstName?: string | null;
}

export default function DemoExperience({ firstName }: DemoExperienceProps) {
  // ---- sandbox state -----------------------------------------------------
  const [theme, setTheme] = useState<Theme>('dark');
  const [device, setDevice] = useState<BrowserDevice>('desktop');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeReady, setIframeReady] = useState(false);
  const [src, setSrc] = useState(`${DEMO_FIRM_SITE_PATH}?theme=dark`);

  const changeTheme = useCallback(
    (next: Theme) => {
      setTheme(next);
      const win = iframeRef.current?.contentWindow;
      if (iframeReady && win) {
        try {
          win.postMessage({ type: THEME_MESSAGE_IN, theme: next }, window.location.origin);
          return;
        } catch {
          /* fall through to a reload with the theme in the query */
        }
      }
      setSrc(`${DEMO_FIRM_SITE_PATH}?theme=${next}`);
    },
    [iframeReady],
  );

  const changeDevice = useCallback(
    (next: BrowserDevice) => {
      setDevice(next);
      setIframeReady(false);
      setSrc(`${DEMO_FIRM_SITE_PATH}?theme=${theme}`);
    },
    [theme],
  );

  // The iframed site reports its theme on load and whenever its own toggle runs.
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

  // ---- pixel -------------------------------------------------------------
  const viewedRef = useRef(false);
  useEffect(() => {
    if (viewedRef.current) return;
    viewedRef.current = true;
    trackMetaEvent('ViewContent', {
      content_name: 'Nexli Demo Sandbox',
      content_category: 'Demo',
    });
  }, []);

  // ---- bridge video ------------------------------------------------------
  const { videoRef, handlers } = useVideoTracking('demo_session_id', 'demo');
  const hasVideo = Boolean(DEMO_BRIDGE_VIDEO_PLAYBACK_ID);

  const frameHeight = device === 'phone' ? 760 : 720;
  // With a name the sentence opens "Marcel, this is…"; without one it has to
  // start with a capital, so the leading word is part of the greeting.
  const greeting = firstName ? `${firstName}, this` : 'This';
  const openHref = `${DEMO_FIRM_SITE_PATH}?theme=${theme}`;

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

      <main className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-20 md:pt-24 pb-32 md:pb-24 space-y-14 md:space-y-16">
        {/* -------------------------------------------------------------- */}
        {/* a. Header                                                       */}
        {/* -------------------------------------------------------------- */}
        <header>
          <Eyebrow>Your guest access is live</Eyebrow>
          <h1
            className="mt-5 max-w-4xl text-[2rem] sm:text-4xl md:text-5xl font-black tracking-[-0.035em] leading-[1.05] text-white"
            style={OUTFIT}
          >
            {greeting} is the{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, #60a5fa, #22d3ee)' }}
            >
              easy half
            </span>
            .
          </h1>
          <p className="mt-4 max-w-2xl text-base md:text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
            A real firm website and a real client portal, both yours. Click anything — none of it is a
            screenshot. The hard half is who ends up calling it.
          </p>

          {/* The offer, still above the fold but now reading as the hero's
              answer rather than arriving before it. Repeats after the website
              section, where it lands on someone who has actually clicked
              through the thing it is arguing about. */}
          <QualifyTurn
            variant="feature"
            className="mt-5 md:mt-6"
            body={
              <>
                The $15,000 client is not in your referral pool — your book refers people like your
                book, $800 filers who know other $800 filers. We bring you fifty who are not, in your
                first 90 days.
              </>
            }
          />
        </header>

      {/* ---- Half one: the website ------------------------------------ */}
      <section aria-labelledby="demo-website">
        <SectionHeading
          id="demo-website"
          eyebrow="Half one"
          title="Why a $15,000 prospect stops shopping."
          sub="The firm they land on decides the fee they expect. Flip the theme and the device — it is a real page, not a screenshot."
        />

        <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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
          <a
            href={openHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold"
            style={{ color: '#60a5fa' }}
          >
            Open in a new tab
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>

        <div className="mt-4">
          <BrowserFrame
            key={device}
            src={src}
            title={`${DEMO_FIRM_NAME} — website`}
            device={device}
            height={frameHeight}
            address="evergreentax.com"
            iframeRef={iframeRef}
          />
        </div>

        <QualifyTurn
          variant="feature"
          body={
            <>
              The $15,000 client is not in your referral pool. Your book refers people like your book
              — $800 filers who know other $800 filers. You can wait years for the exception and build
              the whole firm around it when it finally shows up. Or we bring you fifty of them in your
              first 90 days.
            </>
          }
        />
      </section>

      {/* ---- Half two: the client portal ------------------------------ */}
      <section aria-labelledby="demo-portal">
        <SectionHeading
          id="demo-portal"
          eyebrow="Half two"
          title="Why they pay on time and stay another year."
          sub="Invoices paid without chasing, letters signed without printing, documents in one place. Click any tab."
        />

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Segmented<Theme>
            label="Portal color theme"
            value={theme}
            onChange={changeTheme}
            options={[
              { value: 'dark', label: 'Dark', icon: <Moon size={13} aria-hidden="true" /> },
              { value: 'light', label: 'Light', icon: <Sun size={13} aria-hidden="true" /> },
            ]}
          />
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Your clients pick their own; both are included.
          </span>
        </div>

        <div className="mt-4">
          <PortalDemo
            firmName={DEMO_FIRM_NAME}
            accent={DEMO_FIRM_ACCENT}
            accent2={DEMO_FIRM_ACCENT_2}
            ownerName={DEMO_FIRM_OWNER}
            logoUrl={demoFirmLogo(theme)}
            theme={theme}
          />
        </div>

        <p className="mt-4 text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {DEMO_FIRM_NAME} is a live demo firm with sample data — not a real client. Your build starts from this
          template, then gets your name, your colors, your services and your domain.
        </p>

        <QualifyTurn
          body={
            <>
              A portal keeps the clients you already have and makes them cheap to serve. It has no
              opinion about how many there are. The firms billing $15,000 are not running better
              software than this — they are running something that fills it, and that is the half you
              have to qualify for.
            </>
          }
        />
      </section>

        {/* -------------------------------------------------------------- */}
        {/* c. The bridge video                                             */}
        {/* -------------------------------------------------------------- */}
        <section aria-labelledby="demo-bridge">
          <SectionHeading
            id="demo-bridge"
            eyebrow="Watch this next"
            title={DEMO_BRIDGE_VIDEO_TITLE}
            sub="Five minutes on why the software is the easy part — and what the firms charging advisory fees do differently."
            align="center"
          />

          <div className="mt-8 max-w-3xl mx-auto">
            <div className="relative rounded-2xl md:rounded-[2.5rem] border shadow-2xl overflow-hidden" style={{ background: '#050505', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[200px] blur-[100px] pointer-events-none bg-blue-500/5" />
              <div className="relative z-10 p-2.5 sm:p-4 md:p-8">
                {hasVideo ? (
                  <MuxPlayer
                    ref={videoRef}
                    playbackId={DEMO_BRIDGE_VIDEO_PLAYBACK_ID}
                    metadata={{ video_title: DEMO_BRIDGE_VIDEO_TITLE }}
                    streamType="on-demand"
                    accentColor="#3b82f6"
                    className="w-full rounded-xl md:rounded-2xl"
                    style={{ aspectRatio: '16/9' }}
                    onPlay={handlers.onPlay}
                    onPause={handlers.onPause}
                    onTimeUpdate={handlers.onTimeUpdate}
                    onEnded={handlers.onEnded}
                  />
                ) : (
                  <div
                    className="w-full rounded-xl md:rounded-2xl flex flex-col items-center justify-center text-center px-6"
                    style={{
                      aspectRatio: '16/9',
                      background: 'linear-gradient(160deg, rgba(37,99,235,0.14) 0%, rgba(10,15,28,0.9) 60%)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <span
                      className="inline-flex w-12 h-12 rounded-2xl items-center justify-center"
                      style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa' }}
                    >
                      <Film size={20} aria-hidden="true" />
                    </span>
                    <p className="mt-4 text-lg sm:text-xl font-black text-white" style={OUTFIT}>
                      Bridge video coming soon
                    </p>
                    <p className="mt-1.5 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                      {DEMO_BRIDGE_VIDEO_TITLE}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 md:mt-8 text-center">
              <a
                href={`${DEMO_QUALIFY_PATH}?intent=leads`}
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 rounded-full font-bold text-white px-8 py-4 text-base transition-transform hover:scale-[1.02] active:scale-[0.98]"
                style={{ boxShadow: '0 14px 40px -12px rgba(37,99,235,0.8)' }}
              >
                Send me 50 high-paying advisory leads
                <ArrowRight size={18} aria-hidden="true" />
              </a>
              <p className="mt-3 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Six questions, about a minute. No card, no call to find out.
              </p>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------------- */}
        {/* d. The CTA                                                      */}
        {/* -------------------------------------------------------------- */}
        {/* -------------------------------------------------------------- */}
        {/* d. What the sandbox is NOT: the full system                     */}
        {/* -------------------------------------------------------------- */}
        {/* The visitor has just clicked through a website and a portal and
            could easily conclude that is the whole offer. This is the only
            place that says plainly what the qualified path adds. The "adds"
            list is the same one /demo/offer sells against (its NOT_INCLUDED). */}
        <section aria-labelledby="demo-full-system">
          <SectionHeading
            id="demo-full-system"
            eyebrow="What you just used is half of it"
            title="A calendar full of $15,000 advisory work."
            sub="Everything above is what a client sees once they arrive. None of it decides how many arrive. That is the half you have to qualify for."
            align="center"
          />

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 items-stretch">
            {/* Have */}
            <div
              className="rounded-3xl border p-6 sm:p-8"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)' }}
            >
              <p className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                What you just clicked through
              </p>
              <p className="mt-2 text-xl sm:text-2xl font-black text-white" style={OUTFIT}>
                Website + client portal
              </p>
              <ul className="mt-5 space-y-2.5 list-none p-0 m-0">
                {HAVE.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    <Check size={15} className="mt-0.5 shrink-0" style={{ color: '#34d399' }} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <div
                className="mt-6 pt-5 border-t"
                style={{ borderColor: 'rgba(255,255,255,0.1)' }}
              >
                <p className="text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  New advisory leads it brings you
                </p>
                <p className="mt-1 text-4xl sm:text-5xl font-black" style={{ ...OUTFIT, color: 'rgba(255,255,255,0.35)' }}>
                  0
                </p>
                <p className="mt-1.5 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  It is a storefront. Whoever was already going to call you still calls you.
                </p>
              </div>
            </div>

            {/* Get — the house animated rim (see components/Services.tsx:196):
                two spinning conic gradients, one crisp and one blurred, over an
                opaque inner surface. Rainmaker colours. */}
            <div className="relative rounded-3xl overflow-hidden p-[1.5px] isolate">
              <span
                aria-hidden="true"
                className="absolute inset-[-200%] animate-[shimmer_6s_linear_infinite] opacity-90 pointer-events-none"
                style={{ background: RAINMAKER_CONIC }}
              />
              <span
                aria-hidden="true"
                className="absolute inset-[-200%] animate-[shimmer_6s_linear_infinite] blur-xl opacity-30 pointer-events-none"
                style={{ background: RAINMAKER_CONIC }}
              />
              <div
                className="relative z-10 h-full rounded-[calc(1.5rem-1.5px)] p-6 sm:p-8"
                // Fully opaque: at any alpha the blurred rim layer bleeds
                // through and washes the card gold and teal.
                style={{
                  background: 'linear-gradient(140deg, #101c33 0%, #0a1020 55%, #0b1f28 100%)',
                }}
              >
              <p className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: '#60a5fa' }}>
                What qualifying adds
              </p>
              <p className="mt-2 text-xl sm:text-2xl font-black text-white" style={OUTFIT}>
                The full {RAINMAKER_NAME}
              </p>
              <ul className="mt-5 space-y-2.5 list-none p-0 m-0">
                {ADDS.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-white">
                    <Plus size={15} className="mt-0.5 shrink-0" style={{ color: '#60a5fa' }} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>

              {/* Mirrors the left card's figure in the same position, so the
                  0 and the 50 line up and the gap reads at a glance. */}
              <div className="mt-6 pt-5 border-t" style={{ borderColor: 'rgba(96,165,250,0.25)' }}>
                <p className="text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: '#60a5fa' }}>
                  New advisory leads it brings you
                </p>
                <p className="mt-1 text-4xl sm:text-5xl font-black text-white" style={OUTFIT}>
                  50
                  <span className="ml-2 align-middle text-sm font-bold" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    in your first 90 days
                  </span>
                </p>
              </div>

              <div
                className="mt-5 rounded-2xl border px-4 py-4"
                style={{ background: 'rgba(52,211,153,0.07)', borderColor: 'rgba(52,211,153,0.3)' }}
              >
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  <strong className="font-black text-white">The 50 leads are written into your agreement.</strong>{' '}
                  The $750,000 is not — it is what they are worth if every one becomes an engagement
                  at your average fee. Your close rate decides what you bank.
                </p>
              </div>

              <a
                href={`${DEMO_QUALIFY_PATH}?intent=leads`}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 rounded-full font-bold text-white px-7 py-3.5 text-sm sm:text-base transition-transform hover:scale-[1.02] active:scale-[0.98]"
                style={{ boxShadow: '0 14px 40px -12px rgba(37,99,235,0.8)' }}
              >
                Send me 50 high-paying advisory leads
                <ArrowRight size={17} aria-hidden="true" />
              </a>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="demo-cta">
          <div
            className="rounded-3xl border px-6 sm:px-10 py-10 sm:py-14 text-center"
            style={{
              background:
                'linear-gradient(140deg, rgba(37,99,235,0.18) 0%, rgba(255,255,255,0.03) 55%, rgba(6,182,212,0.12) 100%)',
              borderColor: 'rgba(255,255,255,0.1)',
            }}
          >
            <h2
              id="demo-cta"
              className="mx-auto max-w-3xl text-2xl sm:text-3xl md:text-[2.5rem] font-black tracking-[-0.03em] leading-[1.1] text-white"
              style={OUTFIT}
            >
              {DEMO_BRIDGE_CTA}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Six quick questions tell us whether your firm is ready to fill a calendar with advisory work, or
              whether the website and portal is the right place to start.
            </p>
            <a
              href={`${DEMO_QUALIFY_PATH}?intent=leads`}
              className="mt-8 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 rounded-full font-bold text-white px-8 py-4 text-base transition-transform hover:scale-[1.02] active:scale-[0.98]"
              style={{ boxShadow: '0 14px 40px -12px rgba(37,99,235,0.8)' }}
            >
              Send me 50 high-paying advisory leads
              <ArrowRight size={18} aria-hidden="true" />
            </a>
          </div>
        </section>
      </main>

      {/* Sticky mobile CTA */}
      <div
        className="md:hidden fixed inset-x-0 bottom-0 z-[100] px-4 py-3"
        style={{
          background: 'rgba(10,15,28,0.92)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <a
          href={`${DEMO_QUALIFY_PATH}?intent=leads`}
          className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 rounded-full font-bold text-white px-6 py-3.5 text-sm active:scale-[0.98] transition-transform"
          style={{ boxShadow: '0 14px 40px -12px rgba(37,99,235,0.8)' }}
        >
          Send me 50 high-paying advisory leads
          <ArrowRight size={16} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
