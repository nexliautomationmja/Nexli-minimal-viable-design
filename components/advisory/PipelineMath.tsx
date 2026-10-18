'use client';

// ---------------------------------------------------------------------------
// 50 × $15,000 = $750,000.
//
// The grid was lifted from the old GuaranteeSection, since deleted, which was
// the only place in the codebase that draws this multiplication. It could
// not be imported: it called useBooking() unconditionally at
// its top, and that hook throws without a QualificationProvider — which the
// advisory thank-you page does not mount.
//
// Changed on the way across: Outfit instead of the VSL pages' Syne, and the
// figures count up on scroll so the $750,000 lands as a payoff.
//
// The disclaimer below the grid is not decoration. The 50 leads are a
// contractual promise; the $750,000 is a ceiling that assumes a 100% close
// rate, which nobody has. Rendering the figure without that sentence turns
// a sizing exercise into a revenue claim.
// ---------------------------------------------------------------------------

import React from 'react';
import { Equal, X as XIcon } from 'lucide-react';
import AnimatedNumber from '@/components/AnimatedNumber';
import FunnelCta from '@/components/funnel/FunnelCta';
import { OUTFIT, SectionHeading } from '@/components/funnel/primitives';
import {
  AGENCY_DAYS,
  AGENCY_ENGAGEMENT_AVG,
  AGENCY_ENGAGEMENT_HIGH,
  AGENCY_ENGAGEMENT_LOW,
  AGENCY_LEADS,
  AGENCY_PIPELINE_VALUE,
  usd,
} from '@/lib/agency-offer';
import { ADVISORY_QUALIFY_PATH } from '@/lib/advisory-config';

const EMERALD = '#34d399';
const EMERALD_GLOW = 'drop-shadow(0 0 12px rgba(52,211,153,0.5))';

const dollars = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;

export default function PipelineMath() {
  return (
    <section className="mt-14 md:mt-16">
      <SectionHeading
        align="center"
        eyebrow="What the other half is worth"
        title="Fifty of them. Not from your book."
        sub="Your client list is finite and you are about to work through it. This is the arithmetic on what replacing it looks like."
      />

      <div
        className="mt-8 rounded-3xl border p-6 sm:p-8"
        style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)' }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto_1.2fr] gap-4 sm:gap-3 items-center">
          <div className="text-center sm:text-left">
            <p className="text-3xl sm:text-4xl font-black text-white" style={OUTFIT}>
              <AnimatedNumber
                value={AGENCY_LEADS}
                format={(n) => Math.round(n).toLocaleString('en-US')}
                animateOnView
                duration={900}
              />
            </p>
            <p className="mt-1 text-xs sm:text-sm leading-snug" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Qualified leads targeted
            </p>
          </div>

          <XIcon size={22} className="mx-auto" style={{ color: 'rgba(255,255,255,0.35)' }} aria-hidden="true" />

          <div className="text-center sm:text-left">
            <p className="text-3xl sm:text-4xl font-black text-white" style={OUTFIT}>
              <AnimatedNumber
                value={AGENCY_ENGAGEMENT_LOW}
                format={dollars}
                animateOnView
                duration={1100}
              />
            </p>
            <p className="mt-1 text-xs sm:text-sm leading-snug" style={{ color: 'rgba(255,255,255,0.55)' }}>
              At the floor ({usd(AGENCY_ENGAGEMENT_LOW)}; engagements run to {usd(AGENCY_ENGAGEMENT_HIGH)})
            </p>
          </div>

          <Equal size={22} className="mx-auto" style={{ color: 'rgba(255,255,255,0.35)' }} aria-hidden="true" />

          <div
            className="text-center sm:text-left rounded-xl border px-4 py-3"
            style={{ backgroundColor: 'rgba(52,211,153,0.06)', borderColor: 'rgba(52,211,153,0.25)' }}
          >
            <p
              className="text-3xl sm:text-4xl font-black"
              style={{ color: EMERALD, filter: EMERALD_GLOW, ...OUTFIT }}
            >
              <AnimatedNumber
                value={AGENCY_PIPELINE_VALUE}
                format={dollars}
                animateOnView
                duration={1400}
              />
            </p>
            <p className="mt-1 text-xs sm:text-sm leading-snug" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Pipeline value in {AGENCY_DAYS} days
            </p>
          </div>
        </div>

        {/* Mandatory. See the note at the top of this file. */}
        <div
          className="mt-6 rounded-2xl border px-4 py-4"
          style={{ background: 'rgba(52,211,153,0.07)', borderColor: 'rgba(52,211,153,0.3)' }}
        >
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
            <strong className="font-black text-white">
              The {AGENCY_LEADS} leads are written into your agreement.
            </strong>{' '}
            The {usd(AGENCY_PIPELINE_VALUE)} is not — it is what they are worth if every one
            became an engagement at your average fee, which no firm closes at. It sizes the
            opportunity; your close rate decides what you actually bank.
          </p>
        </div>
      </div>

      {/* Its own route into the qualifier. Without this, anyone who read past
          the bridge card's button has nothing left to act on. */}
      <div className="mt-8 flex justify-center">
        <FunnelCta href={ADVISORY_QUALIFY_PATH} size="lg" block={false}>
          See if your firm qualifies
        </FunnelCta>
      </div>
    </section>
  );
}
