// ---------------------------------------------------------------------------
// Firm Foundation — $497/mo website + branded client portal tier
// Shared by the sales page, checkout route, Stripe webhook, provisioning,
// and the thank-you page. The charged amount comes from the Stripe Price
// (STRIPE_FOUNDATION_PRICE_ID); the values here are for display and for the
// InitiateCheckout / Purchase pixel events.
// ---------------------------------------------------------------------------

export { getSiteUrl } from './site';
import { DEMO_THANK_YOU_PATH } from './demo-config';

export const FOUNDATION_PRODUCT_ID = 'foundation';
export const FOUNDATION_PRODUCT_NAME = 'Firm Foundation';

/** Display price. Keep in sync with the Stripe Price. */
export const FOUNDATION_PRICE_VALUE = 497;
export const FOUNDATION_PRICE_DISPLAY = '$497';
export const FOUNDATION_PERIOD_LABEL = '/month';
export const FOUNDATION_CURRENCY = 'USD';

/**
 * One-time setup fee, charged on the same first invoice as month one.
 * Month-to-month after that: no minimum term, cancel with 30 days' notice.
 */
export const FOUNDATION_SETUP_FEE_VALUE = 999;
export const FOUNDATION_SETUP_FEE_DISPLAY = '$999';

/** What actually leaves the card on day one: setup fee + first month. */
export const FOUNDATION_FIRST_PAYMENT_VALUE = 1496;
export const FOUNDATION_FIRST_PAYMENT_DISPLAY = '$1,496';

/** Notice required to cancel. */
export const FOUNDATION_CANCEL_NOTICE_DAYS = 30;

/**
 * Stripe recurring Price for the subscription (monthly, $497).
 * Read lazily via getFoundationStripePriceId() so the sales page can render
 * without it; checkout throws a clear error when it is missing.
 */
export const FOUNDATION_STRIPE_PRICE_ID = process.env.STRIPE_FOUNDATION_PRICE_ID;

export function getFoundationStripePriceId(): string {
  const id = process.env.STRIPE_FOUNDATION_PRICE_ID;
  if (!id) {
    throw new Error(
      'STRIPE_FOUNDATION_PRICE_ID is not set. Create a recurring monthly Price for Firm Foundation in the Stripe Dashboard and set its id.'
    );
  }
  return id;
}

/**
 * Stripe one-time Price for the $999 setup fee. Checkout sends it as a second
 * line item on the subscription session, so it lands on the first invoice.
 */
export const FOUNDATION_STRIPE_SETUP_PRICE_ID = process.env.STRIPE_FOUNDATION_SETUP_PRICE_ID;

export function getFoundationSetupPriceId(): string {
  const id = process.env.STRIPE_FOUNDATION_SETUP_PRICE_ID;
  if (!id) {
    throw new Error(
      'STRIPE_FOUNDATION_SETUP_PRICE_ID is not set. Create a one-time $999 Price for Firm Foundation in the Stripe Dashboard and set its id.'
    );
  }
  return id;
}

/**
 * Mux playback ID for the hero demo video.
 * TODO: upload the Firm Foundation demo to Mux and paste its playback ID here.
 * While empty, the sales page renders a "Demo video coming soon" placeholder.
 */
export const FOUNDATION_MUX_DEMO_PLAYBACK_ID = '';

/**
 * Cal.com event used for the post-purchase kickoff call.
 * TODO: create a dedicated "Firm Foundation Kickoff" event type in Cal.com and
 * point this at it. Defaults to the same demo event the roadmap used.
 */
export const FOUNDATION_CAL_LINK = 'nexli-automation-6fgn8j/nexli-demo';
export const FOUNDATION_CAL_NAMESPACE = 'foundation-kickoff';

export const FOUNDATION_PATH = '/foundation';
/** Qualification questions + details, then preview generation. */
export const FOUNDATION_START_PATH = '/foundation/start';
/** Preview page; append /<token>. */
export const FOUNDATION_PREVIEW_PATH = '/foundation/preview';
/** The rendered preview site itself (same-origin, iframed by the preview page); append /<token>. */
export const FOUNDATION_PREVIEW_SITE_PATH = '/sites/preview';
/** The thank-you page now lives in the demo funnel (app/demo/thank-you). */
export const FOUNDATION_THANK_YOU_PATH: string = DEMO_THANK_YOU_PATH;

/** Lead source recorded for visitors who complete the questions and request a preview. */
export const FOUNDATION_PREVIEW_FORM_SOURCE = 'foundation-preview';

/**
 * Launch promise.
 *
 * DELIBERATELY 21, not the 14 the agency offer promises (see LAUNCH_DAYS in
 * components/GuaranteeSection.tsx). This is not drift — funnel buildouts take
 * priority in the build queue, so Firm Foundation carries the longer window.
 * Do not "fix" the two to match.
 *
 * Read by the /demo/offer and /demo/thank-you copy and by section 4 of the
 * signed client agreement (dashboard/src/lib/foundation-agreement.ts), so
 * changing it changes contract terms for everyone who signs afterwards.
 */
export const FOUNDATION_LIVE_IN_DAYS = 21;
export const FOUNDATION_GUARANTEE = `Live in ${FOUNDATION_LIVE_IN_DAYS} days or your next month is free`;

/** First month credited toward the Digital Rainmaker System when upgrading early. */
export const FOUNDATION_UPGRADE_CREDIT_DISPLAY = '$497';
export const FOUNDATION_UPGRADE_WINDOW_DAYS = 90;

/** Where "the rest of the system" lives. */
export const RAINMAKER_PATH = '/rainmaker';
export const RAINMAKER_APPLY_PATH = '/vslfunnel-offer';
export const RAINMAKER_NAME = 'Digital Rainmaker System';

export const SUPPORT_EMAIL = 'support@nexli.net';

/** Normalize a user-typed website to an https:// URL, or '' if unusable. */
export function normalizeWebsiteUrl(raw: string): string {
  let url = (raw || '').trim();
  if (!url) return '';
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('.')) return '';
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return '';
  }
}
