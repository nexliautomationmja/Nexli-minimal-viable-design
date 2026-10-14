/**
 * Why a firm is not a fit for the done-for-you engine, in words.
 *
 * The specific reason, never a generic "you don't qualify". A non-decision-maker
 * can go and fetch the partner; a $380K firm can come back next year. Both of
 * those are useful to say. "You don't qualify" is not, and it is what turns a
 * gate into an insult.
 *
 * Shared by the two pages that have to deliver the news:
 *
 *   /advisory-pricing/BOBA       the $97 downsell, where the firm lands
 *                                straight out of the qualifier
 *   /advisory-pricing/next-steps the same message after they have bought it
 *
 * Both must give the same reason for the same answers, which is why this is
 * not written twice.
 */
import {
  DISQUALIFYING_BUDGETS,
  DISQUALIFYING_REVENUE,
  DISQUALIFYING_ROLE,
} from './qualification-steps';
import { AGENCY_TOTAL_MONTHLY, usd } from './agency-offer';

export interface FitReason {
  heading: string;
  body: string;
}

export interface FitAnswers {
  usBased: boolean | null;
  decisionRole: string | null;
  annualRevenue: string | null;
  /** Null on funnels with no budget question. */
  budget?: string | null;
}

export function reasonFor(lead: FitAnswers): FitReason {
  if (lead.usBased === false) {
    return {
      heading: 'We only run this for US-based firms.',
      body: 'The engine depends on US advertising, US compliance work and a US calendar. Running it for a firm outside the States would mean promising results on infrastructure we do not have, so we do not take those engagements.',
    };
  }
  if (lead.decisionRole === DISQUALIFYING_ROLE) {
    return {
      heading: 'This needs the person who can sign off on it.',
      body: 'The engine changes how a firm prices, who it takes on and how it sells — decisions an owner or partner has to make. If that is someone else at your firm, bring them in and we will pick this straight back up.',
    };
  }
  if (lead.annualRevenue === DISQUALIFYING_REVENUE) {
    return {
      heading: 'Below about $400K, this would be the wrong spend.',
      body: 'The engine assumes a firm with capacity to absorb new advisory clients and the cash flow to run ads while they convert. Under that mark, the honest answer is that the guide plus your existing referrals will move you further than we would.',
    };
  }
  if (lead.budget && DISQUALIFYING_BUDGETS.includes(lead.budget)) {
    return {
      heading: `It comes to about ${usd(AGENCY_TOTAL_MONTHLY)} a month, and you said that is not where you are.`,
      body: 'That is a straight answer and we will take it at face value rather than try to talk you round. The engine only works when the ad spend runs long enough to compound, and starting it underfunded is how firms conclude ads do not work for accountants. When the budget is there, come back.',
    };
  }

  return {
    heading: 'Not a fit for the done-for-you engine right now.',
    body: 'Based on your answers, the system we run would not be the right next move for your firm today. That is a judgement about the engine, not about your practice.',
  };
}
