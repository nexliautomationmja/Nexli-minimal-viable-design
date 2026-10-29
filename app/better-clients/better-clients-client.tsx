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

import VslFunnel, { CHIP_GREEN } from '@/components/VslFunnel';
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
      // The plus is not decoration: AGENCY_ENGAGEMENT_LOW is the BOTTOM of
      // the $15,000-$55,000 range in lib/agency-offer, so a bare $15,000
      // understates it and the plus is the more accurate claim.
      //
      // AGENCY_ENGAGEMENT_LOW, never a literal. It is the same $15,000 the
      // re-recorded video says out loud, that the ROI section below computes
      // from, and that the nurture emails quote. A hardcoded number here is
      // how that set drifts apart, and the $8,000/$15,000 split between the
      // two cuts is exactly what that drift looks like.
      // TWO COLOURS, BECAUSE THE HEADLINE IS A COMPARISON. The whole
      // sentence turns on $800 against $15,000, and colouring only one of
      // them leaves the reader to find the other. Red is the number they
      // are stuck with, green is the one on offer.
      //
      // #f87171 is red-400, the same red the gradient started on and the
      // accent red used elsewhere on dark. CHIP_GREEN is the Meta chip's
      // lime, imported from VslFunnel rather than repeated, so the chip
      // sitting directly above the headline and the figure inside it are
      // the same value.
      //
      // The nouns stay white. Colouring "Client" and "One" would spread the
      // emphasis across four words and the contrast would stop being a
      // contrast.
      headline={
        <>
          Stop Competing for the{' '}
          <span style={{ color: '#f87171' }}>$800</span> Client.{' '}
          Get Positioned for the{' '}
          <span style={{ color: CHIP_GREEN }}>{usd(AGENCY_ENGAGEMENT_LOW)}+</span>{' '}
          One
        </>
      }
      subheadline="Before you spend a dollar on ads, your firm needs the infrastructure that makes ads work. Most CPA firms skip this step — and waste thousands finding out the hard way."
    />
  );
}
