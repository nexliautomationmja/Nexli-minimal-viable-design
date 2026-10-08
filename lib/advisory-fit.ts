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
 *   /advisory-pricing/offer      the $297 downsell, where the firm lands
 *                                straight out of the qualifier
 *   /advisory-pricing/next-steps the same message after they have bought it
 *
 * Both must give the same reason for the same answers, which is why this is
 * not written twice.
 */
import { DISQUALIFYING_REVENUE, DISQUALIFYING_ROLE } from './qualification-steps';

export interface FitReason {
  heading: string;
  body: string;
}

export interface FitAnswers {
  usBased: boolean | null;
  decisionRole: string | null;
  annualRevenue: string | null;
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
  return {
    heading: 'Not a fit for the done-for-you engine right now.',
    body: 'Based on your answers, the system we run would not be the right next move for your firm today. That is a judgement about the engine, not about your practice.',
  };
}
