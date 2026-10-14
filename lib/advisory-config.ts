// ---------------------------------------------------------------------------
// Book of Business Accelerator — $297 one-time product.
//
// The funnel: /advisory-pricing (opt-in) -> /offer (VSL + checkout) -> Stripe
// -> /thank-you (deliver + pitch the agency) -> /qualify -> /call | /next-steps
//
// A single five-page PDF: find your top 20 by stated criteria, a phone
// script, and a pricing table that turns projected savings into one fixed
// fee. It does not score or rank anything algorithmically — the copy across
// this funnel has to stay inside what the PDF actually does.
//
// Replaces the retired $97 CPA Scaling Roadmap, whose machinery this reuses.
// The charged amount comes from the Stripe Price; the values here are for
// display and for the InitiateCheckout / Purchase pixel events.
// ---------------------------------------------------------------------------

import { AGENCY_ENGAGEMENT_AVG } from './agency-offer';

export const ADVISORY_PRODUCT_ID = 'advisory-pricing';
export const ADVISORY_PRODUCT_NAME = 'Book of Business Accelerator';

/** Display price. Keep in sync with the Stripe Price. */
/**
 * What is actually charged, and what Stripe must be configured to charge.
 *
 * ⚠️  STRIPE_ADVISORY_PRICE_ID has to point at a Price of this amount. The
 * page renders this number and Stripe charges whatever the Price id says —
 * nothing reconciles the two, so a stale id means the page advertises $97
 * and the card is billed something else. Change one, change both.
 */
export const ADVISORY_PRICE_VALUE = 97;
export const ADVISORY_PRICE_DISPLAY = '$97';

/**
 * The struck-through anchor. This is what the guide was sold at and is a
 * real former price, not an invented one — which is the only kind of
 * anchor worth showing. Nothing charges against it.
 */
export const ADVISORY_LIST_PRICE_VALUE = 297;
export const ADVISORY_LIST_PRICE_DISPLAY = '$297';

/** $200. Derived so the three numbers can never disagree. */
export const ADVISORY_SAVINGS_VALUE = ADVISORY_LIST_PRICE_VALUE - ADVISORY_PRICE_VALUE;
export const ADVISORY_SAVINGS_DISPLAY = `$${ADVISORY_SAVINGS_VALUE}`;
export const ADVISORY_CURRENCY = 'USD';

/**
 * The one-time $297 Price. Required — there is deliberately no fallback.
 *
 * The retired roadmap funnel fell back to the Stripe Product's default price
 * and then to an ad-hoc price_data of $97. Carried forward, a missing env var
 * would have charged $97 while the page said $297 and the pixel reported 297,
 * with nothing logged. Better to fail loudly at checkout than to undercharge
 * silently. Mirrors getFoundationStripePriceId().
 */
export function getAdvisoryPriceId(): string {
  const id = process.env.STRIPE_ADVISORY_PRICE_ID;
  if (!id) {
    throw new Error(
      'STRIPE_ADVISORY_PRICE_ID is not set. Create a one-time $297 Price for the ' +
        'Book of Business Accelerator in the Stripe Dashboard and set its id.'
    );
  }
  return id;
}

// ── Delivery ──────────────────────────────────────────────────────────────

/**
 * The product, as one PDF.
 *
 * Deliberately NOT in public/ — anything there is a guessable URL and this
 * file is the entire $297. It is served by /api/advisory-pricing/download,
 * which checks the purchase on the lead row first.
 *
 * Because it sits outside public/, next.config.ts must list it under
 * outputFileTracingIncludes or the route 404s in production while working
 * perfectly on localhost.
 */
export const ADVISORY_PDF_RELATIVE_PATH = 'assets/book-of-business-accelerator.pdf';

/** What the browser saves it as. */
export const ADVISORY_PDF_FILENAME = 'Nexli-Book-of-Business-Accelerator.pdf';

/**
 * The welcome video on the thank-you page, under the download.
 *
 * Mux PLAYBACK id, not the asset id — they look alike and only this one
 * resolves (https://stream.mux.com/<id>.m3u8 returns 200 for a playback id
 * and 400 for an asset id). Empty renders nothing at all rather than a
 * placeholder box: on a page someone reaches seconds after paying, an empty
 * frame reads as broken.
 */
export const ADVISORY_THANKYOU_VIDEO_PLAYBACK_ID =
  'wK01XjYeVa25uxR01X5rqofMIwSORwCIiqQ01YP2Np4Fts';

export const ADVISORY_THANKYOU_VIDEO_TITLE = 'Book of Business Accelerator — Welcome';

/**
 * The VSL on /advisory-pricing — the funnel's landing page.
 *
 * A re-record of the Better Clients VSL whose audio says $15,000 rather than
 * $8,000, so it agrees with AGENCY_ENGAGEMENT_AVG and with every other number
 * in the funnel. The public /vslfunnel-betterclients page keeps the original
 * $8,000 cut; the two are deliberately different videos.
 *
 * PLAYBACK id, not the asset id. The asset id for this cut is
 * 4btVOu9GtQgOzrLm5feIqdG8xUIvC2E8EFstnDwiYbg, which does NOT resolve —
 * https://stream.mux.com/<id>.m3u8 returns 200 for a playback id and 400 for
 * an asset id, which is the quickest way to tell them apart. Both were
 * checked that way before this swap.
 *
 * Previous cut: 4MS5DZOqaCLjkxU4zrYaVbPZi9fyoJ8ZNisqkuz16Z8 (asset
 * vGfoTlNWAwq00ODLqD015qcl007GI201SAweqSUVPIuGxlY). Still live in Mux, so
 * it can be put back by swapping the id below and nothing else.
 */
export const ADVISORY_VSL_VIDEO_PLAYBACK_ID =
  '6GrhZJ89yT9to6NOSN02d01ZKNPvkx7pnMVkvGS00ZeMx8';

/**
 * Daniela presents this cut, not Jasmine — the public /vslfunnel-betterclients
 * video is Jasmine's and keeps her name. Distinct titles also keep the two
 * cuts' watch-time and drop-off separate in Mux rather than merged.
 */
export const ADVISORY_VSL_VIDEO_TITLE = 'Daniela VSL - CPA Ads ($15K)';

/**
 * The VSL on the $97 offer page.
 *
 * Its own cut, not the funnel's — /advisory-pricing sells a $9,997/month
 * engagement and this sells a five-page PDF. Separate ids also keep the two
 * videos' watch-time apart in Mux.
 *
 * PLAYBACK id. https://stream.mux.com/<id>.m3u8 returns 200 for a playback
 * id and 400 for an asset id; this one was checked that way.
 */
export const ADVISORY_OFFER_VIDEO_PLAYBACK_ID =
  'fzwKGAo5nQy32VYdY00iGMRugAzD7Y6URrf7KgndNcec';

export const ADVISORY_OFFER_VIDEO_TITLE = 'Book of Business Accelerator - Offer';

/** The gated route. Never link the file path itself. */
export const ADVISORY_DOWNLOAD_PATH = '/api/advisory-pricing/download';

// ── Paths ─────────────────────────────────────────────────────────────────
// None of these may be added to next.config.ts's redirects(). The retired
// funnel shipped a GHL delivery email whose access_url pointed at
// /roadmap/thank-you *after* that path had been 301'd to the opt-in form, so
// every buyer was sent to a signup page. Nothing checked the two against
// each other.

/**
 * The VSL, and the funnel's landing page. Public and indexable — it is the
 * ad destination. There is no opt-in in front of it any more; contact
 * details are collected inside the qualifier.
 */
export const ADVISORY_PATH = '/advisory-pricing';

/**
 * The $297 page. No longer the main path — it is the downsell a firm lands on
 * after the qualifier says it is not a fit for the agency engagement.
 */
// BOBA = Book of Business Accelerator. Capitalised because that is how the
// path was specified; URLs are case-sensitive, so /boba is a 404 and the
// redirects in next.config.ts cover the old paths, not the lowercase one.
export const ADVISORY_OFFER_PATH = '/advisory-pricing/BOBA';
export const ADVISORY_THANK_YOU_PATH = '/advisory-pricing/BOBA-thank-you';
export const ADVISORY_QUALIFY_PATH = '/advisory-pricing/qualify';
export const ADVISORY_CALL_PATH = '/advisory-pricing/call';
export const ADVISORY_NEXT_STEPS_PATH = '/advisory-pricing/next-steps';

/** leads.form_source for anyone who completes this funnel's qualifier. */
export const ADVISORY_FORM_SOURCE = 'advisory-qualifier';

// ── GoHighLevel tags ──────────────────────────────────────────────────────
export const TAG_ADVISORY_OPT_IN = 'advisory opt-in';
export const TAG_ADVISORY_BUYER = 'advisory buyer';
export const TAG_ADVISORY_QUALIFIED = 'advisory qualified';
export const TAG_ADVISORY_NOT_A_FIT = 'advisory not a fit';

// ── The headline math, straight from page 3 of the PDF ────────────────────
// 20 top clients × a 20% close rate × the average engagement = $60,000.
// Derived rather than hard-coded so the site and the PDF cannot drift.
// The close rate is an ASSUMPTION and the copy must say so — it is a worked
// example, not a promise.

/** How many clients the PDF's step one tells them to pull. */
export const ACCELERATOR_TOP_N = 20;

/** The close rate the PDF's worked example assumes. */
export const ACCELERATOR_CLOSE_RATE = 0.2;

/** $60,000. */
export const ACCELERATOR_TARGET =
  ACCELERATOR_TOP_N * ACCELERATOR_CLOSE_RATE * AGENCY_ENGAGEMENT_AVG;

/** The PDF's honest lower band: the same four clients at $7K–$12K each. */
export const ACCELERATOR_LOW_FEE = 7_000;
export const ACCELERATOR_HIGH_FEE = 12_000;

/** Refund window promised on /next-steps. Keep in sync with the terms page. */
export const ADVISORY_REFUND_DAYS = 30;

/** getSiteUrl lives in lib/site.ts; re-exported for the webhook's convenience. */
export { getSiteUrl } from './site';
