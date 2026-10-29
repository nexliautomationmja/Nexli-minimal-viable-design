'use client';

// ---------------------------------------------------------------------------
// The SYSTEMS cut of the advisory VSL.
//
// Near-copy of app/advisory-pricing/advisory-vsl-client by design; see the note in
// app/better-clients/better-clients-client.tsx for why these are not one
// shared component.
//
// THE HEADLINE CONCEDES BEFORE IT ARGUES. "You are not working too little"
// is the half that makes the rest survivable: this reader works brutal
// hours and knows it, and an opening line that reads as "try harder" or
// "you are lazy" loses them in the first second. Agree with them, then move
// the blame off effort and onto the absence of a system.
// ---------------------------------------------------------------------------

import VslFunnel from '@/components/VslFunnel';
import {
  SYSTEMS_VSL_PLAYBACK_ID,
  SYSTEMS_VSL_POSTER_TIME,
  SYSTEMS_VSL_TITLE,
} from '@/lib/advisory-config';

export default function SystemsVslClient({ ctaHref }: { ctaHref: string }) {
  return (
    <VslFunnel
      variant="Systems-Angle"
      muxPlaybackId={SYSTEMS_VSL_PLAYBACK_ID}
      videoTitle={SYSTEMS_VSL_TITLE}
      posterTime={SYSTEMS_VSL_POSTER_TIME}
      showHiddenDrain={false}
      showExitIntent={false}
      metaChip
      showEyebrow={false}
      showFaq={false}
      // NO DEADLINE BANNER on the angle pages, unlike /advisory-pricing.
      // Turning it off also moves the logo and the capacity pill back up to
      // the top of the screen — VslFunnel passes this same flag through as
      // their belowBanner offset.
      deadlineUrgency={false}
      ctaHref={ctaHref}
      headline={
        <>
          You Are Not Working Too Little.{' '}
          {/* Violet, not the red the other pages use. #a78bfa -> #7c3aed is the
              violet already declared in VslFunnel's EYEBROW_TONES, so this is
              the palette's purple rather than a new one. */}
          <span className="bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent">
            You Are Working Without Systems
          </span>
        </>
      }
      // The McDonald's line earns its place: it is the fastest way to make
      // "systems beat effort" land without sounding like an insult. Nobody
      // argues McDonald's makes the best burger, and nobody disputes it won.
      subheadline="Twelve-hour days spent redesigning the logo and nudging the website feel like progress and move nothing. McDonald's does not sell the best burger — it sells the best system. That is the only reason it scales."
    />
  );
}
