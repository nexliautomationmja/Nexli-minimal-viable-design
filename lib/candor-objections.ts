// ---------------------------------------------------------------------------
// The six objections, and the recorded answers that go with them.
//
// One list, because the chips, the follow-up row and the video lookup all
// have to agree. They were an inline array in candor-client until a video
// needed attaching to them.
//
// THE LABEL IS IN THEIR VOICE, THE PROMPT IS IN OURS. "Referrals work fine
// for me" is what a firm owner thinks; it is also a thin thing to send to a
// model, which answers a fuller question better. So the chip shows `label`
// and sends `prompt`. Keep the label short enough to read at a glance on a
// 390px screen — these wrap to five rows there already.
//
// ── Adding a video ─────────────────────────────────────────────────────────
//
// Paste the PLAYBACK id into `muxPlaybackId` and the chip grows a play badge,
// the answer grows a player above the written reply, and nothing else has to
// change. An empty string is the correct value for "not recorded yet": the
// chip renders plain and the answer is text only, which is the same graceful
// path lib/demo-config and lib/foundation-config use for pending uploads.
//
// VERIFY THE ID FIRST. https://stream.mux.com/<id>.m3u8 and
// https://image.mux.com/<id>/thumbnail.jpg both return 200 for a playback id
// and 400 for an asset id — the two are easy to confuse and the failure is
// silent, because mux-player sets playbackId as a DOM property on hydration
// and it never appears in the server HTML. Check it in a browser.
//
// ALWAYS SET posterTime. Given no time, Mux serves a frame from the MIDDLE of
// the asset, which on a captioned cut means the poster is a half-finished
// sentence.
//
// WHAT TO RECORD. Short — 40 to 70 seconds. The written answer underneath
// carries the detail, so the clip only has to do the part writing cannot:
// concede the objection out loud, in her face, before arguing with it.
//
// DO NOT put a day count, a date or a price in a clip. A recording cannot be
// re-cut when the number moves, and the written answer beneath it already
// states those live — the January answer computes the real days remaining
// every time it is asked.
// ---------------------------------------------------------------------------

export interface CandorObjection {
  /** Stable key. Used for React keys and the asked/unasked set. */
  id: string;
  /** What the chip says, in the firm owner's voice. */
  label: string;
  /** What is actually sent to the model. */
  prompt: string;
  /** PLAYBACK id, not asset id. Empty until the clip is recorded. */
  muxPlaybackId: string;
  /** Seconds into the asset for the poster frame. */
  posterTime: number;
  /** Runtime, shown on the chip. Only used when a video exists. */
  duration?: string;
  /**
   * How a TYPED question is recognised as this objection.
   *
   * `strong` scores 2, `weak` scores 1, and an objection needs 2 to win —
   * so one unambiguous phrase is enough, but a vague word like "myself"
   * needs corroboration. Highest score wins; ties go to the earlier entry.
   * This is deliberately keyword matching and not a second model call: it
   * has to resolve before the first token streams, it must never cost a
   * request, and the vocabulary here is narrow enough that patterns beat
   * a classifier that can hallucinate a match.
   */
  match: { strong: RegExp[]; weak?: RegExp[] };
}

export const CANDOR_OBJECTIONS: CandorObjection[] = [
  {
    id: 'burned',
    label: "I've been burned by an agency before",
    prompt:
      "I've hired a marketing agency before and it didn't work. Why would this be any different?",
    muxPlaybackId: '4ewtyW6GJxQKIyTxJoYn95Jon01zdKjXoTpicc8KONAo',
    posterTime: 0,
    duration: '0:21',
    match: {
      strong: [
        /\bburn(ed|t)\b/i,
        /\b(agency|agencies|marketing (company|firm)|lead ?gen)\b.*\b(before|already|last|previous|tried|failed|wasted|didn'?t|did not)\b/i,
        /\b(before|already|last|previous|tried|failed|wasted|didn'?t|did not)\b.*\b(agency|agencies|marketing (company|firm)|lead ?gen)\b/i,
        /\b(ripped off|scammed|took my money)\b/i,
      ],
      weak: [/\bagenc(y|ies)\b/i, /\bwasted\b/i, /\bdidn'?t work\b/i, /\bburned\b/i],
    },
  },
  {
    id: 'referrals',
    label: 'Referrals work fine for me',
    prompt:
      'Most of my work comes from referrals and word of mouth, and that has worked well. Why would I pay for ads?',
    muxPlaybackId: 'j25WY00cQn5G2q9wYOqn7cPPNFYc1WON6AfBl1LSbAaA',
    posterTime: 0,
    duration: '0:26',
    match: {
      strong: [/\breferr?als?\b/i, /\bword[- ]of[- ]mouth\b/i],
      weak: [/\breferred\b/i, /\bword of mouth\b/i, /\brepeat clients\b/i],
    },
  },
  {
    id: 'january',
    label: "The year's almost over — why not January?",
    prompt:
      "The year is nearly over. Wouldn't it make more sense to start this in January?",
    muxPlaybackId: '2wrhRavPqtb4RHbFpU01601wXuU00FQMR53dwgQv5mC8NQ',
    posterTime: 0,
    duration: '0:27',
    match: {
      strong: [
        /\bjanuary\b/i,
        /\bnew year\b/i,
        /\bnext year\b/i,
        /\byear is (almost |nearly )?(over|done|up)\b/i,
        /\bafter (the )?(holidays|tax season|busy season)\b/i,
        /\b(wait|hold off|start) (un)?til\b/i,
        /\bq1\b/i,
      ],
      weak: [/\bend of (the )?year\b/i, /\btiming\b/i, /\bwait\b/i],
    },
  },
  {
    id: 'diy',
    label: "Can't I just do this myself?",
    prompt:
      'Could I not just run the ads myself, or have someone in the office do it, instead of paying an agency?',
    muxPlaybackId: '019yVj3PfnGhOcrHey7OGV5yhSHekTgvbaz1Mb1KVQkg',
    posterTime: 0,
    duration: '0:21',
    match: {
      strong: [
        /\b(do|run|handle|manage|build|learn) (it|this|that|them|the ads?)?\s*(my ?self|ourselves|in[- ]house)\b/i,
        /\bin[- ]house\b/i,
        /\bon my own\b/i,
        /\b(my|our) (assistant|office manager|marketing person|nephew|team) (could|can|would)\b/i,
        /\bhire (someone|a person|an? \w+) instead\b/i,
      ],
      weak: [/\bmy ?self\b/i, /\bourselves\b/i, /\bdiy\b/i],
    },
  },
  {
    id: 'capacity',
    label: "What if it works and I can't handle the volume?",
    prompt:
      'My worry is the opposite of most people. What happens if this works and my firm cannot service the clients it brings in?',
    muxPlaybackId: 'sRW3hdzfQLeu36YAhzZAkFYrZg502ldDv73HCp02nthDA',
    posterTime: 0,
    duration: '0:20',
    match: {
      strong: [
        /\bcapacity\b/i,
        /\bhandle (the |that |this )?(volume|many|much|load|demand)\b/i,
        /\bcan'?t (service|serve|keep up|take on|handle)\b/i,
        // "more LEADS than I can service" — the noun sits between, which
        // is how people actually phrase it.
        /\bthan (i|we) can\b/i,
        /\b(too many|more \w+ than)\b/i,
        /\boverwhelm\w*\b/i,
      ],
      weak: [/\bbandwidth\b/i, /\bswamped\b/i, /\bstaff(ing)?\b/i, /\bvolume\b/i],
    },
  },
];

/**
 * Which objection a question belongs to, if any.
 *
 * A chip click already knows its objection; this is for everything TYPED.
 * "I tried an agency last year and it was a disaster" has to reach the same
 * clip as the chip does, or the videos only ever play for people who took
 * the shortcut.
 *
 * Returns undefined for anything that is just a question — most of what
 * gets typed is, and those get a written answer with no video, which is
 * correct. A wrong video is worse than no video: it tells a firm owner you
 * were not listening.
 */
export function matchObjection(text: string): CandorObjection | undefined {
  const q = text.trim();
  if (q.length < 3) return undefined;

  // An exact chip prompt always wins, before any scoring.
  const exact = CANDOR_OBJECTIONS.find((o) => o.prompt === q);
  if (exact) return exact;

  let best: CandorObjection | undefined;
  let bestScore = 0;
  for (const o of CANDOR_OBJECTIONS) {
    let score = 0;
    for (const re of o.match.strong) if (re.test(q)) score += 2;
    for (const re of o.match.weak ?? []) if (re.test(q)) score += 1;
    if (score > bestScore) {
      bestScore = score;
      best = o;
    }
  }
  return bestScore >= 2 ? best : undefined;
}

export function hasVideo(o: CandorObjection): boolean {
  return o.muxPlaybackId.trim().length > 0;
}
