// Display rules for the Tax Planning Tool. Every dollar figure on the page
// and the PDF goes through `money`: rounded to the nearest $100, because an
// estimate printed to the dollar claims a precision it doesn't have.
import { usd } from '@/lib/see-the-math';
import type { StrategyId } from '@/lib/tax-planning/engine';

export const round100 = (n: number) => Math.round(n / 100) * 100;
export const money = (n: number) => usd(round100(n));
export const pct = (share: number) => `${Math.round(share * 100)}%`;

/** The firm's name, or a stand-in until it's typed. */
export const firmName = (name: string) => name.trim() || 'Your firm';

/** Short names for the setup chips. */
export const STRATEGY_SHORT: Record<StrategyId, string> = {
  scorp: 'S corp & salary',
  reimburse: 'Home office & vehicle',
  augusta: 'Augusta rule',
  kids: 'Hiring kids',
  retire: 'Retirement plan',
  hsa: 'HSA',
};
