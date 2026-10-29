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
      // THE ORIGINAL BETTER CLIENTS COPY, at $15,000 rather than the $8,000
      // the first cut said. This is the wording that ran on
      // /vslfunnel-betterclients and outperformed everything else Marcel has
      // advertised, so it is restored verbatim rather than rewritten — the
      // only change is the figure.
      //
      // AGENCY_ENGAGEMENT_LOW, never a literal. It is the same $15,000 the
      // re-recorded video says out loud, that the ROI section below computes
      // from, and that the nurture emails quote. A hardcoded number here is
      // how that set drifts apart, and the $8,000/$15,000 split between the
      // two cuts is exactly what that drift looks like.
      headline={
        <>
          Stop Competing for the $800 Client.{' '}
          Get Positioned for the{' '}
          <span className="bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
            {usd(AGENCY_ENGAGEMENT_LOW)} One
          </span>
        </>
      }
      subheadline="Before you spend a dollar on ads, your firm needs the infrastructure that makes ads work. Most CPA firms skip this step — and waste thousands finding out the hard way."
    />
  );
}
