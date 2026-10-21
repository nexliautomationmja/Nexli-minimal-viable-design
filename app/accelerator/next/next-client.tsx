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
import { AGENCY_ENGAGEMENT_HIGH, AGENCY_ENGAGEMENT_LOW } from '@/lib/agency-offer';
import { BOOKING_CONFIRMED_B_PATH, DEMO_CAL_LINK } from '@/lib/demo-config';
import {
  ACCELERATOR_VSL_VIDEO_PLAYBACK_ID,
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

        {/* The whole reason this page holds a qualified firm for ten
            minutes. The guide is work they have to go and do; this is the
            same outcome with the work removed, and it has to be concrete
            or it reads as a vague upsell. Three things we do, then the
            number their client pays THEM, then the calendar. */}
        <div className="mt-9 text-center">
          {/* The turn, before the promise. A CPA reading this has a book
              full of referrals who argue over an $800 invoice, and naming
              that first is what makes the next sentence land as relief
              rather than as another pitch. Red against the green below:
              the colours carry the before/after on their own. */}
          <p
            className="text-xl sm:text-2xl md:text-3xl font-black leading-[1.12] tracking-tight"
            style={{ ...OUTFIT, color: '#f87171' }}
          >
            Ditch the referrals who are broke.
          </p>
          <h2
            className="mt-3 text-2xl sm:text-3xl md:text-[2.5rem] font-black leading-[1.08] tracking-tight text-white"
            style={OUTFIT}
          >
            We keep your calendar full of people paying{' '}
            <span style={{ color: '#4ade80' }}>6 &amp; 7 figures</span> in taxes.
          </h2>
          <p
            className="mt-4 text-base sm:text-lg leading-relaxed max-w-xl mx-auto"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            Consistent lead flow, done for you end to end. You do the planning.
            We do every single thing that gets them in front of you.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3 text-left">
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

          {/* The whole argument in one line. A firm handing the IRS
              seven figures does not experience $15,000 as a cost, and
              that asymmetry — not our fee, not our features — is why
              these engagements close. Say it in their client's terms. */}
          <p
            className="mt-8 text-lg sm:text-2xl font-black leading-snug text-white max-w-2xl mx-auto"
            style={OUTFIT}
          >
            People like that would pay{' '}
            <span style={{ color: '#4ade80' }}>
              {usd(AGENCY_ENGAGEMENT_LOW)} to {usd(AGENCY_ENGAGEMENT_HIGH)}+
            </span>{' '}
            for tax planning without blinking. Next to what they hand the IRS,
            it is a rounding error.
          </p>
          <p className="mt-4 text-base sm:text-lg font-bold text-white">
            Pick a time below. I will show you exactly how it is built.
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
