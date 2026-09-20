/**
 * Pure math for the internal sales-call profit calculator at /profit-calculator.
 * No React, no side effects. Inputs are per month; `view` scales results.
 */

export type Period = 'monthly' | 'annual';

export interface ProfitInputs {
  /** Consults Nexli delivers per month */
  consultsPerMonth: number;
  /** Close rate, percent 0-100 */
  closeRate: number;
  /** One-time advisory engagement fee per closed client, USD */
  engagementFee: number;
  /** Optional recurring retainer per client per year, USD */
  recurringAnnual: number;
  /** Firm profit margin on advisory work, percent 0-100 */
  profitMargin: number;
  /** What the firm pays Nexli, USD (monthly amount or annual lump sum) */
  nexliFee: number;
  /** Whether nexliFee is a monthly amount or an annual lump sum */
  nexliFeePeriod: Period;
  /** Average tax the lead has already paid to the IRS, context only */
  avgTaxPaid: number;
}

export const DEFAULT_INPUTS: ProfitInputs = {
  consultsPerMonth: 50,
  closeRate: 20,
  engagementFee: 10000,
  recurringAnnual: 0,
  profitMargin: 40,
  nexliFee: 5000,
  nexliFeePeriod: 'monthly',
  avgTaxPaid: 100000,
};

export interface ProfitResults {
  consults: number;
  closedClients: number;
  newEngagementRevenue: number;
  recurringRevenue: number;
  grossRevenue: number;
  grossProfit: number;
  nexliCost: number;
  netProfit: number;
  /** grossProfit / nexliCost, null when cost is 0 */
  roiMultiple: number | null;
  /** grossRevenue / nexliCost, null when cost is 0 */
  revenuePerDollar: number | null;
  /** Closed clients needed for profit to cover the Nexli fee, null when unattainable */
  breakEvenClients: number | null;
  /** nexliCost / closedClients, null when no clients close */
  costPerClosedClient: number | null;
  totalTaxAlreadyPaid: number;
}

export function computeProfit(i: ProfitInputs, view: Period): ProfitResults {
  const mult = view === 'annual' ? 12 : 1;

  const consults = i.consultsPerMonth * mult;
  const closedClients = consults * (i.closeRate / 100);

  const newEngagementRevenue = closedClients * i.engagementFee;
  const recurringPerClient = view === 'annual' ? i.recurringAnnual : i.recurringAnnual / 12;
  const recurringRevenue = closedClients * recurringPerClient;
  const grossRevenue = newEngagementRevenue + recurringRevenue;

  const grossProfit = grossRevenue * (i.profitMargin / 100);

  const monthlyFee = i.nexliFeePeriod === 'annual' ? i.nexliFee / 12 : i.nexliFee;
  const nexliCost = monthlyFee * mult;

  const netProfit = grossProfit - nexliCost;

  const profitPerClient =
    (i.engagementFee + recurringPerClient) * (i.profitMargin / 100);

  return {
    consults,
    closedClients,
    newEngagementRevenue,
    recurringRevenue,
    grossRevenue,
    grossProfit,
    nexliCost,
    netProfit,
    roiMultiple: nexliCost > 0 ? grossProfit / nexliCost : null,
    revenuePerDollar: nexliCost > 0 ? grossRevenue / nexliCost : null,
    breakEvenClients: profitPerClient > 0 ? Math.ceil(nexliCost / profitPerClient) : null,
    costPerClosedClient: closedClients > 0 ? nexliCost / closedClients : null,
    totalTaxAlreadyPaid: closedClients * i.avgTaxPaid,
  };
}

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export const formatCurrency = (value: number): string => usdFormatter.format(value);

export const formatClients = (n: number): string =>
  Number.isInteger(n) ? String(n) : n.toFixed(1);

export const formatMultiple = (n: number): string => `${n.toFixed(1)}x`;

export const formatPercent = (n: number): string => `${Math.round(n)}%`;
