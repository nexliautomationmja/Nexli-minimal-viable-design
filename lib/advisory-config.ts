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

import { AGENCY_ENGAGEMENT_LOW } from './agency-offer';

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
 * The AGENCY cut, swapped in 2 November 2026 alongside the headline that
 * argues the same thing. Its captions run price-shoppers, what a firm
 * legally keeps, and the partner who shows up — the lead-QUALITY argument,
 * not the lead-volume one that /better-clients owns.
 *
 * PLAYBACK id, not the asset id. https://stream.mux.com/<id>.m3u8 returns
 * 200 for a playback id and 400 for an asset id, which is the quickest way
 * to tell them apart; this one was checked that way, along with its
 * thumbnail, before the swap.
 *
 * THE AUDIO FIGURE IS UNCONFIRMED FOR THIS CUT. The previous video was a
 * re-record whose audio said $15,000 rather than $8,000, which is why the
 * page states $15,000 — the subheadline reads AGENCY_ENGAGEMENT_LOW and the
 * rest of the funnel is built on the same number. Four frames of this cut
 * were sampled and none named a figure, so nothing is known to disagree,
 * but nobody has listened to it end to end. If it says a different number,
 * the video or the funnel's arithmetic has to move — not the page copy
 * alone, because the opt-in headline, PipelineMath's $750,000 and the
 * nurture emails all read the same constant.
 *
 * Previous cuts, both still live in Mux and restorable by swapping the id
 * below and nothing else:
 *   6GrhZJ89yT9to6NOSN02d01ZKNPvkx7pnMVkvGS00ZeMx8  ($15,000 re-record)
 *   4MS5DZOqaCLjkxU4zrYaVbPZi9fyoJ8ZNisqkuz16Z8     ($8,000 original)
 */
export const ADVISORY_VSL_VIDEO_PLAYBACK_ID =
  'DAz01n02SQs7nrMKmVTDAQ02vE1gXoPdenIIiBKL01G2MdM';

/**
 * Daniela presents this cut, not Jasmine — the public /vslfunnel-betterclients
 * video is Jasmine's and keeps her name. Distinct titles also keep the two
 * cuts' watch-time and drop-off separate in Mux rather than merged.
 */
export const ADVISORY_VSL_VIDEO_TITLE = 'Daniela VSL - CPA Ads ($15K)';

// ── The belief-angle VSLs ─────────────────────────────────────────────────
//
// Three siblings of /advisory-pricing, each arguing against a different
// belief a firm owner already holds. Same page, same chrome, same qualifier:
// only the headline, the subheading and eventually the video differ.
//
//   /advisory-pricing                  "I hired an agency and got trash leads"
//   /advisory-pricing/better-clients   "I need more leads"
//   /advisory-pricing/systems          "I need to grind harder"
//   /advisory-pricing/acquisition      "referrals work better"
//
// Each angle has its own cut as of 2 November 2026. They were placeholders
// pointing at the advisory video for a while, which meant the Systems page
// promised systems and played a video about agencies; that is fixed. Each id
// below was checked against stream.mux.com and image.mux.com before wiring.
//
// VERIFY A PLAYBACK ID BEFORE WIRING IT. https://stream.mux.com/<id>.m3u8 and
// https://image.mux.com/<id>/thumbnail.jpg both return 200 for a playback id
// and 400 for an asset id. Note the id never appears in the server HTML —
// mux-player sets it as a DOM property on hydration — so curl cannot confirm
// the page is using it. Check in a browser.

export const BETTER_CLIENTS_VSL_PLAYBACK_ID =
  'mMdc7SPqpRspzwM5ozRfApnNr4fEkiP02vRZOcKvSWBg';
export const BETTER_CLIENTS_VSL_TITLE = 'Better Clients VSL';

export const SYSTEMS_VSL_PLAYBACK_ID =
  'MOzPjnV4QY3Y85OYCcUcyNLtdHatO1r7YY9qtNLDoic';
export const SYSTEMS_VSL_TITLE = 'Systems VSL';

export const ACQUISITION_VSL_PLAYBACK_ID =
  'ofWX01agb2iNVd3qiqFG7ybD4202DW2qRAEFEySOkd4lY';
export const ACQUISITION_VSL_TITLE = 'Acquisition VSL';

/**
 * Which second each poster frame comes from.
 *
 * Separate from the ids because the frame is a property of the CUT, not of
 * the page: when a real video arrives its best frame will not be the
 * placeholder's. Mux serves a mid-asset frame when given no time at all, so
 * a value is always required.
 *
 * 0 on all three: each cut opens on the speaker already framed, so the first
 * frame is a usable one. Preview any other frame at
 * https://image.mux.com/<playback id>/thumbnail.jpg?time=2.5 before changing
 * one — these cuts are captioned throughout, so every frame has text on it
 * and the choice is between captions, not away from them.
 */
export const BETTER_CLIENTS_VSL_POSTER_TIME = 0;
export const SYSTEMS_VSL_POSTER_TIME = 0;
export const ACQUISITION_VSL_POSTER_TIME = 0;

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
// The agency angle's paths, kept under their original names because a lot
// of callers want "the default funnel" rather than a specific angle: the
// /qualify redirect, PipelineMath's CTA, the CAPI event_source_url
// fallbacks. Each angle's own paths come from the helpers further down.
export const ADVISORY_PATH = '/agency';

/**
 * The $297 page. No longer the main path — it is the downsell a firm lands on
 * after the qualifier says it is not a fit for the agency engagement.
 */
// BOBA = Book of Business Accelerator. Capitalised because that is how the
// path was specified; URLs are case-sensitive, so /boba is a 404 and the
// redirects in next.config.ts cover the old paths, not the lowercase one.
export const ADVISORY_OFFER_PATH = '/advisory-pricing/BOBA';
export const ADVISORY_THANK_YOU_PATH = '/advisory-pricing/BOBA-thank-you';
export const ADVISORY_QUALIFY_PATH = '/agency/qualify';

/**
 * The `angle` each page appends to its CTA, and the only thing that carries
 * which belief converted into GoHighLevel.
 *
 * Four pages share one qualifier, so form_source, the CAPI content_name and
 * the GHL `source` field are identical across all of them. landing_page does
 * discriminate, but lib/lead-upsert writes attribution columns on INSERT
 * only — a returning lead keeps the landing_page from whichever page they
 * saw first, forever. This param does not have that problem.
 */
export const VSL_ANGLE_AGENCY = 'agency';
export const VSL_ANGLE_BETTER_CLIENTS = 'better-clients';
export const VSL_ANGLE_SYSTEMS = 'systems';
export const VSL_ANGLE_ACQUISITION = 'acquisition';

/** `/advisory-pricing/qualify?angle=systems` */
/**
 * Every angle, in the order they were built. Exported so route files,
 * robots.ts and the redirect table cannot disagree about which four exist.
 */
export const VSL_ANGLES = [
  VSL_ANGLE_AGENCY,
  VSL_ANGLE_BETTER_CLIENTS,
  VSL_ANGLE_SYSTEMS,
  VSL_ANGLE_ACQUISITION,
] as const;

export type VslAngle = (typeof VSL_ANGLES)[number];

/** Narrows an untrusted string — a URL segment, a webhook field — to an angle. */
export function isVslAngle(value: string | null | undefined): value is VslAngle {
  return typeof value === 'string' && (VSL_ANGLES as readonly string[]).includes(value);
}

// ── Each angle owns its whole funnel ─────────────────────────────────────
//
// /acquisition -> /acquisition/qualify -> /acquisition/call
//                                      -> /acquisition/next-steps
//
// Until 4 November 2026 all four angles shared one funnel under
// /advisory-pricing/ and were told apart only by a ?angle= query param. The
// pages were always identical; what differed was reporting. Giving each
// angle its own path means the URL itself carries the attribution, so it
// survives in places a query string does not: analytics path reports, a
// shared link, a screenshot in an ad review.
//
// THE PAGES ARE STILL ONE IMPLEMENTATION. app/_funnel holds the three steps
// and the twelve route files are thin wrappers that pass their own angle.
// Four copies of a funnel is how four funnels drift; this is four doors
// into one.
//
// The old /advisory-pricing/* paths 301 to the agency angle — they are in
// already-sent email as resume links, so they cannot 404.

/** `/agency`, `/systems`, … the VSL itself. */
export function anglePath(angle: string): string {
  return `/${angle}`;
}

/** `/systems/qualify` — where that angle's VSL button points. */
export function qualifyPathForAngle(angle: string): string {
  return `/${angle}/qualify`;
}

/** `/systems/call` — the calendar, for a firm that cleared the bar. */
export function callPathForAngle(angle: string): string {
  return `/${angle}/call`;
}

/** `/systems/next-steps` — the terminus for a firm that did not. */
export function nextStepsPathForAngle(angle: string): string {
  return `/${angle}/next-steps`;
}

/**
 * Falls back to the agency angle for anything unrecognised.
 *
 * The angle reaching the API is untrusted: it arrives in a POST body that
 * anyone can shape. Routing a stranger's lead to `/<whatever they sent>/call`
 * would be an open redirect, so unknown values land on the original funnel
 * rather than being echoed back into a URL.
 */
export function safeAngle(value: string | null | undefined): VslAngle {
  return isVslAngle(value) ? value : VSL_ANGLE_AGENCY;
}

/**
 * The GoHighLevel tag naming which VSL a lead came through:
 *
 *   agencyVSL · better-clientsVSL · systemsVSL · acquisitionVSL
 *
 * These are the names the GHL workflows filter on (the Advisory Incomplete
 * flow branches on them). GHL stores tags lowercased, so they show up there
 * as agencyvsl, better-clientsvsl and so on — matching is unaffected.
 *
 * Applied at all three writes — the contact step, the finished qualifier
 * and the booking — so the tag is on the contact whichever of those a lead
 * stops at, and before each webhook fires.
 *
 * Only the four known angles produce a tag. The value arrives in a POST
 * body, and an unchecked string here would mint arbitrary CRM tags on demand.
 */
export function vslTag(angle: string | null | undefined): string | null {
  return isVslAngle(angle) ? `${angle}VSL` : null;
}

/**
 * Cleared the qualifier, having come in through one of the four VSLs.
 *
 * One tag for every angle, so a GHL flow can target all qualified VSL leads
 * without listing four tags — pair it with the angle's own tag when the
 * flow needs to know which one. Applied by the qualifier when the firm
 * clears the bar, and again at booking (a booking is only possible for a
 * qualified firm). Never applied to 'not a fit', nor to the Accelerator or
 * demo funnels, which send no angle.
 */
export const TAG_QUALIFIED_VSL = 'qualified-vsl';

export const ADVISORY_CALL_PATH = '/agency/call';
export const ADVISORY_NEXT_STEPS_PATH = '/agency/next-steps';

/** leads.form_source for anyone who completes this funnel's qualifier. */
export const ADVISORY_FORM_SOURCE = 'advisory-qualifier';

// ── GoHighLevel tags ──────────────────────────────────────────────────────
export const TAG_ADVISORY_OPT_IN = 'advisory opt-in';
export const TAG_ADVISORY_BUYER = 'advisory buyer';
export const TAG_ADVISORY_QUALIFIED = 'advisory qualified';
export const TAG_ADVISORY_NOT_A_FIT = 'advisory not a fit';

/**
 * Gave us their details and never answered the last question.
 *
 * The contact step is question five of six, and the qualifier only POSTs
 * once, at the end — so until the partial-capture route existed, someone
 * who typed their name, email and phone and then closed the tab produced
 * nothing at all. No row, no contact, no webhook. Five answers and a
 * phone number, lost.
 *
 * /api/advisory-pricing/partial now writes the row as soon as the contact
 * step is submitted and applies this tag. recordQualification removes it
 * when they finish, so the tag means exactly one thing: STILL unfinished.
 * Anything that nurtures on it must therefore trigger on the tag being
 * ADDED and branch on whether it is still present, not fire blind.
 */
export const TAG_ADVISORY_INCOMPLETE = 'advisory incomplete';

/**
 * Picked a time on the calendar.
 *
 * Added because the two tags that already fired on a booking are both
 * badly named for it. 'agency pitch' comes from FUNNEL_PATH_TAG and is
 * applied by the QUALIFIER — every firm that clears the bar has it,
 * booked or not, so a reminder flow keyed on it would text people who
 * have no call. 'advisory qualified' sounds like it means qualified but
 * is in fact only written at booking. Neither reads as "booked".
 *
 * This one says what it means, and it is what the appointment reminder
 * workflow triggers on. That workflow cannot use the Cal.com connector,
 * which has never picked up a booking from this event type.
 *
 * A TAG ALONE IS NOT ENOUGH FOR TIMED REMINDERS. It says they booked,
 * not when the call is, so "wait until 48 hours before" has nothing to
 * count back from. The booking time goes onto the contact as the
 * booking_start custom field in the same write — see ghl-sync.
 */
export const TAG_ADVISORY_BOOKED = 'advisory booked';

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
  ACCELERATOR_TOP_N * ACCELERATOR_CLOSE_RATE * AGENCY_ENGAGEMENT_LOW;

/** The PDF's honest lower band: the same four clients at $7K–$12K each. */
export const ACCELERATOR_LOW_FEE = 7_000;
export const ACCELERATOR_HIGH_FEE = 12_000;

/** Refund window promised on /next-steps. Keep in sync with the terms page. */
export const ADVISORY_REFUND_DAYS = 30;

/** getSiteUrl lives in lib/site.ts; re-exported for the webhook's convenience. */
export { getSiteUrl } from './site';
