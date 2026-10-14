'use client';

// ---------------------------------------------------------------------------
// The ads, on booking-confirmed B.
//
// The website and the portal are easy to show — you point at them. The ads
// are the thing a firm is actually buying $5,000 of spend a month for, and
// until now this page never showed them at all.
//
// Dark in both themes, deliberately. This page is theme-aware, but the two
// things on it that are SCREENSHOTS of software — BrowserFrame directly
// above, and this — stay dark so they read as a product surface rather than
// as page content. The diagram below does follow the theme, because it is
// page content.
//
// NOT components/demo/AdsDashboard.tsx. That one tells the /demo/call story
// (lead volume, ROAS, a close-rate slider) in blue, and is hard-wired to it.
// This one tells a different story — what gets made and how it gets tested —
// so it borrows that file's idioms (window chrome, the layoutId range pill,
// AnimatedNumber) rather than the file.
//
// Everything rendered comes from lib/ad-creatives.ts. Copy and creatives are
// edited there, never here.
// ---------------------------------------------------------------------------

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MuxPlayer from '@mux/mux-player-react';
import { Facebook, Film, Image as ImageIcon, Instagram, Maximize2, Play, Sparkles, X } from 'lucide-react';
import MetaLogo from '@/components/icons/MetaLogo';
import AnimatedNumber from '@/components/AnimatedNumber';
import { AD_CREATIVES, AD_STATUS_LABEL, type AdCreative, type AdFormat } from '@/lib/ad-creatives';
import { DEMO_FIRM_NAME } from '@/lib/demo-config';

const PANEL = '#0b1220';

/** Reels. What Meta creative is unless a card says otherwise. */
const DEFAULT_RATIO = '9 / 16';

/** Status colours. Paused is grey, never red — a killed angle is the system
 *  working, not a failure, and the copy says so. */
const STATUS_STYLE: Record<AdCreative['status'], { fg: string; bg: string; bd: string }> = {
  scaling: { fg: '#4ade80', bg: 'rgba(34,197,94,0.12)', bd: 'rgba(34,197,94,0.35)' },
  testing: { fg: '#60a5fa', bg: 'rgba(59,130,246,0.12)', bd: 'rgba(59,130,246,0.35)' },
  paused: { fg: 'rgba(255,255,255,0.55)', bg: 'rgba(255,255,255,0.06)', bd: 'rgba(255,255,255,0.14)' },
};

type Filter = 'all' | AdFormat;

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'video', label: 'Video' },
  { id: 'photo', label: 'Photo' },
];

/** macOS window chrome, the same device AdsDashboard uses to say "this is an
 *  app, not a web page". */
function Chrome() {
  return (
    <div
      className="flex items-center gap-3 border-b px-4 py-3"
      style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}
    >
      <div className="flex shrink-0 gap-1.5" aria-hidden="true">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#ff5f57' }} />
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#febc2e' }} />
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#28c840' }} />
      </div>
      {/* Inline colour, not a Tailwind class. globals.css:62 sets
          `p { color: var(--text-muted) }` OUTSIDE any @layer, and in
          Tailwind v4 unlayered rules beat layered utilities whatever the
          specificity — so text-white/45 here would silently render dark
          slate in light mode, on a panel that stays dark in both. */}
      <p
        className="truncate text-[11px] sm:text-xs font-semibold"
        style={{ color: 'rgba(255,255,255,0.45)' }}
      >
        Ads Manager — {DEMO_FIRM_NAME}
      </p>
      <MetaLogo className="ml-auto h-auto w-[15px] shrink-0" />
    </div>
  );
}

/**
 * The empty creative slot.
 *
 * Shipped empty on purpose — the real creatives go in public/ads/ and get
 * wired up in lib/ad-creatives.ts. A designed placeholder reads as "not
 * filled in yet"; a broken image icon reads as "this site is broken".
 */
function PlaceholderSlot({ format }: { format: AdFormat }) {
  const Icon = format === 'video' ? Film : ImageIcon;
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-2"
      style={{
        background:
          'repeating-linear-gradient(135deg, rgba(255,255,255,0.025) 0 10px, rgba(255,255,255,0.05) 10px 20px)',
      }}
    >
      <Icon size={22} className="text-white/25" aria-hidden="true" />
      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/25">
        {format} creative
      </span>
    </div>
  );
}

/**
 * The reel, full size.
 *
 * Opening a creative is the point of an ad library — you look at the grid,
 * then you watch the one you care about. Here that means the whole 9:16 at
 * the height of the viewport, with sound and a scrub bar, which the card
 * preview deliberately does not have.
 *
 * Escape closes it, a click on the backdrop closes it, and the page behind
 * is scroll-locked while it is open so a trackpad flick does not slide the
 * booking page around underneath the video.
 */
function CreativeLightbox({ ad, onClose }: { ad: AdCreative; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Ad creative: ${ad.angle}`}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ duration: 0.22, ease: 'circOut' }}
        // The reel owns the height, and 9/16 gives it its width — but on a
        // phone 85vh is taller than 92vw can support at that ratio, and the
        // width cap won, squashing the box to 0.50. Capping the HEIGHT by
        // the width instead keeps the ratio exact at every size.
        className="relative flex h-[min(85vh,calc(92vw*16/9))] max-w-[92vw] items-center"
        style={{ aspectRatio: ad.aspectRatio ?? DEFAULT_RATIO }}
        onClick={(e) => e.stopPropagation()}
      >
        {ad.muxPlaybackId ? (
          <MuxPlayer
            playbackId={ad.muxPlaybackId}
            metadata={{ video_title: `Ad creative — ${ad.angle}` }}
            streamType="on-demand"
            thumbnailTime={0}
            autoPlay
            loop
            playsInline
            accentColor="#22c55e"
            style={{ height: '100%', width: '100%', borderRadius: 16, overflow: 'hidden' }}
          />
        ) : ad.src && ad.format === 'video' ? (
          <video
            className="h-full w-full rounded-2xl object-contain"
            src={ad.src}
            poster={ad.poster}
            controls
            autoPlay
            loop
            playsInline
          />
        ) : ad.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={ad.src} alt={ad.angle} className="h-full w-full rounded-2xl object-contain" />
        ) : null}

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute -top-3 -right-3 flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/20"
          style={{ background: 'rgba(0,0,0,0.75)', border: '1px solid rgba(255,255,255,0.25)' }}
        >
          <X size={16} className="text-white" aria-hidden="true" />
        </button>
      </motion.div>
    </motion.div>
  );
}

/** Mux's own still of a creative's first frame, used as the blurred fill. */
function posterFor(ad: AdCreative): string | null {
  if (ad.muxPlaybackId) {
    return `https://image.mux.com/${ad.muxPlaybackId}/thumbnail.jpg?time=0&width=400`;
  }
  return ad.poster ?? (ad.format === 'photo' ? ad.src ?? null : null);
}

/** One ad, shaped the way the Facebook Ads Library shows one. */
function CreativeCard({ ad, onOpen }: { ad: AdCreative; onOpen: () => void }) {
  const status = STATUS_STYLE[ad.status];
  const posterUrl = posterFor(ad);
  const hasMedia = Boolean(ad.muxPlaybackId || ad.src);

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="overflow-hidden rounded-xl border"
      style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}
    >
      {/* Angle + status. The row that makes this a test rather than a brochure. */}
      <div className="flex items-center gap-2 px-3 pt-3">
        <span className="truncate text-[10px] font-black uppercase tracking-[0.14em] text-white/45">
          {ad.angle}
        </span>
        <span
          className="ml-auto shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.1em]"
          style={{ color: status.fg, background: status.bg, borderColor: status.bd }}
        >
          {AD_STATUS_LABEL[ad.status]}
        </span>
      </div>

      {/* Page row */}
      <div className="flex items-center gap-2 px-3 pt-3">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-white"
          style={{ background: 'linear-gradient(135deg,#1F9D63,#0f6b41)' }}
          aria-hidden="true"
        >
          {DEMO_FIRM_NAME.charAt(0)}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[11px] font-bold leading-tight text-white/85">
            {DEMO_FIRM_NAME}
          </span>
          <span className="block text-[10px] leading-tight text-white/35">Sponsored</span>
        </span>
        {/* Where it runs. The Ads Library lists platforms on every ad, and
            it is also just true: one creative, both feeds plus Reels. */}
        <span
          className="ml-auto flex shrink-0 items-center gap-1.5 text-white/30"
          title="Runs on Facebook and Instagram"
        >
          <Facebook size={12} aria-hidden="true" />
          <Instagram size={12} aria-hidden="true" />
        </span>
      </div>

      <p className="px-3 pt-2 text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
        {ad.primaryText}
      </p>

      {/*
        The creative, the way the Ads Library shows one: NOTHING cropped.

        It used to be a 4:5 box with object-cover, which took a 9:16 reel and
        sliced the top and bottom off it — on the Jasmine cut that lost her
        head and the whole phone inset. A vertical ad has to be seen whole or
        there is no point showing it.

        So the box is a fixed height and the media is `contain`. A reel sits
        in the middle at its real 9:16 and the gap either side is filled with
        a blurred, scaled copy of its own first frame, which is exactly what
        Instagram and the Ads Library do with vertical creative in a wider
        frame. The card is now a window onto the ad rather than a crop of it.
      */}
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Play the full ad: ${ad.angle}`}
        className="group/media relative mt-2.5 block h-[300px] w-full overflow-hidden bg-black sm:h-[340px] lg:h-[360px]"
      >
        {/* Blurred fill behind the pillarbox. */}
        {posterUrl && (
          <span
            aria-hidden="true"
            className="absolute inset-0 scale-125"
            style={{
              backgroundImage: `url(${posterUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(26px) brightness(0.6)',
            }}
          />
        )}

        <span className="relative flex h-full w-full items-center justify-center">
          {/*
            The media is sized to the creative's own ratio rather than being
            allowed to fill the box. mux-player paints its own black letterbox
            across whatever width it is given, which covered the blurred fill
            completely — the pillars came out flat black instead of showing
            the frame behind.
          */}
          <span
            className="relative block h-full overflow-hidden"
            style={{ aspectRatio: ad.aspectRatio ?? DEFAULT_RATIO }}
          >
          {ad.muxPlaybackId ? (
            /*
              MuxPlayer rather than a <video src>, because Mux serves HLS and
              a plain video tag only plays that natively in Safari.

              Silent, looping, no controls — the card is a preview. Sound and
              a scrub bar live in the lightbox, behind a deliberate click, so
              this never competes with the real player at the top of the page.
            */
            <MuxPlayer
              playbackId={ad.muxPlaybackId}
              metadata={{ video_title: `Ad creative — ${ad.angle}` }}
              streamType="on-demand"
              thumbnailTime={0}
              autoPlay="muted"
              muted
              loop
              playsInline
              nohotkeys
              style={{
                height: '100%',
                width: '100%',
                '--controls': 'none',
                '--media-object-fit': 'cover',
                pointerEvents: 'none',
              }}
            />
          ) : ad.src ? (
            ad.format === 'video' ? (
              <video
                className="h-full max-w-full object-contain"
                src={ad.src}
                poster={ad.poster}
                muted
                loop
                playsInline
                autoPlay
                preload="metadata"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ad.src} alt="" className="h-full max-w-full object-contain" />
            )
          ) : (
            <PlaceholderSlot format={ad.format} />
          )}
          </span>
        </span>

        <span
          className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] text-white/80 backdrop-blur-sm"
          style={{ background: 'rgba(0,0,0,0.55)' }}
        >
          {ad.format === 'video' ? <Film size={9} aria-hidden="true" /> : <ImageIcon size={9} aria-hidden="true" />}
          {ad.format}
        </span>

        {/* Affordance. Without it nothing says the card opens. */}
        {hasMedia && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-full opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover/media:opacity-100 group-focus-visible/media:opacity-100"
              style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              <Maximize2 size={16} className="text-white" aria-hidden="true" />
            </span>
          </span>
        )}
      </button>

      {/* Link card */}
      <div
        className="flex items-center gap-2 px-3 py-2.5"
        style={{ background: 'rgba(255,255,255,0.04)' }}
      >
        <span className="min-w-0 flex-1">
          <span className="block text-[9px] uppercase tracking-[0.1em] text-white/30">
            yourfirm.com
          </span>
          <span className="block truncate text-[11px] font-bold leading-tight text-white/85">
            {ad.headline}
          </span>
        </span>
        <span className="shrink-0 rounded-md px-2 py-1 text-[10px] font-bold text-white/70"
              style={{ background: 'rgba(255,255,255,0.1)' }}>
          Learn more
        </span>
      </div>

      {/* Illustrative figures. The panel-level label above says so. */}
      <dl
        className="grid grid-cols-3 border-t text-center"
        style={{ borderColor: 'rgba(255,255,255,0.08)' }}
      >
        {[
          { k: 'Leads', v: <AnimatedNumber value={ad.leads} format={(n) => String(Math.round(n))} animateOnView duration={900} /> },
          { k: 'Per lead', v: <AnimatedNumber value={ad.costPerLead} format={(n) => `$${Math.round(n)}`} animateOnView duration={900} /> },
          { k: 'CTR', v: <AnimatedNumber value={ad.ctr} format={(n) => `${n.toFixed(1)}%`} animateOnView duration={900} /> },
        ].map((cell) => (
          <div key={cell.k} className="px-1 py-2">
            <dt className="text-[9px] font-black uppercase tracking-[0.1em] text-white/30">{cell.k}</dt>
            <dd className="mt-0.5 text-xs font-black text-white/80">{cell.v}</dd>
          </div>
        ))}
      </dl>
    </motion.li>
  );
}

export default function AdCreativeLab() {
  const [filter, setFilter] = useState<Filter>('all');
  const [open, setOpen] = useState<AdCreative | null>(null);
  const close = useCallback(() => setOpen(null), []);


  const shown = useMemo(
    () => (filter === 'all' ? AD_CREATIVES : AD_CREATIVES.filter((a) => a.format === filter)),
    [filter],
  );

  /** What the "click any ad" button opens. First video, else first creative
   *  with media — never a placeholder slot, which would open an empty box. */
  const firstPlayable = useMemo(
    () =>
      shown.find((a) => a.format === 'video' && (a.muxPlaybackId || a.src)) ??
      shown.find((a) => a.muxPlaybackId || a.src) ??
      null,
    [shown],
  );

  return (
    <div>
      <div
        className="overflow-hidden rounded-2xl border md:rounded-3xl"
        style={{ background: PANEL, borderColor: 'rgba(255,255,255,0.1)' }}
      >
        <Chrome />

        <div className="p-4 sm:p-5">
          {/*
            The example label lives INSIDE the panel, above the numbers it
            qualifies. A disclaimer under a screenshot is read after the
            screenshot has already made its claim, and the reader here is a
            CPA who checks things.
          */}
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em]"
              style={{
                color: '#fbbf24',
                background: 'rgba(251,191,36,0.1)',
                borderColor: 'rgba(251,191,36,0.3)',
              }}
            >
              <Sparkles size={11} aria-hidden="true" />
              Example account — illustrative figures
            </span>

            {/* Format filter. Shows that both formats run, without a sentence
                claiming it. */}
            <div
              className="ml-auto flex shrink-0 rounded-full p-0.5"
              style={{ background: 'rgba(255,255,255,0.05)' }}
              role="group"
              aria-label="Filter creatives by format"
            >
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  aria-pressed={filter === f.id}
                  className="relative rounded-full px-3 py-1 text-[11px] font-bold transition-colors"
                  style={{ color: filter === f.id ? '#ffffff' : 'rgba(255,255,255,0.45)' }}
                >
                  {filter === f.id && (
                    <motion.span
                      layoutId="ad-format-filter"
                      className="absolute inset-0 rounded-full"
                      style={{ background: 'rgba(255,255,255,0.12)' }}
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{f.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/*
            The click affordance, said out loud.

            Until now the only hint that a creative opens was a maximise
            icon that faded in on hover — invisible on a phone, where there
            is no hover, and easy to miss on a desktop. A prospect scrolling
            past a wall of ad cards had no reason to think any of them did
            anything.

            It is a real button, not a label: it opens the first playable
            creative, so the instruction and the thing it describes are the
            same control. Shimmer rim borrowed from the Meta chip on the
            VSL — p-[1px] rim, own clipping layer, opaque interior, or the
            light rotates through the middle instead of around the edge.
          */}
          {firstPlayable && (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() => setOpen(firstPlayable)}
                className="group/cta relative inline-flex rounded-full p-[1px] transition-transform hover:scale-[1.03] active:scale-[0.98]"
              >
                <span
                  className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
                  aria-hidden="true"
                >
                  <span
                    className="absolute inset-[-100%] animate-[shimmer_5s_linear_infinite]"
                    style={{
                      background:
                        'conic-gradient(from 0deg at 50% 50%, #4ade80, #166534, #4ade80, #166534, #4ade80)',
                    }}
                  />
                </span>
                <span
                  className="relative z-10 inline-flex items-center gap-2 rounded-full px-4 py-2"
                  style={{
                    background:
                      'linear-gradient(rgba(34,197,94,0.12), rgba(34,197,94,0.12)), #0b1220',
                  }}
                >
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                    style={{ background: '#22c55e' }}
                    aria-hidden="true"
                  >
                    <Play size={10} className="ml-[1px] text-[#052e16]" fill="#052e16" />
                  </span>
                  <span className="text-xs sm:text-sm font-semibold tracking-wide text-green-400">
                    Click any ad to watch it full size
                  </span>
                </span>
              </button>
            </div>
          )}

          <motion.ul layout className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((ad) => (
              <CreativeCard key={ad.id} ad={ad} onOpen={() => setOpen(ad)} />
            ))}
          </motion.ul>

          <p className="mt-4 text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Several angles run at once. The ones that do not earn their spend get paused, and the
            budget moves to the ones that do. That is the job — not guessing the perfect ad up
            front.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {open && <CreativeLightbox key={open.id} ad={open} onClose={close} />}
      </AnimatePresence>
    </div>
  );
}
