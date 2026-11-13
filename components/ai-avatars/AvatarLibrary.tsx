'use client';

// ---------------------------------------------------------------------------
// The library on /ai-avatars: every avatar as a 9:16 card with her intro
// video, and a pop-up player to watch it with sound.
//
// THE CARD is her portrait.webp, the selfie that matches the outfit in her
// video. On a mouse, hovering mounts a silent preview of the video that fades
// in over the still once its first frame plays; leaving unmounts it, so only
// one video streams at a time however fast someone sweeps across the grid.
// A touch screen has no hover: a tap goes straight to the pop-up.
//
// THE POP-UP plays the video with sound (the click is the gesture that lets
// a browser allow it), with previous / next, Esc, and the arrow keys to move
// along the library. It is a portal on <body>, outside the deck's scroller,
// and the deck ignores its own keys while any aria-modal dialog is open.
//
// In deck mode each card is a scroll-snap point (DECK_CSS in AvatarDeck), so
// the deck's mandatory snapping steps through the library a row at a time
// instead of jumping from its top straight to the next slide.
// ---------------------------------------------------------------------------
import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Images, Play, Sparkles, UserRound, X } from 'lucide-react';
import { avatarAlt, muxPoster } from '@/lib/ai-avatars';
import { AiBadge, type CardAvatar } from './AvatarCard';

const AvatarPlayer = dynamic(() => import('./AvatarPlayer'), { ssr: false });

const OUTFIT = { fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif" } as const;
const pad = (n: number) => String(n).padStart(2, '0');
const posterOf = (a: CardAvatar) => a.portrait ?? (a.playbackId ? muxPoster(a.playbackId) : null);

function VideoCard({ a, onOpen }: { a: CardAvatar; onOpen: (el: HTMLButtonElement) => void }) {
  const [hover, setHover] = useState(false);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const poster = posterOf(a);

  const enter = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || !a.playbackId) return;
    window.clearTimeout(timer.current);
    // A short wait, so sweeping the pointer across the grid does not start
    // (and throw away) a stream for every card it passes.
    timer.current = window.setTimeout(() => setHover(true), 140);
  };
  const leave = () => {
    window.clearTimeout(timer.current);
    setHover(false);
    setPlaying(false);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <div className="group relative" onPointerEnter={enter} onPointerLeave={leave}>
      <div className="relative aspect-[9/16] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-xl shadow-black/30 transition duration-300 group-hover:-translate-y-1 group-hover:border-cyan-400/45 group-hover:shadow-cyan-500/10">
        {poster ? (
          <Image
            src={poster}
            alt={avatarAlt(a)}
            fill
            sizes="(min-width: 1536px) 260px, (min-width: 1024px) 19vw, (min-width: 640px) 31vw, 47vw"
            className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <UserRound className="h-12 w-12 text-white/20" strokeWidth={1.2} aria-hidden="true" />
          </div>
        )}

        {hover && a.playbackId && (
          <AvatarPlayer
            mode="preview"
            playbackId={a.playbackId}
            name={a.name}
            onPlaying={() => setPlaying(true)}
            className="absolute inset-0"
            style={{ position: 'absolute', inset: 0, opacity: playing ? 1 : 0, transition: 'opacity 300ms ease' }}
          />
        )}

        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/55 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-md sm:left-2.5 sm:top-2.5 sm:text-[10px]">
          <Sparkles className="h-2.5 w-2.5 text-cyan-300" aria-hidden="true" />
          AI
        </span>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent px-3 pb-3 pt-14 sm:px-4 sm:pb-4">
          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-lg font-black leading-tight text-white sm:text-xl" style={OUTFIT}>
                {a.name}
              </div>
              <div className="mt-0.5 text-[11px] font-semibold text-white/65">
                {a.playbackId ? 'Watch her intro' : 'Photos'}
              </div>
            </div>
            {a.playbackId && (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur-md transition-colors duration-300 group-hover:bg-cyan-400 sm:h-10 sm:w-10">
                <Play className="ml-0.5 h-4 w-4 fill-white text-white" aria-hidden="true" />
              </span>
            )}
          </div>
        </div>
      </div>

      {a.playbackId ? (
        <button
          type="button"
          onClick={(e) => onOpen(e.currentTarget)}
          aria-label={`Play ${a.name}'s intro video`}
          className="absolute inset-0 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
        />
      ) : (
        <Link
          href={`/ai-avatars/${a.slug}`}
          aria-label={`${a.name}'s photos`}
          className="absolute inset-0 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
        />
      )}
    </div>
  );
}

function VideoModal({
  avatars,
  index,
  onClose,
  onStep,
}: {
  avatars: CardAvatar[];
  index: number;
  onClose: () => void;
  onStep: (by: number) => void;
}) {
  const a = avatars[index];
  const total = avatars.length;
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeBtn.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') onStep(1);
      else if (e.key === 'ArrowLeft') onStep(-1);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose, onStep]);

  if (!a?.playbackId) return null;

  const nav = (by: number, label: string, Icon: typeof ChevronLeft, side: string) => (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onStep(by);
      }}
      aria-label={label}
      className={`absolute top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-white/10 bg-white/10 p-3 text-white backdrop-blur-md transition-colors hover:bg-white/20 sm:flex ${side}`}
    >
      <Icon className="h-6 w-6" aria-hidden="true" />
    </button>
  );

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${a.name}, AI avatar intro video`}
      className="fixed inset-0 z-[300] flex items-center justify-center overscroll-contain bg-[#020617]/92 px-4 py-6 text-white backdrop-blur-md"
      style={OUTFIT}
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-w-4xl flex-col items-center gap-4 sm:gap-5 lg:flex-row lg:justify-center lg:gap-12"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-[9/16] h-[min(68svh,calc((100vw-2rem)*16/9))] overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl shadow-cyan-500/10 lg:h-[min(84svh,46rem)]">
          <AvatarPlayer
            key={a.slug}
            mode="full"
            autoPlay
            playbackId={a.playbackId}
            name={a.name}
            poster={posterOf(a)}
          />
        </div>

        <div className="w-full max-w-[min(100%,24rem)] text-center lg:max-w-xs lg:text-left">
          <AiBadge />
          <h2 className="mt-3 text-4xl font-black leading-none tracking-tight text-white lg:text-5xl" style={OUTFIT}>
            {a.name}
          </h2>
          <p className="mt-3 text-sm leading-relaxed lg:text-base" style={{ color: 'rgba(255,255,255,0.62)' }}>
            AI-generated, like every face in the library. While your firm is with us, no other client&apos;s ads
            use her.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
            <Link
              href={`/ai-avatars/${a.slug}`}
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-sm font-bold text-white no-underline shadow-lg shadow-blue-600/25"
            >
              <Images className="h-4 w-4" aria-hidden="true" />
              See her photos
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
            {/* Phones get prev / next here; the side arrows need the room. */}
            <span className="flex gap-2 sm:hidden">
              <button
                type="button"
                onClick={() => onStep(-1)}
                aria-label="Previous avatar"
                className="rounded-full border border-white/10 bg-white/10 p-2.5 text-white"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onStep(1)}
                aria-label="Next avatar"
                className="rounded-full border border-white/10 bg-white/10 p-2.5 text-white"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </span>
          </div>
          <div className="mt-5 text-xs font-semibold tabular-nums tracking-[0.12em] text-white/45">
            <span className="text-white/85">{pad(index + 1)}</span> / {pad(total)}
          </div>
        </div>
      </div>

      {nav(-1, 'Previous avatar', ChevronLeft, 'left-3 md:left-6')}
      {nav(1, 'Next avatar', ChevronRight, 'right-3 md:right-6')}

      <button
        ref={closeBtn}
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-3 top-3 z-10 rounded-full border border-white/10 bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20 md:right-6 md:top-6"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>,
    document.body,
  );
}

export default function AvatarLibrary({ avatars }: { avatars: CardAvatar[] }) {
  const playable = avatars.filter((a) => a.playbackId);
  const [open, setOpen] = useState<number | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setOpen(null);
    // Back to the card that opened it, for keyboard users.
    opener.current?.focus({ preventScroll: true });
  }, []);
  const step = useCallback(
    (by: number) => setOpen((i) => (i === null ? i : (i + by + playable.length) % playable.length)),
    [playable.length],
  );

  return (
    <>
      <ul className="grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5 lg:gap-5">
        {avatars.map((a) => (
          <li key={a.slug} data-library-card>
            <VideoCard
              a={a}
              onOpen={(el) => {
                opener.current = el;
                setOpen(playable.findIndex((p) => p.slug === a.slug));
              }}
            />
          </li>
        ))}
      </ul>
      {open !== null && <VideoModal avatars={playable} index={open} onClose={close} onStep={step} />}
    </>
  );
}
