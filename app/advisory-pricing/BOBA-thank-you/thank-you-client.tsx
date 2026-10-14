'use client';

// ---------------------------------------------------------------------------
// Delivery, and nothing else.
//
// This page is now the END of the not-a-fit branch, and that changes what it
// is for. The funnel runs: /advisory-pricing -> qualifier -> calendar if they
// qualify, or the $97 offer if they do not. A buyer who lands here has
// already been told the engine is not for them, so the agency pitch that used
// to sit below the fold — "where is the next 50 going to come from?", the
// 50 x $15,000 pipeline math, a CTA back into the qualifier they just failed —
// was asking them to re-apply for the thing they were just turned down for,
// thirty seconds after paying.
//
// So: a thank you, the file, and one line about what happens if the play
// works. No video, no upsell, no second CTA.
//
// The download is on the page now rather than email-only. The buyer is here,
// they have paid, and the file is five pages — making them wait on an
// attachment was friction with nothing on the other side of it. They still
// get the emailed copy; this is the faster path, not the only one.
// ---------------------------------------------------------------------------

import React, { useEffect, useRef } from 'react';
import { ArrowRight, CheckCircle2, Download } from 'lucide-react';
import DeliveryBlock from '@/components/advisory/DeliveryBlock';
import { ShimmerBadge } from '@/components/TransformationCards';
import { RimCard } from '@/components/funnel/primitives';
import { trackMetaEvent } from '@/lib/meta-events';
import {
  ACCELERATOR_TARGET,
  ADVISORY_DOWNLOAD_PATH,
  ADVISORY_PRODUCT_ID,
  ADVISORY_PRODUCT_NAME,
} from '@/lib/advisory-config';
import { usd } from '@/lib/agency-offer';

const OUTFIT: React.CSSProperties = {
  fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif",
};

interface Props {
  firstName: string;
  email: string;
  /** Empty for a returning buyer arriving on the cookie. */
  sessionId: string;
  purchaseEventId: string;
  amount: number;
  currency: string;
}

export default function AdvisoryThankYouClient({
  firstName,
  email,
  sessionId,
  purchaseEventId,
  amount,
  currency,
}: Props) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    trackMetaEvent(
      'Purchase',
      {
        content_name: ADVISORY_PRODUCT_NAME,
        content_type: 'product',
        content_ids: [ADVISORY_PRODUCT_ID],
        value: amount,
        currency,
        num_items: 1,
      },
      purchaseEventId,
    );
  }, [sessionId, purchaseEventId, amount, currency]);

  return (
    <div className="relative z-10 mx-auto max-w-3xl px-4 pt-20 pb-24 md:pt-24">
      <span
        className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5"
        style={{
          backgroundColor: 'rgba(16,185,129,0.1)',
          borderColor: 'rgba(16,185,129,0.25)',
        }}
      >
        <CheckCircle2 size={14} style={{ color: '#34d399' }} aria-hidden="true" />
        <span
          className="text-[11px] font-bold uppercase tracking-[0.15em]"
          style={{ color: '#34d399' }}
        >
          Payment complete
        </span>
      </span>

      <h1
        className="mt-4 text-2xl sm:text-3xl md:text-4xl font-black leading-[1.08] tracking-tight text-white"
        style={OUTFIT}
      >
        {firstName ? `You're in, ${firstName}.` : "You're in."}{' '}
        <span
          className="block bg-clip-text text-transparent"
          style={{ backgroundImage: 'linear-gradient(90deg, #60a5fa, #22d3ee)' }}
        >
          Go get the first {usd(ACCELERATOR_TARGET)}.
        </span>
      </h1>

      <p
        className="mt-4 max-w-2xl text-sm sm:text-base leading-relaxed"
        style={{ color: 'rgba(255,255,255,0.68)' }}
      >
        Everything you need is in the file below. Work it this week — pull the names,
        make the calls, price the first engagement properly. The gap between what you
        charge and what the work is worth stops being theoretical the moment you do.
      </p>

      {/* ---- The file ---------------------------------------------------- */}
      <div
        className="mt-8 rounded-2xl border p-5 sm:p-7"
        style={{
          background: 'rgba(255,255,255,0.03)',
          borderColor: 'rgba(255,255,255,0.12)',
        }}
      >
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-400">
          Your guide
        </p>
        <h2
          className="mt-2 text-lg sm:text-xl font-black tracking-tight text-white"
          style={OUTFIT}
        >
          {ADVISORY_PRODUCT_NAME}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
          Five pages. Yours permanently — print it, work off it, use it on every client
          you have.
        </p>

        {/*
          A plain anchor, not a fetch. /api/advisory-pricing/download streams
          the PDF with a Content-Disposition attachment header and is gated on
          advisory_purchased_at for this lead, so the browser handles it as a
          normal download and the entitlement check is the same one every
          other page in this funnel uses.
        */}
        <a
          href={ADVISORY_DOWNLOAD_PATH}
          className="mt-5 inline-flex items-center gap-2.5 rounded-full bg-blue-600 px-7 py-3.5 text-sm sm:text-base font-bold text-white transition-all hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98]"
          style={{ boxShadow: '0 14px 40px -12px rgba(37,99,235,0.8)' }}
        >
          <Download size={18} aria-hidden="true" />
          Download the PDF
        </a>
      </div>

      {/* A copy is in their inbox too — this is the fallback if the download
          fails or they want it on another device. */}
      <div className="mt-4">
        <DeliveryBlock email={email} />
      </div>

      {/* ---- The door, left open --------------------------------------- */}
      {/*
        A rimmed, lit panel rather than a flat notice — it is the last thing
        on the page and the only forward-looking thing on it, so it should
        be the thing the eye lands on after the download.

        The argument is reinvestment, not scarcity. The guide turns their
        existing book into roughly ACCELERATOR_TARGET once; what we sell is
        the same clients arriving every month instead. Framing that as
        "spend the money you just made" is the only version that works here
        — they told the qualifier they could not fund it, and this is the
        path by which that stops being true.

        Still no button. They failed the qualifier minutes ago; a CTA back
        into it would undo the thank you.
      */}
      <RimCard className="mt-10" innerClassName="px-5 py-6 sm:px-7 sm:py-8">
        <div className="mb-3">
          <ShimmerBadge
            conicStops="#60a5fa, #a78bfa, #22d3ee, #60a5fa"
            starClass="text-blue-400 fill-blue-400"
            labelClass="text-blue-300"
          >
            What to do with the first {usd(ACCELERATOR_TARGET)}
          </ShimmerBadge>
        </div>

        <h2
          className="text-lg sm:text-xl md:text-2xl font-black tracking-[-0.03em] leading-[1.15] text-white"
          style={OUTFIT}
        >
          Then put it back to work.
          <span
            className="mt-1 block bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(90deg, #60a5fa, #22d3ee)' }}
          >
            Reinvest it with us and the clients keep coming.
          </span>
        </h2>

        <p
          className="mt-3 text-sm sm:text-base leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.72)' }}
        >
          Worked properly, this play should pull about {usd(ACCELERATOR_TARGET)} out of the
          book you already have. That money is not the win. It is the budget — the thing
          that lets you buy a system instead of paying for one out of pocket.
        </p>

        <p
          className="mt-3 text-sm sm:text-base leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.72)' }}
        >
          Reinvest it with us and advisory clients stop being something you harvest once
          from your own filing cabinet. They start arriving every month, from people who
          were never on your list — so the next {usd(ACCELERATOR_TARGET)} does not depend
          on there being a twenty-first name on the sheet.
        </p>

        <p
          className="mt-3 text-sm sm:text-base leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.72)' }}
        >
          Go and make the money first. That is the right order, and it is why we are not
          selling it to you today.
        </p>

        <p
          className="mt-4 inline-flex items-center gap-1.5 text-xs sm:text-sm"
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          <ArrowRight size={13} aria-hidden="true" />
          mail@nexli.net
        </p>
      </RimCard>
    </div>
  );
}
