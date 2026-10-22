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
// pattern is lifted from BOBA/offer-client.tsx — the player chrome and
// thumbnailTime both. Mux serves a frame from the MIDDLE of the asset
// when you do not ask for one, which on these cuts means a burned-in
// caption as the poster.
//
// The booking side mirrors call-client.tsx exactly: same bookedEndpoint,
// same scheduleContentName (the CAPI and pixel content_name must agree),
// same 1800ms pause before the redirect. Only the namespace differs.
// ---------------------------------------------------------------------------

import { useCallback } from 'react';
import MuxPlayer from '@mux/mux-player-react';
import InlineCalEmbed from '@/components/InlineCalEmbed';
import { OUTFIT } from '@/components/funnel/primitives';
import { AGENCY_ENGAGEMENT_HIGH, AGENCY_ENGAGEMENT_LOW } from '@/lib/agency-offer';
import { BOOKING_CONFIRMED_B_PATH, DEMO_CAL_LINK } from '@/lib/demo-config';
import {
  ACCELERATOR_VSL_VIDEO_PLAYBACK_ID,
  ACCELERATOR_VSL_VIDEO_POSTER_TIME,
  ACCELERATOR_VSL_VIDEO_TITLE,
} from '@/lib/accelerator-config';

const usd = (n: number) => `$${n.toLocaleString('en-US')}`;

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
      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 sm:px-6 pb-4">
        {/* The pitch, ABOVE the video rather than under it.

            It used to sit below, which meant the video had to sell itself
            from a cold open — the page said "it is sending, check your
            spam" and then put up a player with no stated reason to press
            it. Now the claim is made first and the video is the evidence
            for it.

            Two lines only, and they are the two that do the work: what we
            put on their calendar, and what those people pay. Everything
            else that used to be here has moved below the calendar, where
            it answers "how" for whoever is still reading.

            A plain div, not motion. Nothing else in this file animates in
            — the page opens with a video and a calendar, both of which
            arrive on their own schedule — so one block fading up would
            read as a glitch rather than a flourish. */}
        <div className="mb-5 text-center">
          <h2
            className="text-xl sm:text-3xl md:text-[2.5rem] font-black leading-[1.2] sm:leading-[1.08] tracking-tight text-balance text-white"
            style={OUTFIT}
          >
            We keep your calendar full of people paying{' '}
            <span style={{ color: '#4ade80' }}>6 &amp; 7 figures</span> in taxes.
          </h2>

          {/* The asymmetry, immediately. A firm handing the IRS seven
              figures does not experience $15,000 as a cost, and that —
              not our fee, not our features — is why these engagements
              close. Said in their client's terms, under the headline it
              is evidence for. */}
          <p
            className="mt-2.5 text-[15px] sm:text-lg leading-snug max-w-xl mx-auto"
            style={{ color: 'rgba(255,255,255,0.75)' }}
          >
            People like that would pay{' '}
            <span className="font-black" style={{ color: '#4ade80' }}>
              {usd(AGENCY_ENGAGEMENT_LOW)} to {usd(AGENCY_ENGAGEMENT_HIGH)}+
            </span>{' '}
            for tax planning without blinking.
          </p>
        </div>

        {/* The same chrome as every other VSL on the site — BOBA's offer
            page, booking-confirmed B, the main VSL funnel: a thin border,
            a big shadow, and the video edge to edge inside it.

            This used to be a RimCard, which is the wrong primitive for a
            video. RimCard is a showpiece PANEL: spinning conic rim, opaque
            navy gradient interior, blurred orbs, and padding. Around copy
            that reads as a feature. Around a 16:9 video it reads as a
            picture frame, and the 8-12px of interior padding shrinks the
            video inside the space it occupies while the rim competes with
            the thing you are meant to be watching. VslFunnel removed
            exactly this bezel for exactly this reason (see its note) —
            this page had quietly reintroduced it.

            border-white/10 rather than var(--glass-border), which the
            other three use. Same colour in dark mode, but this funnel is
            hardcoded dark while that variable follows the theme toggle, so
            the var would flip to near-black here if the theme ever
            changed under it. */}
        <div className="overflow-hidden rounded-2xl md:rounded-3xl border border-white/10 shadow-2xl">
          <MuxPlayer
            playbackId={ACCELERATOR_VSL_VIDEO_PLAYBACK_ID}
            streamType="on-demand"
            // Mux returns a mid-asset frame when no time is given, so a
            // value is always required. Which one, and why it is not 0, is
            // documented beside the constant.
            thumbnailTime={ACCELERATOR_VSL_VIDEO_POSTER_TIME}
            metadata={{ video_title: ACCELERATOR_VSL_VIDEO_TITLE }}
            accentColor="#16a34a"
            // No radius of its own: the wrapper clips it. display:block
            // kills the inline-element gap under the player.
            style={{ aspectRatio: '16/9', width: '100%', display: 'block' }}
          />
        </div>

        {/* The only thing between the video and the calendar. The
            calendar itself is meant to be visible from here without
            scrolling, so anything else put here costs a booking. */}
        <p className="mt-4 text-center text-base sm:text-lg font-bold text-balance text-white">
          Pick a time below. I will show you exactly how it is built.
        </p>
      </section>

      {/* WIDER than the section above it, and counter-intuitively that
          is what makes the calendar SMALLER.

          Cal's month_view puts the time list beside the date grid, but
          only above its own internal breakpoint. At the 720px this
          section used to be it fell back to stacking them, so the embed
          rendered 905px tall - taller than a laptop viewport, with the
          times pushed off the bottom of the screen behind a scroll. At
          848px Cal lays them out side by side and the same embed is
          534px. Pick a day, the times are already next to it.

          5xl was measured too and changes nothing: still 534px, just a
          wider calendar. 4xl is where the gain stops.

          Phones are unaffected - 598px either way. Cal forces the month
          grid below ~768px no matter what layout it is given, which is
          also why column_view was tried here and dropped: no change on
          mobile and 34px TALLER on desktop. */}
      <section className="relative z-10 mx-auto w-full max-w-4xl px-4 sm:px-6 pb-20">
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

        {/* BELOW the calendar on purpose.

            These three answer "how does that work", which is a question
            you only have once you believe the claim — and the people who
            believe it should be booking, not reading. Above the calendar
            this cost roughly 300px of scroll before anyone could see a
            time slot. Below it, it is there for whoever wants it and
            costs the rest nothing. */}
        <div className="mt-12 text-center">
          <p
            className="text-base sm:text-lg leading-relaxed max-w-xl mx-auto"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            Consistent lead flow, done for you end to end. You do the planning.
            We do every single thing that gets them in front of you.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3 text-left">
            {[
              ['The ads', 'Written, produced and run on Meta. You never go on camera.'],
              ['The qualifying', 'Sorted before they reach you, so you are not on calls with tyre-kickers.'],
              ['Your calendar', 'They book straight onto it, already knowing what planning costs.'],
            ].map(([title, body]) => (
              <div
                key={title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4"
              >
                <p className="text-sm font-black text-white" style={OUTFIT}>
                  {title}
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-white/60">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
