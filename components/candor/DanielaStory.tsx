'use client';

// ---------------------------------------------------------------------------
// Daniela's story — her photo at the top of /candor, and what it opens.
//
// THE GRAMMAR IS INSTAGRAM'S, because every firm owner already knows it: a
// ring around a face means "there's something to watch", tapping it opens
// the video full screen with a progress line across the top, the face and
// name under it, and a reply box at the bottom. Here the reply box is
// Candor: whatever they type is asked the moment the story closes, so the
// video hands straight over to the conversation instead of ending in a dead
// screen.
//
// SOUND ON, WHICH IS WHY THE PLAYER IS ALWAYS MOUNTED. iOS Safari only lets
// a video play with sound if play() is called inside the tap itself. A
// player mounted when the story opens is not ready inside that tap, so it
// would start muted, every time, on the phones most of these links are
// opened on. So the player is mounted hidden with the page (preload none:
// nothing downloads until the first tap) and the tap calls play() on it
// directly. If a browser refuses anyway, it plays muted and a "Tap for
// sound" pill says so.
//
// NO MUX CONTROLS. A story has a progress line, not a scrubber with a
// settings menu. The line is still draggable — it is 2½ minutes, and "skip
// to the math" is a reasonable thing to want — and the keyboard works:
// Space pauses, M mutes, the arrows jump 5 seconds, Escape closes.
//
// 2× IS TIKTOK'S. Press and hold the video and she talks at double speed
// until you let go; swipe down (holding or not) and it stays at 2× until
// you swipe down again or tap the "2×" pill. Pitch is preserved — every
// browser keeps it by default — so faster is faster, not a cartoon. The
// gestures are invisible, so there is also a 1×/2× button in the header
// (and the S key), and a one-time hint the first time the story plays.
//
// PARAGRAPH COLOURS ARE INLINE for the reason given in candor-client: the
// unlayered `p` rule in globals.css beats a Tailwind colour class.
// ---------------------------------------------------------------------------

import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import MuxPlayer, { type MuxPlayerRefAttributes } from '@mux/mux-player-react';
import { ArrowUp, FastForward, MessageCircle, Play, RotateCcw, Volume2, VolumeX, X } from 'lucide-react';
import DanielaAvatar from '@/components/candor/DanielaAvatar';
import { CANDOR_GREEN } from '@/components/candor/CandorChip';
import {
  INTRO_DURATION,
  INTRO_PLAYBACK_ID,
  INTRO_SEEN_KEY,
  INTRO_TRANSCRIPT,
} from '@/lib/candor-intro';

const PAGE = '#020617';

/** How long a press has to last before it is a hold, not a tap. */
const HOLD_MS = 260;
/** How far down a finger has to travel to count as a swipe. */
const SWIPE_PX = 56;
/** Shown once per browser, the first time the story plays. */
const HINT_KEY = 'nexli:candor:story-2x-hint';

/** "Watched", per browser. A convenience: it only decides the ring's colour. */
export function useStorySeen(): [boolean, () => void] {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    try {
      setSeen(window.localStorage.getItem(INTRO_SEEN_KEY) === '1');
    } catch {
      // Blocked storage: the ring just stays lit.
    }
  }, []);
  const markSeen = useCallback(() => {
    setSeen(true);
    try {
      window.localStorage.setItem(INTRO_SEEN_KEY, '1');
    } catch {}
  }, []);
  return [seen, markSeen];
}

/**
 * The large portrait, as a story. The badge is Instagram's LIVE pill in
 * this page's colours, carrying the runtime — the same "▶ 0:21" the chips
 * use, so a play glyph means one thing on this page.
 */
export function StoryPortrait({
  seen,
  onOpen,
}: {
  seen: boolean;
  onOpen: (trigger: HTMLElement) => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => onOpen(e.currentTarget)}
      aria-label={`Watch Daniela's intro, ${INTRO_DURATION}`}
      className="group relative inline-flex touch-manipulation rounded-full outline-none [-webkit-tap-highlight-color:transparent] focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-4 focus-visible:ring-offset-[#020617]"
    >
      <span className="transition-transform duration-200 group-hover:scale-[1.04] group-active:scale-95">
        <DanielaAvatar size="lg" presence story={seen ? 'seen' : 'new'} />
      </span>
      <span
        aria-hidden="true"
        className="absolute -bottom-2.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full border-2 px-2 py-[3px] text-[10px] font-bold leading-none tabular-nums"
        style={{
          borderColor: PAGE,
          // The ring's lime while unwatched, with page-dark text on it.
          background: seen ? '#1e293b' : CANDOR_GREEN,
          color: seen ? 'rgba(255,255,255,0.7)' : PAGE,
        }}
      >
        <Play size={8} fill="currentColor" strokeWidth={0} />
        {INTRO_DURATION}
      </span>
    </button>
  );
}

export interface StoryHandle {
  /** Opens the story and starts it. Call it from the tap itself. */
  open: (trigger?: HTMLElement | null) => void;
}

const fmt = (s: number) => {
  const t = Math.max(0, Math.floor(s));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
};

export function StoryViewer({
  ref,
  onAsk,
  onOpened,
  disabled = false,
}: {
  ref?: React.Ref<StoryHandle>;
  /** A question typed into the story's reply box. The story is closed first. */
  onAsk: (question: string) => void;
  onOpened?: () => void;
  /** Candor is mid-answer: the reply box cannot send. */
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [muted, setMuted] = useState(false);
  /** The browser refused sound, so it is playing muted. */
  const [needsSound, setNeedsSound] = useState(false);
  const [ended, setEnded] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  /** The asset's real length once known; 2:23 until then. */
  const [total, setTotal] = useState(142.5);
  const [reply, setReply] = useState('');
  /** 2× while a finger is held down on the video. */
  const [holding, setHolding] = useState(false);
  /** 2× kept on after a swipe down, the S key or the header button. */
  const [locked, setLocked] = useState(false);
  const [hint, setHint] = useState(false);
  const fast = holding || locked;

  const player = useRef<MuxPlayerRefAttributes>(null);
  const panel = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLElement | null>(null);

  const paint = useCallback(() => {
    const p = player.current;
    const f = fill.current;
    if (!p || !f) return;
    const d = p.duration;
    f.style.transform = `scaleX(${d > 0 ? Math.min(1, p.currentTime / d) : 0})`;
  }, []);

  const start = useCallback(() => {
    const p = player.current;
    if (!p) return;
    p.muted = false;
    const attempt = p.play();
    attempt?.catch?.(() => {
      // No sound allowed without a tap the browser counts. Play muted and
      // say so, rather than not playing at all.
      p.muted = true;
      setNeedsSound(true);
      p.play()?.catch?.(() => {});
    });
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      open: (from) => {
        trigger.current = from ?? (document.activeElement as HTMLElement | null);
        setOpen(true);
        onOpened?.();
        // Reopened, it carries on where they closed it — 2½ minutes is long
        // enough that an accidental close should not cost them their place.
        // Unless it is all but over: then it starts again, rather than
        // playing the last second and showing the end card.
        const p = player.current;
        if (p && (p.ended || (p.duration > 0 && p.currentTime >= p.duration - 5))) {
          p.currentTime = 0;
          setEnded(false);
        }
        // Synchronously, inside the tap. See the header.
        start();
        try {
          if (!window.localStorage.getItem(HINT_KEY)) {
            window.localStorage.setItem(HINT_KEY, '1');
            setHint(true);
          }
        } catch {}
      },
    }),
    [onOpened, start],
  );

  const close = useCallback(() => {
    setOpen(false);
    setHolding(false);
    setHint(false);
    player.current?.pause();
    trigger.current?.focus({ preventScroll: true });
  }, []);

  const toggle = useCallback(() => {
    const p = player.current;
    if (!p) return;
    if (p.ended || ended) {
      p.currentTime = 0;
      setEnded(false);
      start();
    } else if (p.paused) {
      start();
    } else {
      p.pause();
    }
  }, [ended, start]);

  const seekBy = useCallback(
    (delta: number) => {
      const p = player.current;
      if (!p || !(p.duration > 0)) return;
      p.currentTime = Math.max(0, Math.min(p.duration - 0.1, p.currentTime + delta));
      setEnded(false);
      paint();
    },
    [paint],
  );

  const unmute = useCallback(() => {
    const p = player.current;
    if (!p) return;
    p.muted = !p.muted;
    if (!p.muted) setNeedsSound(false);
    if (p.paused && !p.ended) start();
  }, [start]);

  // The rate follows the gesture. Re-applied on `playing` too: loading a
  // source resets a media element to its default rate, and the first play
  // is what loads this one (preload none).
  const applyRate = useCallback(() => {
    const p = player.current;
    if (p) p.playbackRate = fast ? 2 : 1;
  }, [fast]);
  useEffect(applyRate, [applyRate]);

  useEffect(() => {
    if (!hint) return;
    const id = window.setTimeout(() => setHint(false), 5000);
    return () => window.clearTimeout(id);
  }, [hint]);

  const toggleLock = useCallback(() => {
    setLocked((l) => !l);
    setHint(false);
  }, []);

  /**
   * One press on the video, three meanings: a tap pauses, a hold is 2× for
   * as long as it lasts, a swipe down keeps 2× on (or turns it off). The
   * press is tracked here and the click that follows a hold or a swipe is
   * swallowed, so letting go of a hold does not also pause the video.
   */
  const press = useRef<{ x: number; y: number; timer: number; held: boolean; swiped: boolean } | null>(null);
  const swallowClick = useRef(false);

  const onPressStart = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    swallowClick.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
    const timer = window.setTimeout(() => {
      const s = press.current;
      if (!s || s.swiped) return;
      s.held = true;
      setHolding(true);
      setHint(false);
      const p = player.current;
      if (p?.paused && !p.ended) start();
    }, HOLD_MS);
    press.current = { x: e.clientX, y: e.clientY, timer, held: false, swiped: false };
  };

  const onPressMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const s = press.current;
    if (!s || s.swiped) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (dy > SWIPE_PX && dy > Math.abs(dx) * 1.5) {
      s.swiped = true;
      window.clearTimeout(s.timer);
      toggleLock();
      // A tick on Android. iOS has no vibration API; the pill says it.
      navigator.vibrate?.(12);
    } else if (!s.held && Math.hypot(dx, dy) > 12) {
      // Moving before the hold kicks in: a swipe in progress, not a hold.
      window.clearTimeout(s.timer);
    }
  };

  const onPressEnd = () => {
    const s = press.current;
    if (!s) return;
    window.clearTimeout(s.timer);
    if (s.held || s.swiped) swallowClick.current = true;
    press.current = null;
    setHolding(false);
  };

  // The progress line runs on animation frames, not timeupdate, which only
  // fires about four times a second and makes the line step.
  useEffect(() => {
    if (!open || !playing) return;
    let id = 0;
    const tick = () => {
      paint();
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [open, playing, paint]);

  // Focus, keys, and the page underneath held still — the same three
  // things components/candor/ChatHistory does for its drawer.
  useEffect(() => {
    if (!open) return;
    panel.current?.focus({ preventScroll: true });
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      if (e.key === 'Tab') {
        // Keep Tab inside the story.
        const items = panel.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [role="slider"]',
        );
        if (!items?.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
        return;
      }
      // Typing a question is not a shortcut.
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (e.key === ' ' || e.key === 'k') {
        // A focused button already toggles itself on Space.
        if ((e.target as HTMLElement)?.tagName === 'BUTTON') return;
        e.preventDefault();
        toggle();
      } else if (e.key === 'm') {
        unmute();
      } else if (e.key === 's') {
        toggleLock();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        seekBy(5);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        seekBy(-5);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close, toggle, unmute, seekBy, toggleLock]);

  /** Drag along the line to scrub. */
  const scrubTo = (clientX: number) => {
    const p = player.current;
    const el = bar.current;
    if (!p || !el || !(p.duration > 0)) return;
    const r = el.getBoundingClientRect();
    const f = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    p.currentTime = Math.min(p.duration - 0.1, f * p.duration);
    setEnded(false);
    setElapsed(p.currentTime);
    paint();
  };

  const send = () => {
    const q = reply.trim();
    if (!q || disabled) return;
    setReply('');
    close();
    onAsk(q);
  };

  const showSoundPill = open && muted && needsSound && !ended;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Daniela's intro video"
      aria-hidden={!open}
      inert={!open}
      // Visibility flips ON at once and OFF only after the fade. Transitioned
      // both ways, the dialog is still visibility:hidden on the frame the
      // open effect runs, focus() silently fails, and Space then lands on
      // the photo button behind it — which reopens the story, not pauses it.
      className={`fixed inset-0 z-[200] flex items-center justify-center duration-200 ${
        open
          ? 'visible opacity-100 transition-opacity'
          : 'pointer-events-none invisible opacity-0 transition-[opacity,visibility]'
      }`}
      style={{
        paddingTop: 'max(12px, env(safe-area-inset-top))',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
      }}
    >
      {/* The page, dimmed almost to black. Clicking it closes, as on
          Instagram's desktop viewer. */}
      <div aria-hidden="true" className="absolute inset-0 backdrop-blur-xl" style={{ background: 'rgba(2,6,23,0.94)' }} onClick={close} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.16) 0%, transparent 65%)' }}
      />

      <div
        ref={panel}
        tabIndex={-1}
        className={`relative flex flex-col gap-3 outline-none transition-transform duration-300 ease-out ${
          open ? 'scale-100' : 'scale-[0.96]'
        }`}
        // Sized off the HEIGHT as well as the width: a 9:16 card has to fit
        // the screen with the reply box under it, on a short laptop as much
        // as a tall phone. svh so iOS's toolbars are allowed for.
        style={{
          width:
            'min(calc(100vw - 16px), 440px, calc((100svh - 100px - env(safe-area-inset-top) - env(safe-area-inset-bottom)) * 0.5625))',
        }}
      >
        <div className="relative w-full overflow-hidden rounded-2xl bg-black shadow-2xl shadow-black/60" style={{ aspectRatio: '9 / 16' }}>
          <MuxPlayer
            ref={player}
            playbackId={INTRO_PLAYBACK_ID}
            streamType="on-demand"
            preload="none"
            thumbnailTime={0}
            nohotkeys
            // The captions are burned into the picture. If Mux ever gets a
            // text track for this asset, it must not draw a second set.
            defaultHiddenCaptions
            metadata={{ video_title: 'Candor — intro story' }}
            accentColor="#22d3ee"
            onPlay={() => {
              setPlaying(true);
              setEnded(false);
            }}
            onPlaying={() => {
              setBuffering(false);
              applyRate();
            }}
            onWaiting={() => setBuffering(true)}
            onPause={() => {
              setPlaying(false);
              paint();
            }}
            onEnded={() => {
              setPlaying(false);
              setEnded(true);
              paint();
            }}
            onTimeUpdate={() => {
              const t = player.current?.currentTime ?? 0;
              setElapsed((prev) => (Math.floor(prev) === Math.floor(t) ? prev : t));
            }}
            onVolumeChange={() => setMuted(!!player.current?.muted)}
            onDurationChange={() => {
              const d = player.current?.duration;
              if (d && d > 0 && Number.isFinite(d)) setTotal(d);
            }}
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
              '--controls': 'none',
              '--media-object-fit': 'cover',
            }}
          />

          {/* Tap to pause, hold for 2×, swipe down to keep 2×. touch-none
              so the browser does not claim the swipe as a scroll; no
              callout or selection so iOS does not answer a hold with a
              magnifier. Keyboard Enter/Space still arrive as a click. */}
          <button
            type="button"
            onClick={() => {
              if (swallowClick.current) {
                swallowClick.current = false;
                return;
              }
              toggle();
            }}
            onPointerDown={onPressStart}
            onPointerMove={onPressMove}
            onPointerUp={onPressEnd}
            onPointerCancel={onPressEnd}
            onContextMenu={(e) => e.preventDefault()}
            aria-label={playing ? 'Pause' : 'Play'}
            className="absolute inset-0 cursor-pointer touch-none select-none outline-none [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none]"
          />

          {/* Top: the line, then who this is. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/65 via-black/25 to-transparent" />
          <div className="absolute inset-x-0 top-0 z-10 px-3 pt-2">
            <div
              ref={bar}
              role="slider"
              tabIndex={0}
              aria-label="Position in the video"
              aria-valuemin={0}
              aria-valuemax={Math.round(total)}
              aria-valuenow={Math.round(elapsed)}
              aria-valuetext={`${fmt(elapsed)} of ${INTRO_DURATION}`}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                  e.preventDefault();
                  e.stopPropagation();
                  seekBy(e.key === 'ArrowRight' ? 5 : -5);
                }
              }}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                scrubTo(e.clientX);
              }}
              onPointerMove={(e) => {
                if (e.currentTarget.hasPointerCapture(e.pointerId)) scrubTo(e.clientX);
              }}
              className="relative h-4 cursor-pointer touch-none rounded outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-white/30">
                <div ref={fill} className="h-full w-full origin-left rounded-full bg-white" style={{ transform: 'scaleX(0)' }} />
              </div>
            </div>

            <div className="mt-1 flex items-center gap-2.5">
              <DanielaAvatar size="sm" />
              <div className="min-w-0 leading-tight">
                <div className="truncate text-[13.5px] font-semibold text-white">
                  Daniela <span className="font-normal text-white/65">· COO, Nexli</span>
                </div>
                <div className="text-[11.5px] tabular-nums text-white/60">
                  {fmt(elapsed)} / {INTRO_DURATION}
                </div>
              </div>
              <div className="ml-auto flex items-center">
                <button
                  type="button"
                  onClick={toggleLock}
                  aria-pressed={locked}
                  aria-label="Double speed"
                  className={`flex h-10 min-w-10 items-center justify-center rounded-full px-1.5 text-[13px] font-bold tabular-nums transition-colors [-webkit-tap-highlight-color:transparent] ${
                    locked ? 'text-cyan-300 hover:bg-white/10' : 'text-white/90 hover:bg-white/10'
                  }`}
                >
                  {locked ? '2×' : '1×'}
                </button>
                <button
                  type="button"
                  onClick={unmute}
                  aria-label={muted ? 'Turn sound on' : 'Mute'}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-white/90 transition-colors [-webkit-tap-highlight-color:transparent] hover:bg-white/10"
                >
                  {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-white/90 transition-colors [-webkit-tap-highlight-color:transparent] hover:bg-white/10"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {showSoundPill && (
              <div className="mt-2 flex justify-center">
                <button
                  type="button"
                  onClick={unmute}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-900 shadow-lg shadow-black/40"
                >
                  <VolumeX size={15} /> Tap for sound
                </button>
              </div>
            )}

            {/* TikTok's "2×" badge. While a finger is down it says how to
                keep it; once kept, it is the way back to 1×. */}
            {open && fast && !ended && (
              <div className="mt-2 flex justify-center">
                {locked && !holding ? (
                  <button
                    type="button"
                    onClick={toggleLock}
                    className="inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3.5 py-2 text-[13px] font-semibold text-white backdrop-blur-md"
                  >
                    <FastForward size={14} fill="currentColor" strokeWidth={0} className="text-cyan-300" />
                    2× <span className="font-normal text-white/65">· tap for 1×</span>
                  </button>
                ) : (
                  <span
                    role="status"
                    className="inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3.5 py-2 text-[13px] font-semibold text-white backdrop-blur-md"
                  >
                    <FastForward size={14} fill="currentColor" strokeWidth={0} className="text-cyan-300" />
                    2×{' '}
                    <span className="font-normal text-white/65">
                      {locked ? '· locked' : '· swipe down to keep it'}
                    </span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* The first time only: the gestures exist. */}
          <div
            aria-hidden={!hint}
            className={`pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-4 transition-opacity duration-500 ${
              hint && !fast && !ended ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3.5 py-2 text-[12.5px] font-medium text-white/90 backdrop-blur-md">
              <FastForward size={13} fill="currentColor" strokeWidth={0} className="text-cyan-300" />
              Hold for 2× · swipe down to keep it
            </span>
          </div>

          {/* Paused, or still loading. */}
          {open && !ended && (!playing || buffering) && (
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
              {buffering && playing ? (
                <span className="h-10 w-10 animate-spin rounded-full border-[3px] border-white/25 border-t-white" />
              ) : (
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm">
                  <Play size={26} fill="currentColor" strokeWidth={0} className="ml-1" />
                </span>
              )}
            </div>
          )}

          {/* The end: watch again, or ask her something. */}
          {ended && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 px-8 text-center backdrop-blur-[2px]">
              <p className="text-lg font-bold text-white" style={{ color: '#ffffff' }}>
                What&apos;s holding you back?
              </p>
              <p className="-mt-1 text-[13.5px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.72)' }}>
                Ask me below. I&apos;ll give you a straight answer before your call.
              </p>
              <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => input.current?.focus()}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 px-4 text-[13.5px] font-semibold text-white shadow-lg shadow-blue-500/30"
                >
                  <MessageCircle size={15} /> Ask a question
                </button>
                <button
                  type="button"
                  onClick={toggle}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full border border-white/25 px-4 text-[13.5px] font-semibold text-white/85 hover:bg-white/10"
                >
                  <RotateCcw size={15} /> Watch again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* The reply box. On Instagram it messages the poster; here it asks
            Candor, in her voice, the moment the story closes. */}
        <form
          className="flex items-center gap-2 px-1 sm:px-0"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <label htmlFor="story-reply" className="sr-only">
            Ask Daniela a question
          </label>
          <input
            id="story-reply"
            ref={input}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            // Instagram pauses while you type a reply. So does this.
            onFocus={() => player.current?.pause()}
            placeholder="Ask Daniela anything…"
            autoComplete="off"
            enterKeyHint="send"
            maxLength={1000}
            // 16px or iOS zooms the page on focus; appearance-none or
            // Safari paints its own grey field underneath.
            className="h-12 min-w-0 flex-1 appearance-none rounded-full border border-white/20 bg-white/[0.05] px-5 text-[16px] text-white shadow-none outline-none transition-colors placeholder:text-white/45 focus:border-cyan-300/60"
          />
          <button
            type="submit"
            disabled={disabled || !reply.trim()}
            aria-label="Ask"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/30 transition-transform [-webkit-tap-highlight-color:transparent] hover:scale-105 active:scale-95 disabled:from-white/10 disabled:to-white/10 disabled:text-white/30 disabled:shadow-none disabled:hover:scale-100"
          >
            <ArrowUp size={18} />
          </button>
        </form>
      </div>

      {/* The captions are burned into the picture, which a screen reader
          cannot see. This is the same words, as text. */}
      <div className="sr-only">
        <h2>Transcript</h2>
        {INTRO_TRANSCRIPT.split('\n\n').map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </div>
  );
}
