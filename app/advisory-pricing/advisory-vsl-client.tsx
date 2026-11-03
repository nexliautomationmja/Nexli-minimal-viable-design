'use client';

// ---------------------------------------------------------------------------
// The AGENCY cut — the funnel's landing page, and the original of the four.
//
// Props mirror app/vslfunnel-betterclients — same eyebrow, exit-intent and
// the /revenuecalc hero button both off — with two deliberate divergences:
// the VIDEO and the headline figure.
//
// The public page runs the original cut, whose audio says $8,000. This page
// runs the re-record whose audio says $15,000, which is AGENCY_ENGAGEMENT_AVG
// and the number the rest of the funnel is built on: the opt-in headline,
// PipelineMath's $750,000, the nurture emails' $800/$15,000 grid and the call
// page all use it. The subheadline below reads the same constant, so the
// video, the page copy and the funnel's maths cannot drift apart.
//
// THIS PAGE ARGUES THE AGENCY OBJECTION, not the volume one. It carried the
// Better Clients headline for a while, which was a placeholder and a
// duplicate: /better-clients now owns "$800 client versus $15,000 client",
// and this page owns "the agency did what it promised and it still did not
// work". Keep the two arguments apart — four pages pointing one qualifier is
// only worth running if each attacks a different belief.
//
// Keeping this and the public page as separate call sites is what makes the
// split possible — do not collapse them back into a shared component.
// ---------------------------------------------------------------------------

import VslFunnel from '@/components/VslFunnel';
import { AGENCY_ENGAGEMENT_LOW, usd } from '@/lib/agency-offer';
import {
  ADVISORY_VSL_VIDEO_PLAYBACK_ID,
  ADVISORY_VSL_VIDEO_TITLE,
} from '@/lib/advisory-config';

export default function AdvisoryVslClient({ ctaHref }: { ctaHref: string }) {
  return (
    <VslFunnel
      variant="BetterClients"
      muxPlaybackId={ADVISORY_VSL_VIDEO_PLAYBACK_ID}
      videoTitle={ADVISORY_VSL_VIDEO_TITLE}
      showHiddenDrain={false}
      showExitIntent={false}
      // Only this page. The public /vslfunnel* pages are unchanged.
      metaChip
      // No eyebrow pill. The deadline banner and the Meta chip already sit
      // above the headline; a third pill under them was three rows of
      // chrome before anyone read a word of the offer.
      showEyebrow={false}
      // Objections are answered on the booking-confirmed page now, where
      // they land after the call is booked rather than competing with the CTA.
      showFaq={false}
      // December 31. The real deadline behind this whole offer: planning sold
      // in February is planning against a year that is already written.
      deadlineUrgency
      ctaHref={ctaHref}
      // CONCEDES THE FIRST SENTENCE SO THE SECOND ONE LANDS. The reader's
      // agency really did deliver the leads it sold — arguing otherwise
      // picks a fight with something they watched happen. So the headline
      // grants it, then moves the failure off count and onto quality, which
      // is the belief the rest of the page spends three minutes installing.
      //
      // "Your last agency", second person, not "the agency". It accuses a
      // specific firm the reader actually hired instead of an abstraction,
      // and "last" quietly says there will be another one.
      //
      // The repeat on "leads" is the hinge: the word they were sold, then
      // the same word turned against them.
      //
      // Warm gradient on the bad news, matching the page's existing
      // treatment. Green is the good outcome across these four pages and
      // the coloured half here is the thing that went wrong.
      headline={
        <>
          Your Last Agency Guaranteed You Leads.{' '}
          <span className="bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
            The Leads Couldn&apos;t Afford You.
          </span>
        </>
      }
      // Names what the agency was actually paid for. "Measured on" rather
      // than "cared about": the complaint is a broken incentive, not bad
      // faith, and the first is both fairer and harder to argue with.
      //
      // The figure is AGENCY_ENGAGEMENT_LOW, never a literal — it is the
      // same number the video says out loud.
      subheadline={
        <>
          They were paid for volume, so volume is what you got. Nobody was
          measured on whether those people could afford a{' '}
          {usd(AGENCY_ENGAGEMENT_LOW)} engagement — and that is the only
          number that decides whether ads work for a firm like yours.
        </>
      }
    />
  );
}
