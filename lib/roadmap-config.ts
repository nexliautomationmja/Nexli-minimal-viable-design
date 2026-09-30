// ---------------------------------------------------------------------------
// CPA Scaling Roadmap — low-ticket product configuration (RETIRED)
// The /roadmap sales + thank-you pages now redirect to /foundation. This file
// stays so app/api/roadmap/** and the webhook's roadmap branch keep honoring
// existing buyers' access links and Stripe events.
// The charged amount comes from the Stripe Price (STRIPE_ROADMAP_PRICE_ID);
// the values here are for display and for the InitiateCheckout pixel event.
// ---------------------------------------------------------------------------

export const ROADMAP_PRODUCT_ID = 'cpa-scaling-roadmap';
export const ROADMAP_PRODUCT_NAME = 'CPA Scaling Roadmap';

/** Display price. Keep in sync with the Stripe Price. */
export const ROADMAP_PRICE_VALUE = 97;
export const ROADMAP_PRICE_DISPLAY = '$97';
export const ROADMAP_CURRENCY = 'USD';

/** Stripe Product. Its default price is used for checkout; STRIPE_ROADMAP_PRICE_ID overrides. */
export const ROADMAP_STRIPE_PRODUCT_ID =
  process.env.STRIPE_ROADMAP_PRODUCT_ID || 'prod_VC9SeZWrZ0bOLk';

/** PDF served from public/. Upload the real file to this path. */
export const ROADMAP_PDF_PATH = '/downloads/cpa-scaling-roadmap.pdf';

export const ROADMAP_PATH = '/roadmap';
export const ROADMAP_THANK_YOU_PATH = '/roadmap/thank-you';

/** getSiteUrl now lives in lib/site.ts; re-exported here so existing imports keep working. */
export { getSiteUrl } from './site';
