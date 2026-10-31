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
      // The banner is back, carrying the 2027 line rather than the old
      // December 31 one. This flag also offsets the logo and the capacity
      // pill — VslFunnel passes it through as their belowBanner value — and
      // switches on the explained version of the same argument further down
      // the page, so the two cannot disagree.
      deadlineUrgency
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
      // NAMES ALL THREE ANGLES IN ONE SENTENCE. "More leads, more people,
      // more clients" is the belief every one of these pages is built to
      // break, and the second half is the map: better clients, better
      // systems, a better acquisition channel — which is /better-clients,
      // /systems and /acquisition. A firm that reads this has been given
      // the frame the other two pages argue inside.
      //
      // The figure is the same green as the headline's $15,000+, which is
      // the Meta chip's lime. Both are the money on offer; the only red on
      // the page stays on the $800 they are stuck with. subheadline was
      // widened from string to ReactNode to allow this.
      //
      // "$100K+ a month in profit" is the READER'S ambition, stated as
      // theirs — "you think you need X to scale to Y" — not a number we
      // are promising to produce. Keep it that way round.
      subheadline={
        <>
          You think you need more leads, more people and more clients to scale
          to{' '}
          <span className="font-bold" style={{ color: CHIP_GREEN }}>
            $100K+ a month in profit
          </span>
          . What you actually need is better clients, better systems and a
          better acquisition channel.
        </>
      }
    />
  );
}
