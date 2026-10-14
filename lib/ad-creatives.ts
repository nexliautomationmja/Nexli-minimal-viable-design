// ---------------------------------------------------------------------------
// The ad creative library shown on /booking-confirmed-b.
//
// THIS IS THE FILE TO EDIT. Everything the panel renders comes from the array
// at the bottom; components/booking/AdCreativeLab.tsx only draws it.
//
// To add a real creative:
//   1. drop the file in public/ads/  (mp4 for video, jpg/png/webp for photo)
//   2. set `src: '/ads/<filename>'` on the entry
//   3. for video, add `poster: '/ads/<filename>.jpg'` if you have a still —
//      without one the first frame shows, which is usually fine
// An entry with no `src` renders a labelled placeholder slot, on purpose. It
// is better to show an obviously-empty frame than a broken image icon, and it
// means the section can ship before the creatives do.
//
// ⚠️  `leads`, `costPerLead` and `ctr` are ILLUSTRATIVE. They are not a client
// result and must never be presented as one. The panel labels them as example
// data on screen — if you change the copy, keep that label. Invented numbers
// shown to a CPA without a label read as a claim, and this page is attached
// to a $9,997/month offer.
//
// The vocabulary is deliberately lead-centric (leads, cost per lead) rather
// than impressions and CPM, matching components/demo/AdsDashboard.tsx:10-26.
// A firm owner does not buy impressions.
// ---------------------------------------------------------------------------

export type AdFormat = 'video' | 'photo';

/**
 * Where an angle is in its life. The mix matters more than any single card:
 * a grid where everything is winning does not look like testing, it looks
 * like a brochure.
 */
export type AdStatus = 'scaling' | 'testing' | 'paused';

export interface AdCreative {
  id: string;
  /** The micro-label above the card — what the angle actually is. */
  angle: string;
  format: AdFormat;
  status: AdStatus;
  /**
   * A Mux PLAYBACK id, for creatives that live in Mux rather than in
   * public/ads/. Takes precedence over `src`.
   *
   * Mux serves HLS, which a plain <video> tag only plays natively in
   * Safari — in Chrome it is a black box. So a creative with this set is
   * rendered with MuxPlayer instead. The alternative was enabling MP4
   * renditions per asset in Mux, which is a setting nobody would remember
   * to tick on the next upload.
   */
  muxPlaybackId?: string;
  /**
   * The creative's own shape, as a CSS aspect-ratio. Defaults to 9 / 16 —
   * a reel — because that is what gets made for Meta now.
   *
   * It is declared rather than measured: the card has to reserve the right
   * width before the video has loaded, or the blurred fill behind it pops
   * in a frame late.
   */
  aspectRatio?: string;
  /** `/ads/<file>`, for a creative uploaded to the repo. */
  src?: string;
  /** Poster frame for an `src` video. Mux posters come from the asset. */
  poster?: string;
  /** The hook, above the creative, the way Meta renders primary text. */
  primaryText: string;
  /** The link-card headline under the creative. */
  headline: string;
  /** Illustrative only. See the warning above. */
  leads: number;
  /** Illustrative only, in whole dollars. */
  costPerLead: number;
  /** Illustrative only, as a percentage. */
  ctr: number;
}

export const AD_STATUS_LABEL: Record<AdStatus, string> = {
  scaling: 'Scaling',
  testing: 'Testing',
  paused: 'Paused',
};

/**
 * Six angles — two scaling, three testing, one paused.
 *
 * That split is the whole argument of the section. We do not guess which
 * angle lands; we run several and let the spend decide. A firm that sees
 * one perfect ad assumes we got lucky. A firm that sees one paused assumes
 * we are paying attention.
 */
export const AD_CREATIVES: AdCreative[] = [
  {
    id: 'thanksgiving',
    angle: 'The call that came too late',
    format: 'video',
    status: 'scaling',
    // Jasmine. On screen: "HIS ACCOUNTANT WAITED UNTIL THANKSGIVING TO
    // MENTION A 7-FIGURE TAX BILL."
    muxPlaybackId: 'veGeNhjfo2R27qULn7SZROLHUXCRJfKGaBo3BZMIZjg',
    primaryText:
      'His accountant waited until Thanksgiving to mention a seven-figure tax bill. By then the year was written and there was nothing left to do but pay it.',
    headline: 'Find out what yours should have told you in June',
    leads: 23,
    costPerLead: 61,
    ctr: 2.4,
  },
  {
    id: 'overpaid',
    angle: 'You call it normal',
    format: 'video',
    status: 'scaling',
    // On screen: "HANDING HALF YOUR MONEY TO THE IRS??" into "You earn it,
    // they take it, you call it normal", closing on the Evergreen card.
    muxPlaybackId: '9LUzNLFAGwiPLHSxHG01fxAL1c2eWhvvSwTfKRCcxrvQ',
    primaryText:
      'You earn it. They take it. You call it normal. Handing half of it to the IRS every April is a habit, not a law.',
    headline: 'See how much of it you get to keep',
    leads: 19,
    costPerLead: 68,
    ctr: 2.1,
  },
  {
    id: 'not-normal',
    angle: 'Not normal, just unplanned',
    format: 'photo',
    status: 'testing',
    // On the creative: "Six and seven figures in tax is not normal."
    src: '/ads/not-normal.webp',
    primaryText:
      'Six and seven figures a year in tax is not a bracket you got put in. It is what an unplanned return costs, and nobody ever showed you the alternative.',
    headline: 'See what the alternative looks like',
    leads: 11,
    costPerLead: 94,
    ctr: 1.5,
  },
  {
    id: 'tier-list',
    angle: 'Tax strategies, ranked',
    format: 'video',
    status: 'testing',
    // On screen: "TAX STRATEGIES THAT ACTUALLY SAVE YOU 6-7 FIGURES", run
    // as an S-to-D tier board. Writing off a vacation and buying a G-Wagon
    // both land in D.
    muxPlaybackId: 'qKaWF2PzcIcWr1hvn9ynJ5zi6S42lLDbiYFdWRbETTI',
    primaryText:
      'Writing off a vacation: D-tier. Buying a G-Wagon: D-tier. Here is what actually moves six and seven figures off a business owner’s tax bill.',
    headline: 'See which strategies actually rank',
    leads: 14,
    costPerLead: 77,
    ctr: 1.9,
  },
  {
    id: 'before-year-close',
    angle: 'Before the year closes',
    format: 'photo',
    status: 'testing',
    // On the creative: "Your CPA called the week of Thanksgiving. The
    // number was $2.1 million." Same argument as the Jasmine video, run as
    // a static — which is the point of testing one angle in two formats.
    src: '/ads/thanksgiving-number.webp',
    primaryText:
      'Your CPA called the week of Thanksgiving with a $2.1 million number. By then nothing could be changed. Every decision that moves it happens before the year closes.',
    headline: 'Move the number while you still can',
    leads: 8,
    costPerLead: 118,
    ctr: 1.2,
  },
  {
    id: 'compounding',
    angle: 'What the tax really costs',
    format: 'photo',
    status: 'paused',
    // On the creative: $1 doubled 20 times, tax-free against taxed at 25%
    // each gain — $1,048,576 against $72,570. It carries its own
    // "hypothetical illustration" disclaimer, which is why the figures
    // below stay vague and do not restate it as a result.
    src: '/ads/compounding.webp',
    primaryText:
      'A dollar doubled twenty times is worth over a million. Tax each gain at 25% along the way and the same dollar ends at $72,570. The tax is not the bill, it is everything the bill never got to earn.',
    headline: 'Learn how to save six to seven figures in taxes',
    leads: 3,
    costPerLead: 203,
    ctr: 0.7,
  },
];
