// ---------------------------------------------------------------------------
// The Accelerator funnel — the free one.
//
// WHY A SECOND FUNNEL. Meta's optimiser needs roughly fifty conversions a
// week before it learns anything useful, and the advisory funnel will never
// produce that: it is gated on a $400K revenue floor and a $9,997/month
// budget question, by design. This funnel exists to feed the optimiser. It
// gives the Book of Business Accelerator away, captures the contact, and
// lets Meta optimise against a number it can actually reach.
//
// It does not replace anything. /advisory-pricing is untouched.
//
// THE SHAPE:
//
//   /accelerator          free offer, one button
//   /accelerator/qualify  five questions + contact. NO budget question.
//        ├─ cleared  → /accelerator/next      VSL, then a calendar
//        └─ did not  → /accelerator/sending   "it is on its way"
//
// THE PDF IS EMAILED, NOT DOWNLOADED, AND THE DELAY IS THE POINT. A GHL
// workflow waits about ten minutes and sends it as an attachment, the same
// mechanism the paid flow uses (see lib/advisory-purchase.ts). Handing over
// the file immediately would empty the page; the wait is what keeps a
// qualified firm watching the VSL. Do not add an on-page download here.
// ---------------------------------------------------------------------------
import { ADVISORY_VSL_VIDEO_PLAYBACK_ID } from './advisory-config';

// ── Paths ─────────────────────────────────────────────────────────────────
export const ACCELERATOR_PATH = '/accelerator';
export const ACCELERATOR_QUALIFY_PATH = '/accelerator/qualify';
/** Cleared the bar: the VSL and the calendar. */
export const ACCELERATOR_NEXT_PATH = '/accelerator/next';
/** Did not clear it: delivery confirmation and nothing else. */
export const ACCELERATOR_SENDING_PATH = '/accelerator/sending';

/** leads.form_source for anyone who comes through this funnel. */
export const ACCELERATOR_FORM_SOURCE = 'accelerator-qualifier';

// ── GoHighLevel tags ──────────────────────────────────────────────────────

/**
 * Every lead from this funnel, qualified or not.
 *
 * The only thing that distinguishes the two funnels once a lead is in GHL.
 * A qualified Accelerator lead is deliberately given the SAME path tag as a
 * qualified advisory lead ('agency pitch') so that every booking and
 * reminder workflow already built applies to them untouched — which means
 * nothing else tells them apart. This tag does.
 */
export const TAG_ACCELERATOR_LEAD = 'accelerator lead';

/**
 * Did not clear the bar, and has been given the guide free.
 *
 * Replaces 'advisory not a fit' on this funnel's unqualified branch, via
 * pathTagOverride in the qualify route. That tag drives the sequence that
 * sells the $97 Accelerator, and selling it to someone who was handed it
 * ten minutes ago is worse than not writing to them at all.
 */
export const TAG_ACCELERATOR_FREE = 'accelerator free lead';

// ── The VSL on /accelerator/next ──────────────────────────────────────────

/**
 * PLACEHOLDER. Currently the advisory VSL.
 *
 * /accelerator/next is a different pitch — "you have the guide, and you can
 * do this yourself; here is what it looks like when we do it for you" —
 * spoken to someone who has not been shown a price. The advisory cut opens
 * on a different premise. Swap this the moment Marcel supplies a playback
 * id; it is the one thing on that page written for the wrong audience.
 *
 * PLAYBACK id, not the asset id: https://stream.mux.com/<id>.m3u8 returns
 * 200 for a playback id and 400 for an asset id.
 */
export const ACCELERATOR_VSL_VIDEO_PLAYBACK_ID = ADVISORY_VSL_VIDEO_PLAYBACK_ID;
export const ACCELERATOR_VSL_VIDEO_TITLE = 'Accelerator — Done For You';

/**
 * Roughly how long the GHL workflow waits before emailing the PDF.
 *
 * Copy only — the actual wait is a step in the workflow and this constant
 * cannot enforce it. It exists so the two pages quote the same number, and
 * so that changing the workflow's wait has one obvious place to follow up.
 * Deliberately vague in the copy ("about ten minutes") because an exact
 * promise we do not control is a complaint waiting to happen.
 */
export const ACCELERATOR_DELIVERY_MINUTES = 10;

/**
 * And the wait for a firm that did NOT clear the bar.
 *
 * Shorter on purpose. The ten-minute hold above earns its keep because
 * /accelerator/next has a VSL to watch; /accelerator/sending has nothing
 * on it at all, so the same delay would be dead air that generates a
 * support email and no benefit.
 *
 * This means the GHL delivery workflow has to branch — qualified waits
 * ten minutes, unqualified sends almost immediately. One if/else on the
 * 'accelerator free lead' tag.
 */
export const ACCELERATOR_SENDING_MINUTES = 2;
