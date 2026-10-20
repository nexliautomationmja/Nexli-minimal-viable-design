'use client';

// ---------------------------------------------------------------------------
// The VSL and the calendar under it.
//
// Deliberately NOT components/VslFunnel. That is 1,900 lines whose body
// sells the $9,997 engagement to someone who has already been quoted it —
// the trust bar, the cost-of-inaction section, the ROI maths, the founder
// story. The firm reading this page has never been shown a price and came
// for a free PDF. It also has no calendar slot, and the whole ask here is
// "watch this, then pick a time without going anywhere".
//
// So: a bare MuxPlayer, three lines of copy, and InlineCalEmbed. The
// pattern is lifted from BOBA/offer-client.tsx, including thumbnailTime —
// Mux serves a frame from the MIDDLE of the asset when you do not ask for
// one, which on these cuts means a burned-in caption as the poster.
//
// The booking side mirrors call-client.tsx exactly: same bookedEndpoint,
// same scheduleContentName (the CAPI and pixel content_name must agree),
// same 1800ms pause before the redirect. Only the namespace differs.
// ---------------------------------------------------------------------------

import { useCallback } from 'react';
import MuxPlayer from '@mux/mux-player-react';
import InlineCalEmbed from '@/components/InlineCalEmbed';
import { RimCard, OUTFIT } from '@/components/funnel/primitives';
import { BOOKING_CONFIRMED_B_PATH, DEMO_CAL_LINK } from '@/lib/demo-config';
import {
  ACCELERATOR_VSL_VIDEO_PLAYBACK_ID,
  ACCELERATOR_VSL_VIDEO_TITLE,
} from '@/lib/accelerator-config';

export interface AcceleratorNextClientProps {
  fullName: string;
  email: string;
  /** E.164, or '' when the stored number could not be normalised. */
  phone: string;
  /** Signed lead cookie — authenticates the booking callback. */
  leadToken: string;
  /** Call-prep block prefilled into Cal's notes field. */
  notes: string;
}

export default function AcceleratorNextClient({
  fullName,
  email,
  phone,
  leadToken,
  notes,
}: AcceleratorNextClientProps) {
  const onBooked = useCallback(() => {
    // Cal is still showing its own confirmation here, so the same 1800ms
    // the advisory page uses — and it gives the keepalive POST headroom.
    //
    // This only runs while Cal's own "Redirect on booking" field is EMPTY.
    // With a URL in it Cal navigates the parent window at 0ms and wins.
    // That field is shared with the advisory funnel's booking page, so
    // there are now two pages depending on it staying blank.
    const qs = new URLSearchParams();
    if (fullName) qs.set('name', fullName);
    if (email) qs.set('email', email);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';

    window.setTimeout(() => {
      window.location.href = `${BOOKING_CONFIRMED_B_PATH}${suffix}`;
    }, 1800);
  }, [fullName, email]);

  return (
    <>
      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 sm:px-6 pb-10">
        <RimCard innerClassName="p-2 sm:p-3">
          <MuxPlayer
            playbackId={ACCELERATOR_VSL_VIDEO_PLAYBACK_ID}
            streamType="on-demand"
            // Mux returns a mid-asset frame when no time is given, which on
            // these cuts is a caption mid-sentence. 0 is the clean open.
            thumbnailTime={0}
            metadata={{ video_title: ACCELERATOR_VSL_VIDEO_TITLE }}
            accentColor="#16a34a"
            style={{ aspectRatio: '16/9', width: '100%', borderRadius: '1rem', overflow: 'hidden' }}
          />
        </RimCard>

        <div className="mt-8 text-center">
          <h2
            className="text-xl sm:text-2xl md:text-3xl font-black leading-[1.1] tracking-tight text-white"
            style={OUTFIT}
          >
            Or we do the whole thing for you.
          </h2>
          <p
            className="mt-3 text-sm sm:text-base leading-relaxed max-w-xl mx-auto"
            style={{ color: 'rgba(255,255,255,0.65)' }}
          >
            The guide works. It also means twenty conversations you have to go
            and have. If you would rather those clients arrived already knowing
            what planning costs, that is what we build &mdash; pick a time below
            and we will walk you through it.
          </p>
        </div>
      </section>

      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 sm:px-6 pb-20">
        <InlineCalEmbed
          calLink={DEMO_CAL_LINK}
          // Its own namespace. Sharing 'advisory-growth-call' risks the two
          // embeds colliding, and keeps this off the global
          // QualificationProvider modal handler.
          namespace="accelerator-growth-call"
          bookedEndpoint="/api/advisory-pricing/booked"
          name={fullName}
          email={email}
          phone={phone}
          leadToken={leadToken}
          notes={notes}
          // Must match the advisory page's string: the server CAPI event
          // uses one content_name and the browser pixel the other, and
          // they should not disagree for the same event.
          scheduleContentName="Advisory Engine Growth Call"
          brandColor="#16a34a"
          bookedTitle="You're booked."
          onBooked={onBooked}
        />
      </section>
    </>
  );
}
