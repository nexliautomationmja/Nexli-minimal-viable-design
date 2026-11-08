// ---------------------------------------------------------------------------
// Daniela, as a face.
//
// WHY THIS IS NOT JUST AN <img className="rounded-full">. The source is
// /daniela-headshot.png, which despite the filename is not a headshot: it is
// an 800x800 three-quarter lifestyle portrait, framed from the knees up in an
// amber-lit lounge, with her face in the top quarter and slightly left of
// centre. Because the source is already square, object-cover crops nothing —
// a plain rounded-full shrinks the entire scene, chair and table included,
// into the circle. At 36px that is a gold-and-dark smudge rather than a
// person. components/booking/DanielaFaq.tsx and components/RainmakerDemo.tsx
// both render it that way today.
//
// THE CROP, AND WHY THESE NUMBERS. A CSS transform does what object-position
// cannot here, because we need to zoom as well as shift. With
// transform: scale(s) about origin (ox, oy), a source point u lands at
// ox + (u - ox) * s. Her face sits at roughly (48%, 27%); solving for it to
// land dead centre at scale 2.4 gives ox = 47%, oy = 11%. Scale 2.4 shows
// head and shoulders rather than just the face, which is what reads as a
// portrait at small sizes.
//
// Change the scale and you must re-solve the origin, or her chin leaves the
// circle. The arithmetic is above; use it.
// ---------------------------------------------------------------------------

'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

// ── The source ───────────────────────────────────────────────────────────
//
// /daniela-avatar.png is PRE-CROPPED: a 512x512 square cut from the face of
// daniela_petrol_teal_desk_front_new_16x9_final.png (2752x1548, petrol-teal
// blazer, desk). That is why there is no transform here any more.
//
// The previous source, /daniela-headshot.png, needed one. Despite the name
// it is a three-quarter seated lifestyle shot — knees up, amber lounge, face
// in the top quarter — and since it is already square, object-cover crops
// nothing, so a plain rounded-full shrank the whole scene into the circle.
// That needed scale(2.4) about a 47% 11% origin, solved so her face landed
// dead centre. Cropping the source instead is both sharper per byte and one
// less thing to get wrong.
//
// SWAPPING THE IMAGE: crop the new one to a square on the face first —
//   sips --cropOffset <top> <left> -c <size> <size> in.png --out out.png
//   sips -Z 512 out.png
// — rather than reaching for a CSS transform. A 5MB 16:9 original in
// public/ to render a 36px circle is most of a megabyte per visitor for
// pixels nobody sees.
const SRC = '/daniela-avatar.png';

// xs sits inline in an answer's name row on a phone, where a 36px column
// down the left would cost the bubble a tenth of a 390px screen. md is the
// phone's hero size: 88px plus an eyebrow underneath was a full screen-row
// above the headline before anyone read a word.
const PX = { xs: 24, sm: 36, md: 48, lg: 88 } as const;

/**
 * The story ring, Instagram's grammar: a bright ring means there is
 * something new to watch, a thin grey one means it has been watched. The
 * ring sits OUTSIDE the photo, with a sliver of page colour between, so the
 * face stays the size it was.
 *
 * CANDOR'S GREEN, THICK, AND ALIVE. Marcel wants it to read as a story at
 * a glance, something with activity behind it that you are meant to tap: so
 * it is the lime of the Candor chip above it (the one other lime thing on
 * the page), about twice Instagram's weight, with a highlight that travels
 * round it (.story-ring-spin: the gradient has one bright spot, and the
 * ring turns) and a lime glow behind it that breathes (.story-glow). Both
 * are in app/globals.css, which holds them still under reduced motion.
 * Only while unwatched: a watched ring is a still, grey hairline in the
 * same box, so nothing shifts when it changes.
 */
const STORY_RING = {
  md: { ring: 4, seen: 1.5, gap: 2 },
  lg: { ring: 6, seen: 2, gap: 3 },
} as const;
const STORY_NEW =
  'conic-gradient(from 0deg, #f7fee7 0deg, #a3e635 55deg, #65a30d 150deg, #a3e635 230deg, #84cc16 300deg, #f7fee7 360deg)';
const STORY_SEEN = 'rgba(255,255,255,0.22)';
const GLOW_NEW = 'radial-gradient(circle, rgba(163,230,53,0.34) 0%, transparent 70%)';
const GLOW = 'radial-gradient(circle, rgba(59,130,246,0.28) 0%, transparent 70%)';
const PAGE = '#020617';

export default function DanielaAvatar({
  size = 'sm',
  presence = false,
  story,
  className = '',
}: {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** The pulsing "available" dot. One instance per page — it is part of the motion budget. */
  presence?: boolean;
  /** Draw the story ring. md and lg only — at 36px a ring is a smudge. */
  story?: 'new' | 'seen';
  className?: string;
}) {
  const px = PX[size];
  const lg = size === 'lg' || size === 'md';
  const ring = story && lg ? STORY_RING[size as 'md' | 'lg'] : null;
  const pad = ring ? ring.ring + ring.gap : 0;
  const box = px + pad * 2;

  return (
    <span className={`relative inline-flex shrink-0 ${className}`} style={{ width: box, height: box }}>
      {/* The glow only on the large one. At 36px it reads as a smudge. */}
      {lg && (
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute -inset-4 rounded-full transition-[background] duration-500 ${
            ring && story === 'new' ? 'story-glow' : ''
          }`}
          style={{ background: ring && story === 'new' ? GLOW_NEW : GLOW }}
        />
      )}

      {ring && (
        <>
          <span
            aria-hidden="true"
            className={`absolute inset-0 rounded-full transition-[background] duration-500 ${
              story === 'new' ? 'story-ring-spin' : ''
            }`}
            style={{ background: story === 'new' ? STORY_NEW : STORY_SEEN }}
          />
          <span
            aria-hidden="true"
            className="absolute rounded-full"
            style={{ inset: story === 'new' ? ring.ring : ring.seen, background: PAGE }}
          />
        </>
      )}

      <span
        className={`relative block overflow-hidden rounded-full ${
          ring ? '' : lg ? 'border border-2 border-blue-400/30' : 'border border-green-500/30'
        }`}
        style={{ width: px, height: px, margin: pad }}
      >
        <Image
          src={SRC}
          alt="Daniela, COO of Nexli"
          width={px * 3}
          height={px * 3}
          priority={lg}
          className="h-full w-full object-cover"
        />
      </span>

      {presence && (
        <span
          className={`absolute rounded-full border-2 bg-green-500 ${
            size === 'lg' ? 'h-4 w-4' : size === 'md' ? 'h-3 w-3' : 'h-2.5 w-2.5'
          }`}
          style={{
            right: (size === 'lg' ? 2 : 0) + pad,
            bottom: (size === 'lg' ? 2 : 0) + pad,
            borderColor: PAGE,
          }}
        >
          {/* Same pulse as the avatar stack in components/Hero.tsx. */}
          <motion.span
            aria-hidden="true"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full bg-green-400"
          />
        </span>
      )}
    </span>
  );
}
