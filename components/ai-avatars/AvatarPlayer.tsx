'use client';

// ---------------------------------------------------------------------------
// An avatar's intro video, in one of two modes:
//
//   preview  silent, looping, no controls, not clickable: the hover preview
//            on a library card and the example ad. The card under it is what
//            takes the click.
//   full     sound, controls, the player in the library's pop-up and on the
//            avatar's own page.
//
// MuxPlayer rather than a <video src>, because Mux serves HLS and a plain
// video tag only plays that natively in Safari. Captions are burned into
// every one of these videos, so the player's own are hidden and its captions
// button removed: two sets on screen at once is what #46 fixed on the VSLs.
//
// The library loads this with next/dynamic, so mux-player is not in the
// page's first download; the avatar's own page imports it directly.
//
// AUTOPLAY IN FULL MODE is "any": with sound if the browser allows it,
// muted if not. Arriving from a link (the AI avatar email lands on Daniela's
// video, Marcel 2026-11-23) is not a tap the browser counts, so Chrome and
// Safari usually play it muted. Then "Tap for sound" sits over the video
// and starts it again from the top with sound: the player's own mute icon
// is too easy to miss, and they would otherwise hear her from mid-sentence.
// The player's parent must be positioned (every one is) for the button.
// ---------------------------------------------------------------------------
import type React from 'react';
import { useRef, useState } from 'react';
import { Volume2 } from 'lucide-react';
import MuxPlayer, { type MuxCSSProperties } from '@mux/mux-player-react';

export interface AvatarPlayerProps {
  playbackId: string;
  name: string;
  mode: 'preview' | 'full';
  /** Our own still (portrait.webp), so the frame before play matches the card. */
  poster?: string | null;
  /** With no poster: the second of the video Mux shows before play. */
  thumbnailTime?: number;
  autoPlay?: boolean;
  /** Fires on the first frame, so a preview can fade in over its card. */
  onPlaying?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export default function AvatarPlayer({
  playbackId,
  name,
  mode,
  poster,
  thumbnailTime,
  autoPlay = false,
  onPlaying,
  className,
  style,
}: AvatarPlayerProps) {
  const preview = mode === 'preview';
  const player = useRef<React.ComponentRef<typeof MuxPlayer>>(null);
  const firstPlay = useRef(true);
  // True while an autoplay the browser forced to mute is running.
  const [needsSound, setNeedsSound] = useState(false);

  const handlePlaying = () => {
    if (firstPlay.current) {
      firstPlay.current = false;
      if (!preview && autoPlay && player.current?.muted) setNeedsSound(true);
    }
    onPlaying?.();
  };

  const turnSoundOn = () => {
    const el = player.current;
    setNeedsSound(false);
    if (!el) return;
    el.muted = false;
    el.currentTime = 0;
    void el.play();
  };

  return (
    <>
    <MuxPlayer
      ref={player}
      playbackId={playbackId}
      metadata={{ video_title: `AI avatar: ${name}` }}
      streamType="on-demand"
      poster={poster ?? undefined}
      thumbnailTime={thumbnailTime}
      playsInline
      defaultHiddenCaptions
      accentColor="#22d3ee"
      // No hotkeys prop: this mux-player version exposes hotkeys as a
      // read-only property, and setting it throws and takes the page down.
      {...(preview
        ? { muted: true, autoPlay: 'muted' as const, loop: true, nohotkeys: true }
        : { autoPlay: autoPlay ? ('any' as const) : false })}
      onPlaying={handlePlaying}
      // Unmuted from the player's own controls: the button has done its job.
      onVolumeChange={() => {
        if (player.current && !player.current.muted) setNeedsSound(false);
      }}
      className={className}
      style={
        {
          height: '100%',
          width: '100%',
          '--media-object-fit': 'cover',
          '--captions-button': 'none',
          ...(preview ? { '--controls': 'none', pointerEvents: 'none' } : {}),
          ...style,
        } as MuxCSSProperties
      }
    />
    {needsSound && (
      <button
        type="button"
        onClick={turnSoundOn}
        className="absolute bottom-20 left-1/2 z-10 inline-flex -translate-x-1/2 touch-manipulation items-center gap-2 whitespace-nowrap rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#0b1220] shadow-xl shadow-black/40 transition-transform [-webkit-tap-highlight-color:transparent] hover:scale-[1.03] active:scale-95"
      >
        <Volume2 className="h-4 w-4" aria-hidden="true" />
        Tap for sound
      </button>
    )}
    </>
  );
}
