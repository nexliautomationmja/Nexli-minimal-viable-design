'use client';

// ---------------------------------------------------------------------------
// The ACQUISITION cut of the advisory VSL.
//
// Near-copy of ../advisory-vsl-client by design; see the note in
// ../better-clients/better-clients-client.tsx for why these are not one
// shared component.
//
// THE HEADLINE CREDITS REFERRALS BEFORE IT LIMITS THEM. "Referrals built
// your firm" is true, the reader knows it is true, and it is the only way
// to say the second half without picking a fight with the thing they are
// proudest of. The claim is narrow on purpose: not that referrals are bad,
// that they do not SCALE. That one is defensible.
// ---------------------------------------------------------------------------

import VslFunnel from '@/components/VslFunnel';
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
      deadlineUrgency
      ctaHref={ctaHref}
      headline={
        <>
          Referrals Built Your Firm.{' '}
          <span className="bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
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
