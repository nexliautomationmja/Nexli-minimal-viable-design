// ---------------------------------------------------------------------------
// Demo funnel — /demo-opt-in → /demo → /demo/qualify → /demo/call | /demo/offer
//
// Page 1 captures the lead and fires Meta `Lead`. Page 2 is the interactive
// sandbox plus the bridge video. Page 3 is the existing six qualification
// questions. Qualified firms are pitched the agency on a call; everyone else
// is pitched the website + portal, self-serve.
// ---------------------------------------------------------------------------

import { evergreenFirm, EVERGREEN_LOGO_ON_LIGHT } from '@/data/firm-sites/evergreen';

export const DEMO_OPT_IN_PATH = '/demo-opt-in';
export const DEMO_PATH = '/demo';
export const DEMO_QUALIFY_PATH = '/demo/qualify';
export const DEMO_CALL_PATH = '/demo/call';
export const DEMO_OFFER_PATH = '/demo/offer';
export const DEMO_THANK_YOU_PATH = '/demo/thank-you';

/**
 * Where a booked growth call lands. Shared with the VSL funnel rather than
 * demo-specific: welcome video, the Rainmaker walkthrough and the intel form
 * are the same prep either way. Optional ?name= and ?email=: the email seeds
 * the "send me a copy" field, the name rides along on the intel submission.
 */
export const BOOKING_CONFIRMED_PATH = '/booking-confirmed';

/** leads.form_source for anyone who opts in to the demo. */
export const DEMO_FORM_SOURCE = 'demo-optin';

// ── Tags pushed to GoHighLevel ────────────────────────────────────────────
/** Everyone who opts in. Marks them as a lead in the CRM. */
export const TAG_DEMO_OPT_IN = 'demo opt-in';
/** Qualified: pitched the $5,000/mo agency engagement on a call. */
export const TAG_AGENCY_PITCH = 'agency pitch';
/** Not qualified: pitched the self-serve website + portal. */
export const TAG_WEB_PITCH = 'web pitch';
export const TAG_CALL_BOOKED = 'call booked';
export const TAG_FOUNDATION_CUSTOMER = 'foundation customer';

/** Which side of the split a lead landed on. Stored and sent to GHL. */
export type FunnelPath = 'agency' | 'web';

export const FUNNEL_PATH_TAG: Record<FunnelPath, string> = {
  agency: TAG_AGENCY_PITCH,
  web: TAG_WEB_PITCH,
};

// ── The fixed demo firm ───────────────────────────────────────────────────
/**
 * One invented CPA firm, shown identically to every visitor as both the
 * website preview and the portal sandbox. Also the internal starting template
 * for a real client build: copy data/firm-sites/evergreen.ts.
 */
export const DEMO_FIRM_SLUG = 'evergreen';
export const DEMO_FIRM_NAME = 'Evergreen Tax & Advisory';
export const DEMO_FIRM_OWNER = 'Dana Whitfield';
/**
 * Forest-leaning emerald, not the site's `#14532D`. `--pd-accent` is used as
 * *text* on the portal's dark card (`#0f1c16`), where `#14532D` is 2.4:1 and
 * unreadable. `#1F9D63` is 5.1:1 there and still reads unmistakably forest.
 */
export const DEMO_FIRM_ACCENT = '#1F9D63';
/** The site's gold, used only as the trailing edge of gradients. */
export const DEMO_FIRM_ACCENT_2 = '#D4A24C';
/**
 * The firm lockup for the portal sidebar, picked per theme.
 *
 * The site only ever draws its logo on deep green, so one warm-white variant
 * does. The portal sidebar is #ffffff in light theme, where that variant is
 * invisible — hence the dark-ink build in data/firm-sites/evergreen.ts.
 */
export function demoFirmLogo(theme: 'light' | 'dark'): string {
  return theme === 'light' ? EVERGREEN_LOGO_ON_LIGHT : evergreenFirm.logo!.src;
}

/** Path to the rendered demo site, iframed by the sandbox. */
export const DEMO_FIRM_SITE_PATH = `/sites/${DEMO_FIRM_SLUG}`;

// ── Videos (Mux) ──────────────────────────────────────────────────────────
/**
 * Step 2's 5-minute bridge video ("The Revenue Gap").
 * TODO: upload to Mux and paste the playback id. Empty renders a placeholder.
 */
export const DEMO_BRIDGE_VIDEO_PLAYBACK_ID = '';
export const DEMO_BRIDGE_VIDEO_TITLE = 'The Revenue Gap';

/**
 * Step 4A's offer video, above the booking calendar.
 *
 * The same Mux asset the VSL offer page plays (passed inline at
 * app/vslfunnel-offer/vslfunnel-offer-client.tsx). Qualified visitors arriving
 * here came through those ads, so they get the pitch they already started.
 *
 * Keep the title matching the offer page's: Mux Data keys its analytics on
 * `video_title`, so two names would split one asset's numbers in half. The two
 * pages stay separable by their tracking session prefix instead
 * (`demo_offer` here, `vsl_` there).
 */
export const DEMO_OFFER_VIDEO_PLAYBACK_ID = 'PE95PF1vknWBf3wpNkiYJND35n4XyWcraisBDYv5OmY';
export const DEMO_OFFER_VIDEO_TITLE = 'Jasmine VSL - Tax Planning Clients';

// ── Booking (qualified path) ──────────────────────────────────────────────
/** TODO: a dedicated "Advisory Engine Growth Call" event type in Cal.com. */
export const DEMO_CAL_LINK = 'nexli-automation-6fgn8j/nexli-demo';
export const DEMO_CAL_NAMESPACE = 'demo-growth-call';

// ── Copy shared across the funnel ─────────────────────────────────────────
/**
 * The opt-in promise. Result-adjacent on purpose: it names the outcome the
 * visitor is walking toward, but what they actually get for an email is the
 * demo — promising leads here would be a bait-and-switch and would set the
 * qualifier up to disappoint.
 */
export const DEMO_HEADLINE = 'See what a $15,000 advisory client sees before they pay you';
/**
 * The closing headline on /demo. Deliberately NOT another $800-vs-$15,000
 * contrast — the hero block already makes that argument, and repeating it at
 * the foot of the page weakens both. This one closes on the guarantee instead.
 */
export const DEMO_BRIDGE_CTA = '50 qualified leads in your first 90 days, or we keep working free';
