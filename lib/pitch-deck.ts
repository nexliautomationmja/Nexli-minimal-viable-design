// ---------------------------------------------------------------------------
// The Agency Pitch Deck (/pitch): what it says, in one place. The slides in
// components/pitch only draw this.
//
// WHAT THE DECK IS (Marcel, 2026-11-19). The deck Marcel screen-shares on a
// sales call to walk a CPA firm through exactly what Nexli builds and runs,
// in the order a tax-planning client meets it: the ad, the AI avatar, the
// VSL, the qualifier, the calendar, the follow-up, and how the creative is
// made. Not "we run ads and you pay us". No call to action anywhere: he is
// already on the call. One slide carries the money (see "The money slide"
// below); the full model stays on /math.
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
//   - FIRMS DO NOT CHOOSE THEIR AVATAR; Nexli casts it (Marcel, 2026-11-19),
//     because who is in an ad changes who Meta delivers it to (AVATAR_STUDY);
//   - one avatar, one firm, while the firm is a client; that is not market
//     or territory exclusivity, and the firm does not sign off every ad;
//   - the build is about 21 days; new creative every 7 to 14 days;
//   - an engagement is worth $15,000 to $55,000; $15,000 is the floor;
//   - the firm owns what is built except the ad creative, which Nexli keeps.
// ---------------------------------------------------------------------------

import { AI_AVATARS, type AiAvatar } from '@/lib/ai-avatars';
import { AD_CREATIVES, type AdCreative } from '@/lib/ad-creatives';
import {
  AGENCY_ENGAGEMENT_HIGH,
  AGENCY_ENGAGEMENT_LOW,
  AGENCY_LAUNCH_DAYS,
  AGENCY_PERFORMANCE_RATE,
  AGENCY_RETAINER_MONTHLY,
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

export const PITCH_VALUE_LINE = `each one a tax-planning client worth ${usd(AGENCY_ENGAGEMENT_LOW)} to ${usd(AGENCY_ENGAGEMENT_HIGH)} an engagement`;
export const PITCH_BUILD_DAYS = AGENCY_LAUNCH_DAYS;

/** The six pieces, in the order the prospect meets them. `slide` is the
 *  slide each one is explained on. */
export const PITCH_STEPS = [
  { key: 'ad', slide: 'ad', label: 'The ad', line: 'Meta reads what the ad says and shows it to the people most likely to respond.' },
  { key: 'avatar', slide: 'avatar', label: 'Your avatar', line: 'An AI presenter, cast for the clients you want, fronts every ad.' },
  { key: 'vsl', slide: 'vsl', label: 'The VSL', line: 'The same face explains tax planning before anyone books.' },
  { key: 'qualifier', slide: 'qualifier', label: 'The qualifier', line: 'A few questions keep the wrong people off your calendar.' },
  { key: 'calendar', slide: 'calendar', label: 'Your calendar', line: 'The right people book a tax-planning review, straight onto it.' },
  { key: 'follow-up', slide: 'follow-up', label: 'Follow-up', line: 'Texts and emails that get them to the call, and frame you as the fix.' },
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
 * Why the firm does not pick (Marcel, 2026-11-19). Said on the page neutrally
 * and with its source. Marcel makes the point in his own words on the call;
 * the page does not put a number or a race example on it.
 */
export const AVATAR_STUDY = {
  finding:
    'Researchers at Northeastern University, USC and Upturn ran Facebook ads with identical targeting and changed only the picture, headline and text. That alone changed who the ads were delivered to, by gender and by race.',
  cite: 'Ali, Sapiezynski, Bogen, Korolova, Mislove and Rieke, “Discrimination through Optimization: How Facebook’s Ad Delivery Can Lead to Skewed Outcomes,” 2019.',
  href: 'https://arxiv.org/abs/1904.02095',
};

// ── The money slide (Marcel, 2026-11-19) ─────────────────────────────────
// "Since the pricing is all up front and transparent": the most valuable
// part of See the Math on one slide (what the system can bring in, by pace,
// against what it costs) and, unlike the VSL and Candor, the 10% spelled
// out. This deck is presented on the call, which is where Marcel wants the
// 10% explained. The numbers come from lib/see-the-math and
// lib/agency-offer, so this slide and /math cannot disagree.

/** The month's agreed, attributable net revenue above which 10% beats the
 *  $10,000 minimum: $100,000. Below it, the minimum is the whole fee. */
export const PERFORMANCE_THRESHOLD = AGENCY_RETAINER_MONTHLY / AGENCY_PERFORMANCE_RATE;

// ── The ads ──────────────────────────────────────────────────────────────

const creative = (id: string): AdCreative => {
  const c = AD_CREATIVES.find((a) => a.id === id);
  if (!c) throw new Error(`lib/pitch-deck: no ad creative "${id}"`);
  return c;
};

/** The ad in the "the ad does the targeting" mock. */
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
  { title: 'Test and refresh', body: 'The angles that book calls get the budget, and new creative goes in every 7 to 14 days.' },
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
    body: `Hi ${PITCH_FIRM.prospect}, you’re booked with ${DEMO_FIRM_NAME} for Thursday at 2:00 PM. On the call we’ll look at where you’re overpaying the IRS and what a plan for this year could keep. Reply CONFIRM to hold your time.`,
  },
  {
    when: 'The next day',
    channel: 'Email',
    title: 'What to bring',
    body: 'Last year’s return and a rough idea of this year’s income. That is all we need to show you what you’re leaving on the table.',
  },
  {
    when: '24 hours before',
    channel: 'Text + email',
    title: 'Tomorrow at 2:00 PM',
    body: 'Your tax planning review is tomorrow. The moves that lower this year’s bill have to happen before the year closes, which is why we start now.',
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
