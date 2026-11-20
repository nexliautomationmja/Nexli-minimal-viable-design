// ---------------------------------------------------------------------------
// The Agency Pitch Deck (/pitch): what it says, in one place. The slides in
// components/pitch only draw this.
//
// WHAT THE DECK IS (Marcel, 2026-11-19). The deck Marcel screen-shares on a
// sales call to walk a CPA firm through exactly what Nexli builds and runs,
// in the order a tax-planning client meets it: the ad, the AI avatar, the
// VSL, the qualifier, the calendar, the follow-up, and how the creative is
// made. Not "we run ads and you pay us". No button or booking link anywhere:
// he is already on the call. The last slide is the decision ("Confirm fit.
// Agree the plan. Start the build."), asked as questions, not a button.
// The pricing and the money slides carry the numbers; the full model stays
// on /math.
//
// THE 2026-11-20 BRIEF (Marcel approved it; "Nexli pitch deck — Claude Code
// implementation brief"). Same offer, said more carefully: the $10,000 is a
// credit against the 10%, the fee base is net, the $15,000–$55,000 is
// conditional on the firm's own offer, targeting and screening are described
// as what they are (creative and screening, not certainty), the economics are
// labelled as illustrations, and the deck shows what can be inspected rather
// than results it does not have.
//
// THE DEMO FIRM is Evergreen Tax & Advisory (lib/demo-config), the same
// fictional firm /booking-confirmed-b uses, so "your firm" has a face.
//
// EVERY EXAMPLE IS LABELLED AS ONE. The qualifier questions, the messages
// and the calendar are illustrations of what we set up with a firm, not a
// client's real funnel or results.
//
// RULES CARRIED OVER FROM THE REST OF THE SITE:
//   - every avatar is AI-generated and labelled so; never a real person;
//   - Nexli casts the avatar for the firm's brand and client profile
//     (Marcel, 2026-11-19); firms do not choose one, but the deck no longer
//     says "you don't pick one" (the brief). The study is a source note
//     that creative can affect delivery, not a promise about results;
//   - one avatar, one firm, while the firm is a client; that is not market
//     or territory exclusivity, and the firm does not sign off every ad;
//   - the build is ABOUT 21 days, an estimate that depends on access and
//     approvals; creative is reviewed and refreshed as needed, typically
//     every 7 to 14 days, depending on results and the agreed scope;
//   - a planning engagement MAY be worth $15,000 to $55,000, depending on the
//     firm's established offer, the client's fit and the scope. Never a value
//     per appointment, and never Nexli's achieved results (PITCH_VALUE_NOTE);
//   - booked, attended and qualified are different stages; a booking is
//     "screened", not "qualified";
//   - the firm owns what is built except the ad creative, which Nexli keeps.
// ---------------------------------------------------------------------------

import { AI_AVATARS, type AiAvatar } from '@/lib/ai-avatars';
import { AD_CREATIVES, type AdCreative } from '@/lib/ad-creatives';
import {
  AGENCY_ENGAGEMENT_HIGH,
  AGENCY_ENGAGEMENT_LOW,
  AGENCY_LAUNCH_DAYS,
  usd,
} from '@/lib/agency-offer';
import { DEMO_FIRM_NAME } from '@/lib/demo-config';

export const PITCH_FIRM = {
  name: DEMO_FIRM_NAME,
  initials: 'ET',
  domain: 'evergreentax.com',
  /** The fictional prospect in the examples. */
  prospect: 'Mike',
} as const;

/** The cover's conditional line (the brief): the range, and what it depends on. */
export const PITCH_VALUE_NOTE = `Potential planning engagement fees of ${usd(AGENCY_ENGAGEMENT_LOW)}–${usd(AGENCY_ENGAGEMENT_HIGH)} depend on your firm’s established offer, client fit, and scope. They are not a guaranteed value per appointment.`;
export const PITCH_BUILD_DAYS = AGENCY_LAUNCH_DAYS;

/** The six pieces, in the order the prospect meets them. `slide` is the
 *  slide each one is explained on. */
export const PITCH_STEPS = [
  { key: 'ad', slide: 'ad', label: 'The ad', line: 'Creative written for the clients you want, then tested on Meta.' },
  { key: 'avatar', slide: 'avatar', label: 'Your avatar', line: 'An AI presenter, cast for the clients you want, fronts every ad.' },
  { key: 'vsl', slide: 'vsl', label: 'The VSL', line: 'The same face explains tax planning before anyone books.' },
  { key: 'qualifier', slide: 'qualifier', label: 'The qualifier', line: 'A few screening questions, set with you, before anyone can book.' },
  { key: 'calendar', slide: 'calendar', label: 'Your calendar', line: 'Screened prospects book a tax-planning review, straight onto it.' },
  { key: 'follow-up', slide: 'follow-up', label: 'Follow-up', line: 'Texts and emails that remind them of the call and what it covers.' },
] as const;

export type PitchStepKey = (typeof PITCH_STEPS)[number]['key'];

// ── The avatars ──────────────────────────────────────────────────────────
// Not Daniela (Nexli's own, never offered) and not Jasmine (she fronts
// Nexli's own example ad and the demo VSL). Swap freely; order is the strip.
const FEATURED_AVATAR_SLUGS = ['olivia', 'sofia', 'yasmin', 'madeline', 'aniyah', 'eliana'];

export interface PitchAvatar {
  slug: string;
  name: string;
  playbackId: string;
  portrait: string;
}

export const PITCH_AVATARS: PitchAvatar[] = FEATURED_AVATAR_SLUGS.map((slug) => AI_AVATARS.find((a) => a.slug === slug))
  .filter((a): a is AiAvatar & { playbackId: string } => !!a?.playbackId)
  .map((a) => ({ slug: a.slug, name: a.name, playbackId: a.playbackId, portrait: `/ai-avatars/${a.slug}/portrait.webp` }));

/** The face of the demo firm's ads, VSL and booking page. */
export const PITCH_FACE: PitchAvatar = PITCH_AVATARS[0];

/**
 * The source for "creative can affect delivery" (Marcel, 2026-11-19). Since
 * the brief (2026-11-20) a short source note, not a sales argument: it shows
 * an ad's content can change who sees it, not that any face brings
 * high-value clients. Marcel makes the point in his own words on the call.
 */
export const AVATAR_STUDY = {
  finding:
    'Research note: with identical targeting, changing only an ad’s image and text changed who Facebook delivered it to.',
  cite: 'Ali, Sapiezynski, Bogen, Korolova, Mislove and Rieke, “Discrimination through Optimization: How Facebook’s Ad Delivery Can Lead to Skewed Outcomes,” 2019.',
  href: 'https://arxiv.org/abs/1904.02095',
};

// ── The money slide (Marcel, 2026-11-19) ─────────────────────────────────
// "Since the pricing is all up front and transparent": the most valuable
// part of See the Math on one slide (what the system can bring in, by pace,
// against what it costs) and the 10% explained the same plain way as the
// VSLs (components/booking/PerformancePayExplainer). The numbers come from
// lib/see-the-math and lib/agency-offer, so this slide, the VSLs and /math
// cannot disagree.

/** $100,000: lives in lib/agency-offer now, re-exported for the slides. */
export { PERFORMANCE_THRESHOLD } from '@/lib/agency-offer';

// ── The ads ──────────────────────────────────────────────────────────────

const creative = (id: string): AdCreative => {
  const c = AD_CREATIVES.find((a) => a.id === id);
  if (!c) throw new Error(`lib/pitch-deck: no ad creative "${id}"`);
  return c;
};

/** The ad in the ad slide's mock. */
export const PITCH_AD = creative('overpaid');

/** The hooks on the ICP slide, each with what it does. */
export const PITCH_HOOKS: { ad: AdCreative; tags: string[] }[] = [
  { ad: creative('overpaid'), tags: ['Names the pain', 'Speaks to high earners'] },
  { ad: creative('thanksgiving'), tags: ['A story they have lived', 'Points at the deadline'] },
  { ad: creative('tier-list'), tags: ['Names who it’s for', 'Promises a payoff'] },
];

/** Video creatives for the "how we make it" strip. */
export const PITCH_CREATIVES: AdCreative[] = AD_CREATIVES.filter((a) => a.format === 'video' && a.muxPlaybackId).slice(0, 3);

export const CREATIVE_PIPELINE = [
  { title: 'Angle and script', body: 'Written for your ideal client: the pain, who it is for and one next step.' },
  { title: 'Your avatar performs it', body: 'Your AI avatar delivers the script. Nobody at your firm gets on camera.' },
  { title: 'The edit', body: 'Captions, motion graphics and sound, built for a feed people scroll with the sound off.' },
  { title: 'Versions', body: 'Several hooks of every angle, cut as 9:16 reels and square feed posts.' },
  { title: 'Review and refresh', body: 'We review performance and refresh concepts as needed, typically every 7–14 days depending on results and the agreed delivery scope.' },
];

// ── The qualifier (an example; the real one is set with each firm) ──────

export interface QualifierOption {
  label: string;
  fit: boolean;
}

export const EXAMPLE_QUALIFIER: { question: string; options: QualifierOption[] }[] = [
  {
    question: 'Which describes you best?',
    options: [
      { label: 'I own a business', fit: true },
      { label: 'High-income employee', fit: true },
      { label: 'Neither', fit: false },
    ],
  },
  {
    question: 'Roughly what did you pay in federal income tax last year?',
    options: [
      { label: 'Under $25,000', fit: false },
      { label: '$25,000 to $100,000', fit: true },
      { label: '$100,000 to $250,000', fit: true },
      { label: 'Over $250,000', fit: true },
    ],
  },
  {
    question: 'Has anyone ever built you a proactive tax plan?',
    options: [
      { label: 'No, my preparer just files', fit: true },
      { label: 'Once, a while ago', fit: true },
      { label: 'Yes, every year', fit: false },
    ],
  },
  {
    question: 'Are you based in the United States?',
    options: [
      { label: 'Yes', fit: true },
      { label: 'No', fit: false },
    ],
  },
];

// ── The calendar (an example week) ───────────────────────────────────────

export const EXAMPLE_BOOKINGS = [
  { day: 1, start: 10, who: 'Mike R.', what: 'Owner, landscaping company' },
  { day: 2, start: 13, who: 'Priya S.', what: 'Physician, high-income' },
  { day: 3, start: 9, who: 'Tom & Ana L.', what: 'Own two restaurants' },
  { day: 3, start: 14, who: 'Jordan K.', what: 'Owner, HVAC company' },
  { day: 4, start: 11, who: 'Renee W.', what: 'Owner, dental practice' },
];

// ── The follow-up (example messages from the demo firm) ─────────────────

export interface FollowUpStep {
  when: string;
  channel: 'Text' | 'Email' | 'Text + email';
  title: string;
  body: string;
}

export const FOLLOW_UP: FollowUpStep[] = [
  {
    when: 'Right after booking',
    channel: 'Text + email',
    title: 'You’re booked',
    body: `Hi ${PITCH_FIRM.prospect}, you’re booked with ${DEMO_FIRM_NAME} for Thursday at 2:00 PM. On the call we’ll look at your situation and whether a plan for this year could help. Reply CONFIRM to hold your time.`,
  },
  {
    when: 'The next day',
    channel: 'Email',
    title: 'What to bring',
    body: 'Last year’s return and a rough idea of this year’s income. That gives your advisor a starting point for assessing whether proactive planning could help.',
  },
  {
    when: '24 hours before',
    channel: 'Text + email',
    title: 'Tomorrow at 2:00 PM',
    body: 'Your tax planning review is tomorrow. Many planning moves have to happen before the year closes, which is why we start now.',
  },
  {
    when: '1 hour before',
    channel: 'Text',
    title: 'On in an hour',
    body: `We’re on in an hour, ${PITCH_FIRM.prospect}. Your link: ${PITCH_FIRM.domain}/call`,
  },
  {
    when: 'If they miss it',
    channel: 'Text',
    title: 'Pick a new time',
    body: `Missed you today, ${PITCH_FIRM.prospect}. This year’s bill doesn’t change itself. Grab a new time: ${PITCH_FIRM.domain}/book`,
  },
];

// ── What can be inspected before launch (the brief, 2026-11-20) ─────────
// The honest credibility bridge: no case study, no results, no
// testimonials. What a firm can see for itself, each labelled for what it
// is, with the slide it is on.

export const INSPECT_ITEMS: { slide: string; title: string; body: string; kind: 'Sample work' | 'Demonstrated functionality' }[] = [
  { slide: 'creative', title: 'Ad creative', body: 'Videos and ad copy we have made, playable in this deck.', kind: 'Sample work' },
  { slide: 'avatar', title: 'Avatar casting', body: 'The AI presenters we cast from, each labelled AI-generated.', kind: 'Sample work' },
  { slide: 'qualifier', title: 'The funnel and qualifier', body: 'Answer the screening questions yourself and see both outcomes.', kind: 'Demonstrated functionality' },
  { slide: 'calendar', title: 'Booking', body: 'How a booking lands on your calendar with the prospect’s answers attached.', kind: 'Demonstrated functionality' },
  { slide: 'follow-up', title: 'Follow-up', body: 'The texts and emails a booked prospect receives, in order.', kind: 'Sample work' },
];

// ── Firm fit and the decision (the brief, 2026-11-20) ────────────────────
// Fit criteria for the FIRM, not a claim that every $1M–$5M firm can afford
// it. Said on the closing slide, as what to confirm before deciding.

export const FIRM_FIT = [
  'An existing proactive tax-planning service',
  'A fee structure that supports planning engagements',
  'Someone responsible for selling on the calls',
  'Capacity to deliver the work it brings',
  'Budget for the agency fee and the advertising',
];

/** Booked, attended and qualified are different stages (the brief). */
export const EVALUATION_STAGES = ['Booked', 'Attended', 'Qualified', 'Paid engagement', 'Attributable net revenue'];
