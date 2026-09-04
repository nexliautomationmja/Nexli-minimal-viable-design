// ---------------------------------------------------------------------------
// CPA Scaling Roadmap — low-ticket product configuration
// Shared by the sales page, checkout route, Stripe webhook, and thank-you page.
// The charged amount comes from the Stripe Price (STRIPE_ROADMAP_PRICE_ID);
// the values here are for display and for the InitiateCheckout pixel event.
// ---------------------------------------------------------------------------

export const ROADMAP_PRODUCT_ID = 'cpa-scaling-roadmap';
export const ROADMAP_PRODUCT_NAME = 'CPA Scaling Roadmap';

/** Display price. Keep in sync with the Stripe Price. */
export const ROADMAP_PRICE_VALUE = 97;
export const ROADMAP_PRICE_DISPLAY = '$97';
/** Anchor price shown struck through on the sales page. */
export const ROADMAP_ANCHOR_PRICE_DISPLAY = '$297';
export const ROADMAP_CURRENCY = 'USD';

/** Stripe Product. Its default price is used for checkout; STRIPE_ROADMAP_PRICE_ID overrides. */
export const ROADMAP_STRIPE_PRODUCT_ID =
  process.env.STRIPE_ROADMAP_PRODUCT_ID || 'prod_VC9SeZWrZ0bOLk';

/** Mux playback IDs. Replace with the real teaser + full walkthrough IDs. */
export const ROADMAP_MUX_TEASER_PLAYBACK_ID = 'sOp7S00u00HppAiF4VmSzuC2liXPqZmYiaRSXlHkCUcC8';
export const ROADMAP_MUX_FULL_PLAYBACK_ID = 'i02jTMTuY028ZUWRHJsjSRBEEYBJGPcl005sEV3iOARIn00';

/** PDF served from public/. Upload the real file to this path. */
export const ROADMAP_PDF_PATH = '/downloads/cpa-scaling-roadmap.pdf';

/** Cal.com event used for the post-purchase strategy call. */
export const ROADMAP_CAL_LINK = 'nexli-automation-6fgn8j/nexli-demo';
export const ROADMAP_CAL_NAMESPACE = 'roadmap-call';

export const ROADMAP_PATH = '/roadmap';
export const ROADMAP_THANK_YOU_PATH = '/roadmap/thank-you';

/** Absolute site origin for Stripe success/cancel URLs and CAPI source URLs. */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.nexli.net';
  return raw.replace(/\/+$/, '');
}
