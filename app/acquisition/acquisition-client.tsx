'use client';

// ---------------------------------------------------------------------------
// The ACQUISITION cut of the advisory VSL.
//
// Near-copy of app/agency/agency-client by design; see the note in
// app/better-clients/better-clients-client.tsx for why these are not one
// shared component.
//
// THE HEADLINE CREDITS REFERRALS BEFORE IT LIMITS THEM. "Referrals built
// your firm" is true, the reader knows it is true, and it is the only way
// to say the second half without picking a fight with the thing they are
// proudest of. The claim is narrow on purpose: not that referrals are bad,
// that they do not SCALE. That one is defensible.
// ---------------------------------------------------------------------------

import React from 'react';
import VslFunnel from '@/components/VslFunnel';
import {
  ACQUISITION_VSL_PLAYBACK_ID,
  ACQUISITION_VSL_POSTER_TIME,
  ACQUISITION_VSL_TITLE,
} from '@/lib/advisory-config';

/**
 * The spectrum on "$10 Million".
 *
 * Sampled off the Apple Intelligence icon rather than guessed: the six stops
 * are the hues that actually appear around that glyph, read clockwise from
 * the top of its arch - yellow-green, amber, orange, coral, then the violet
 * and periwinkle of the two legs. Each one is nudged up in saturation,
 * because the icon is 80px of colour sitting on dark grey and the same
 * values go muddy at 60px headline weight.
 *
 * Warm to cool, left to right, so the sentence brightens where the reader
 * enters it and cools onto the number. The violet is deliberately the same
 * #A78BFA that /systems puts on "Swinging Blind" - three sibling pages, one
 * palette.
 *
 * WHY box-decoration-break: slice, which is the default and is named here
 * only so nobody "fixes" it. This phrase wraps - two lines on desktop, three
 * at 390px. slice lays the gradient across the fragments as though they were
 * one unbroken box, so the sentence sweeps the spectrum ONCE and "$10
 * Million" lands in the violet-to-blue tail. clone was tried and looks worse:
 * it repaints the full sweep per line, and on desktop "Million" orphans onto
 * a line of its own and crams all six stops into seven letters.
 *
 * Inline rather than Tailwind because six stops need more than the single
 * via- that from-/via-/to- allows.
 */
const SPECTRUM_TEXT: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(90deg, #BFD94F 0%, #F2B33D 22%, #F58A42 40%, #F26B57 58%, #A78BFA 79%, #6D8AF7 100%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  color: 'transparent',
  boxDecorationBreak: 'slice',
  WebkitBoxDecorationBreak: 'slice',
};

export default function AcquisitionVslClient({ ctaHref }: { ctaHref: string }) {
  return (
    <VslFunnel
      variant="Acquisition-Angle"
      muxPlaybackId={ACQUISITION_VSL_PLAYBACK_ID}
      videoTitle={ACQUISITION_VSL_TITLE}
      posterTime={ACQUISITION_VSL_POSTER_TIME}
      showHiddenDrain={false}
      showExitIntent={false}
      metaChip
      showEyebrow={false}
      showFaq={false}
      // The banner is back, carrying the 2027 line rather than the old
      // December 31 one. This flag also offsets the logo and the capacity
      // pill — VslFunnel passes it through as their belowBanner value — and
      // switches on the explained version of the same argument further down
      // the page, so the two cannot disagree.
      deadlineUrgency
      ctaHref={ctaHref}
      // NAMES A CEILING, NOT A FAULT. "Referrals built your firm" was true
      // but inert - it credited them and then took it away. This version
      // concedes the win and puts a number on where it stops, which is the
      // actual argument: referrals scale linearly with how many people know
      // you, and that runs out.
      //
      // The ceiling is the spectrum, the floor is plain white. $1M is not a
      // failure, so it does not get the red that /better-clients puts on the
      // $800 client - there is nothing wrong with where they are, only with
      // what will carry them further.
      headline={
        <>
          Referrals Got You to $1 Million.{' '}
          <span style={SPECTRUM_TEXT}>
            They Will Not Get You to $10 Million
          </span>
        </>
      }
      // "Values at almost nothing" rather than a number. A firm's valuation
      // turns on far more than its acquisition mix, and putting a multiple
      // on this page would be a claim we cannot stand behind to an audience
      // that values businesses for a living.
      subheadline="You cannot forecast a referral, control its quality, or decide to have more of them next quarter. That is why a book built on them values at almost nothing — and why the firms growing on purpose built a channel instead."
    />
  );
}
