'use client';

// ---------------------------------------------------------------------------
// The ACQUISITION cut of the advisory VSL.
//
// Near-copy of app/advisory-pricing/advisory-vsl-client by design; see the note in
// app/better-clients/better-clients-client.tsx for why these are not one
// shared component.
//
// THE HEADLINE CREDITS REFERRALS BEFORE IT LIMITS THEM. "Referrals built
// your firm" is true, the reader knows it is true, and it is the only way
// to say the second half without picking a fight with the thing they are
// proudest of. The claim is narrow on purpose: not that referrals are bad,
// that they do not SCALE. That one is defensible.
// ---------------------------------------------------------------------------

import VslFunnel, { CHIP_GREEN } from '@/components/VslFunnel';
import {
  ACQUISITION_VSL_PLAYBACK_ID,
  ACQUISITION_VSL_POSTER_TIME,
  ACQUISITION_VSL_TITLE,
} from '@/lib/advisory-config';

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
      // NO DEADLINE BANNER on the angle pages, unlike /advisory-pricing.
      // Turning it off also moves the logo and the capacity pill back up to
      // the top of the screen — VslFunnel passes this same flag through as
      // their belowBanner offset.
      deadlineUrgency={false}
      ctaHref={ctaHref}
      headline={
        <>
          Referrals Built Your Firm.{' '}
          {/* The Meta chip's own lime, imported rather than repeated. The chip
              sits directly above this line saying the campaigns run on Meta,
              and the colour is what ties the two together. Solid, not a
              gradient: the chip is solid. */}
          <span style={{ color: CHIP_GREEN }}>
            They Will Not Scale It
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
