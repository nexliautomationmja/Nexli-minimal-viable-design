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
// ---------------------------------------------------------------------------
import type React from 'react';
import MuxPlayer, { type MuxCSSProperties } from '@mux/mux-player-react';

export interface AvatarPlayerProps {
  playbackId: string;
  name: string;
  mode: 'preview' | 'full';
  /** Our own still (portrait.webp), so the frame before play matches the card. */
  poster?: string | null;
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
  autoPlay = false,
  onPlaying,
  className,
  style,
}: AvatarPlayerProps) {
  const preview = mode === 'preview';
  return (
    <MuxPlayer
      playbackId={playbackId}
      metadata={{ video_title: `AI avatar: ${name}` }}
      streamType="on-demand"
      poster={poster ?? undefined}
      playsInline
      defaultHiddenCaptions
      accentColor="#22d3ee"
      // No hotkeys prop: this mux-player version exposes hotkeys as a
      // read-only property, and setting it throws and takes the page down.
      {...(preview
        ? { muted: true, autoPlay: 'muted' as const, loop: true, nohotkeys: true }
        : { autoPlay: autoPlay ? ('any' as const) : false })}
      onPlaying={onPlaying}
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
  );
}
