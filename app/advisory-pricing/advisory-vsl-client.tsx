'use client';

// ---------------------------------------------------------------------------
// The Better Clients VSL — now the funnel's landing page.
//
// Props mirror app/vslfunnel-betterclients — same eyebrow, exit-intent and
// the /revenuecalc hero button both off — with two deliberate divergences:
// the VIDEO and the headline figure. Both are $15,000 here.
//
// The public page runs the original cut, whose audio says $8,000, under the
// "$8,000 One" headline. This page runs the re-record whose audio says
// $15,000, which is AGENCY_ENGAGEMENT_AVG and the number the rest of the
// funnel is built on: the opt-in headline, PipelineMath's $750,000, the
// nurture emails' $800/$15,000 grid and the call page all use it.
//
// So the video, the page copy and the funnel's own maths now agree. Change
// one of the three and you have to change all three — the headline figure
// below comes from AGENCY_ENGAGEMENT_AVG, and the video is a separate upload
// that has to be re-recorded, not re-rendered.
//
// Keeping this and the public page as separate call sites is what makes the
// split possible — do not collapse them back into a shared component.
// ---------------------------------------------------------------------------

import { TrendingUp } from 'lucide-react';
import VslFunnel from '@/components/VslFunnel';
import { AGENCY_ENGAGEMENT_AVG, usd } from '@/lib/agency-offer';
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
      eyebrowText="For Firms Done Chasing $800 Clients"
      eyebrowIcon={TrendingUp}
      eyebrowTone="emerald"
      showHiddenDrain={false}
      showExitIntent={false}
      // Only this page. The public /vslfunnel* pages are unchanged.
      metaChip
      eyebrowBelowSubhead
      // The ROI section now opens on the two-clients number, and the written
      // guarantees land again on the confirmation page once a call is booked.
      showGuarantees={false}
      // Objections are answered on the booking-confirmed page now, where
      // they land after the call is booked rather than competing with the CTA.
      showFaq={false}
      ctaHref={ctaHref}
      headline={
        <>
          Stop Competing for the $800 Client.{' '}
          Get Positioned for the{' '}
          <span className="bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
            {usd(AGENCY_ENGAGEMENT_AVG)} One
          </span>
        </>
      }
      subheadline="Before you spend a dollar on ads, your firm needs the infrastructure that makes ads work. Most CPA firms skip this step — and waste thousands finding out the hard way."
    />
  );
}
