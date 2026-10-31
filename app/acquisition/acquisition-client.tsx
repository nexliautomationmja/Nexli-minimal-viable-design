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
      // Green on the number they want, white on the one they have. $1M is
      // not a failure, so it does not get the red that /better-clients puts
      // on the $800 client - there is nothing wrong with where they are,
      // only with what will carry them further.
      headline={
        <>
          Referrals Got You to $1 Million.{' '}
          <span style={{ color: CHIP_GREEN }}>
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
