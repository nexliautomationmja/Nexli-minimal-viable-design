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

const PX = { sm: 36, lg: 88 } as const;

export default function DanielaAvatar({
  size = 'sm',
  presence = false,
  className = '',
}: {
  size?: 'sm' | 'lg';
  /** The pulsing "available" dot. One instance per page — it is part of the motion budget. */
  presence?: boolean;
  className?: string;
}) {
  const px = PX[size];
  const lg = size === 'lg';

  return (
    <span className={`relative inline-flex shrink-0 ${className}`} style={{ width: px, height: px }}>
      {/* The glow only on the large one. At 36px it reads as a smudge. */}
      {lg && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-4 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.28) 0%, transparent 70%)' }}
        />
      )}

      <span
        className={`relative block overflow-hidden rounded-full border ${
          lg ? 'border-2 border-blue-400/30' : 'border-green-500/30'
        }`}
        style={{ width: px, height: px }}
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
          className={`absolute rounded-full border-2 bg-green-500 ${lg ? 'h-4 w-4' : 'h-2.5 w-2.5'}`}
          style={{ right: lg ? 2 : 0, bottom: lg ? 2 : 0, borderColor: '#020617' }}
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
