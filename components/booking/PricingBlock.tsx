import React from 'react';
import {
  AGENCY_AD_SPEND,
  AGENCY_MONTHLY_FEE,
  AGENCY_TOTAL_MONTHLY,
  usd,
} from '@/lib/agency-offer';

/**
 * What the engagement costs, on both confirmation pages.
 *
 * Shared rather than copied because this is the one block that has to look
 * identical on A and B. The figures already come from lib/agency-offer.ts so
 * they could not drift, but the markup around them could, and a price that
 * is laid out differently on two pages reads as two different prices.
 *
 * Never itemised — one fee for one system. See the note in agency-offer.ts.
 *
 * ── What it costs ──────────────────────────────────────────
 * Deliberately right under "Everything Included": the price only
 * makes sense immediately after the list it buys.
 * One number for one system. Never itemised — no setup fee, no
 * per-component breakdown, no tiers — because the system is not
 * sold in pieces, and a price with parts invites an argument
 * about the parts before the call even happens.
 * Figures come from lib/agency-offer.ts so this block and the
 * qualifier's budget question cannot drift apart.
 */
export default function PricingBlock() {
  return (
    <div className="max-w-5xl mx-auto mt-10 md:mt-14">
      <div
        className="rounded-2xl md:rounded-3xl border p-6 md:p-10"
        style={{
          borderColor: 'rgba(59,130,246,0.3)',
          background: 'linear-gradient(180deg, rgba(59,130,246,0.08), rgba(59,130,246,0.02))',
        }}
      >
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-400 text-center">
          What it costs
        </p>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          <div
            className="text-center sm:text-right sm:pr-6 sm:border-r"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <p className="text-4xl md:text-5xl font-black text-[var(--text-main)] leading-none">
              {usd(AGENCY_MONTHLY_FEE)}
            </p>
            <p className="mt-2 text-sm font-semibold text-[var(--text-main)]">per month</p>
            <p className="mt-1 text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
              Everything above, built and run for you.
            </p>
          </div>

          <div className="text-center sm:text-left sm:pl-2">
            <p className="text-4xl md:text-5xl font-black text-[var(--text-main)] leading-none">
              {usd(AGENCY_AD_SPEND)}
            </p>
            <p className="mt-2 text-sm font-semibold text-[var(--text-main)]">
              per month in ad spend
            </p>
            <p className="mt-1 text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
              Paid to the platforms through your own ad account, not to us.
            </p>
          </div>
        </div>

        <div
          className="mt-6 pt-5 border-t text-center"
          style={{ borderColor: 'rgba(255,255,255,0.1)' }}
        >
          <p className="text-sm md:text-base text-[var(--text-muted)]">
            <span className="font-bold text-[var(--text-main)]">
              About {usd(AGENCY_TOTAL_MONTHLY)} a month all in.
            </span>{' '}
            Month to month. No setup fee, no contract.
          </p>
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            We will walk through the numbers on the call. Nothing here changes.
          </p>
        </div>
      </div>
    </div>
  );
}
