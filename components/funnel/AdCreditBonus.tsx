'use client';

// ---------------------------------------------------------------------------
// The ad-credit bonus under "See If Your Firm Qualifies" on every VSL page
// (Marcel, 2026-11-16). Visitors click through from the ads; the drop is
// between watching and finishing the qualifier, and a concrete reason to
// qualify now is the point of this line.
//
// The same look as the bonus on /math's invest slide: gold, a slow sheen,
// and the animated gold star (components/math/BonusStar), so a prospect who
// sees both recognises the one offer.
//
// "UP TO": the annual plan's bonus is the $10,000; on the monthly plan Nexli
// matches the first month of ads, $5,000 (lib/agency-offer). The asterisk
// points at the conditions, which VslDisclaimer prints at the foot of the
// page, word for word as on /pricing, /terms and /math.
// ---------------------------------------------------------------------------
import BonusStar, { BONUS_SHEEN_CSS } from '@/components/math/BonusStar';
import { AGENCY_ANNUAL_PLAN_BONUS, usd } from '@/lib/agency-offer';

const AMOUNT = `Up to ${usd(AGENCY_ANNUAL_PLAN_BONUS)}`;
const REST = 'in ad credit when you sign';

export default function AdCreditBonus({
  size = 'lg',
  className = '',
}: {
  /** lg: the boxed badge under the big button. sm: one line, for the sticky bar. */
  size?: 'lg' | 'sm';
  className?: string;
}) {
  if (size === 'sm') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <BonusStar size={18} />
        <span className="text-[12.5px] font-semibold text-amber-50 sm:text-sm md:text-base">
          <span className="font-black text-amber-300">{AMOUNT}</span> {REST}*
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative inline-flex items-center gap-3.5 rounded-2xl border border-amber-300/60 py-3 pl-4 pr-5 text-left sm:pr-6 ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(251,191,36,0.22) 0%, rgba(245,158,11,0.09) 55%, rgba(180,83,9,0.14) 100%)',
        boxShadow: '0 0 44px -14px rgba(251,191,36,0.6), inset 0 1px 0 rgba(255,247,214,0.18)',
      }}
    >
      <style>{BONUS_SHEEN_CSS}</style>
      {/* The sheen is clipped to the badge on its own layer, so the star's
          glow and sparkles are free to spill past the edge. */}
      <span aria-hidden="true" className="bonus-sheen pointer-events-none absolute inset-0 overflow-hidden rounded-2xl" />
      <BonusStar size={38} />
      <span className="relative min-w-0">
        <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-amber-200 sm:text-[11px]">
          Bonus
        </span>
        {/* Balanced: on a phone it takes two lines, and unbalanced the
            second was "sign*" on its own. */}
        <span className="mt-0.5 block text-balance text-[15px] font-bold leading-snug text-amber-50 sm:text-lg">
          <span className="font-black text-amber-300" style={{ textShadow: '0 0 18px rgba(251,191,36,0.45)' }}>
            {AMOUNT}
          </span>{' '}
          {REST}*
        </span>
      </span>
    </div>
  );
}
