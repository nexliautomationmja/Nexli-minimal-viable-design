'use client';

// ---------------------------------------------------------------------------
// The BETTER CLIENTS cut of the advisory VSL.
//
// A deliberate near-copy of app/advisory-pricing/advisory-vsl-client. That file's own header
// says not to collapse these into one shared component, and the reason holds
// here: the whole point of four pages is that they diverge — first the
// headline, then the video, then whatever a test says next. A shared
// component with four prop branches makes every divergence a conditional.
//
// Every prop below except variant, the video and the copy is identical to
// the advisory page, and must stay that way: these pages are a copy test of
// the ARGUMENT, and anything else that differs is an uncontrolled variable.
// ---------------------------------------------------------------------------

import VslFunnel from '@/components/VslFunnel';
import { AGENCY_ENGAGEMENT_LOW, usd } from '@/lib/agency-offer';
import {
  BETTER_CLIENTS_VSL_PLAYBACK_ID,
  BETTER_CLIENTS_VSL_POSTER_TIME,
  BETTER_CLIENTS_VSL_TITLE,
} from '@/lib/advisory-config';

export default function BetterClientsVslClient({ ctaHref }: { ctaHref: string }) {
  return (
    <VslFunnel
      // Not a FAQ key. showFaq is false, so variant reaches exactly one
      // thing: the ViewContent content_name in VslFunnel's mount effect,
      // which is what splits these four pages in Events Manager.
      variant="BetterClients-Angle"
      muxPlaybackId={BETTER_CLIENTS_VSL_PLAYBACK_ID}
      videoTitle={BETTER_CLIENTS_VSL_TITLE}
      posterTime={BETTER_CLIENTS_VSL_POSTER_TIME}
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
      // The belief: more leads is the answer. The turn: you are optimising
      // the wrong number. Keep the figure as AGENCY_ENGAGEMENT_LOW rather
      // than a literal — it is the same $15,000 the video, the ROI section
      // and the nurture emails all quote, and a hardcoded one here is how
      // that set drifts apart.
      headline={
        <>
          You Do Not Need More Leads.{' '}
          You Need Clients Who Can Pay{' '}
          <span className="bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
            {usd(AGENCY_ENGAGEMENT_LOW)}
          </span>
        </>
      }
      subheadline="Chasing volume is a race to the bottom: more $800 returns, thinner margins, no leverage. The firms pulling ahead stopped counting leads and started filtering for the ones who write five-figure cheques."
    />
  );
}
