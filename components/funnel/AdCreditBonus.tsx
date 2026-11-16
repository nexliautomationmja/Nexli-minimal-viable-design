'use client';

// ---------------------------------------------------------------------------
// The ad-credit bonus under "See If Your Firm Qualifies" on every VSL page
// (Marcel, 2026-11-16). Visitors click through from the ads; the drop is
// between watching and finishing the qualifier, and a concrete reason to
// qualify now is the point of this line. /booking-confirmed-b carries it
// too, at the top: the firm has booked, and this is what signing gets them.
//
// The same look as the bonus on /math's invest slide: gold, a slow sheen,
// and the animated gold star (components/math/BonusStar), so a prospect who
// sees both recognises the one offer.
//
// "UP TO": the annual plan's bonus is the $10,000; on the monthly plan Nexli
// matches the first month of ads, $5,000 (lib/agency-offer). The asterisk
// points at AD_CREDIT_FOOTNOTE, which every page showing this prints:
// VslDisclaimer at the foot of the VSLs, under the price on
// /booking-confirmed-b.
//
// `tone`: the VSLs are always dark. /booking-confirmed-b follows the site
// theme, and the cream-on-gold text vanishes on white, so it passes the
// theme in.
// ---------------------------------------------------------------------------
import BonusStar, { BONUS_SHEEN_CSS } from '@/components/math/BonusStar';
import { AGENCY_ANNUAL_PLAN_BONUS, usd } from '@/lib/agency-offer';

const AMOUNT = `Up to ${usd(AGENCY_ANNUAL_PLAN_BONUS)}`;
const REST = 'in ad credit when you sign';

const TONES = {
  dark: {
    background: 'linear-gradient(135deg, rgba(251,191,36,0.22) 0%, rgba(245,158,11,0.09) 55%, rgba(180,83,9,0.14) 100%)',
    boxShadow: '0 0 44px -14px rgba(251,191,36,0.6), inset 0 1px 0 rgba(255,247,214,0.18)',
    border: 'border-amber-300/60',
    kicker: 'text-amber-200',
    text: 'text-amber-50',
    amount: 'text-amber-300',
    amountGlow: '0 0 18px rgba(251,191,36,0.45)',
  },
  light: {
    background: 'linear-gradient(135deg, rgba(254,243,199,0.95) 0%, rgba(253,230,138,0.55) 55%, rgba(251,191,36,0.3) 100%)',
    boxShadow: '0 10px 34px -14px rgba(217,119,6,0.55), inset 0 1px 0 rgba(255,255,255,0.7)',
    border: 'border-amber-400/80',
    kicker: 'text-amber-700',
    text: 'text-amber-950',
    amount: 'text-amber-700',
    amountGlow: 'none',
  },
} as const;

export default function AdCreditBonus({
  size = 'lg',
  tone = 'dark',
  className = '',
}: {
  /** lg: the boxed badge under the big button. sm: one line, for the sticky bar. */
  size?: 'lg' | 'sm';
  tone?: keyof typeof TONES;
  className?: string;
}) {
  const t = TONES[tone];

  if (size === 'sm') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <BonusStar size={18} />
        <span className={`text-[12.5px] font-semibold sm:text-sm md:text-base ${t.text}`}>
          <span className={`font-black ${t.amount}`}>{AMOUNT}</span> {REST}*
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative inline-flex items-center gap-3.5 rounded-2xl border py-3 pl-4 pr-5 text-left sm:pr-6 ${t.border} ${className}`}
      style={{ background: t.background, boxShadow: t.boxShadow }}
    >
      <style>{BONUS_SHEEN_CSS}</style>
      {/* The sheen is clipped to the badge on its own layer, so the star's
          glow and sparkles are free to spill past the edge. */}
      <span aria-hidden="true" className="bonus-sheen pointer-events-none absolute inset-0 overflow-hidden rounded-2xl" />
      <BonusStar size={38} />
      <span className="relative min-w-0">
        <span className={`block text-[10px] font-bold uppercase tracking-[0.16em] sm:text-[11px] ${t.kicker}`}>
          Bonus
        </span>
        {/* Balanced: on a phone it takes two lines, and unbalanced the
            second was "sign*" on its own. */}
        <span className={`mt-0.5 block text-balance text-[15px] font-bold leading-snug sm:text-lg ${t.text}`}>
          <span className={`font-black ${t.amount}`} style={{ textShadow: t.amountGlow }}>
            {AMOUNT}
          </span>{' '}
          {REST}*
        </span>
      </span>
    </div>
  );
}
