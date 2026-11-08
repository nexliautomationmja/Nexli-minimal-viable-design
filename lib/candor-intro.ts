// ---------------------------------------------------------------------------
// Daniela's intro — the story on her photo at the top of /candor.
//
// One 2:25 clip doing three jobs:
//   1. THE STORY. Tap her photo and it plays full screen, Instagram-style.
//      See components/candor/DanielaStory.
//   2. THE LIBRARY. It is cut into CHAPTERS below, each matched like an
//      objection in lib/candor-objections. Type "do I have to be on camera?"
//      and the answer opens with the clip, started at the part where she
//      says you don't. A typed concern gets the 20 seconds that answer it,
//      not a 2½-minute video from the top.
//   3. THE CORPUS. The transcript goes into lib/candor-corpus, so Candor's
//      written answers agree with what she says on camera.
//
// THE TRANSCRIPT WAS READ OFF THE BURNED-IN CAPTIONS, frame by frame — Mux
// has no text track for this asset. Re-record or re-cut the clip and this
// has to be redone, or Candor answers from a script the video no longer
// says. The chapter times are where each section's first word is
// highlighted in those captions.
//
// THE CHAPTERS HAVE NO CHIPS, deliberately. The chips are objections in the
// firm owner's voice; "how does the system work" is not an objection, and the
// story already puts the whole clip one tap from the top of the page. These
// are reached by typing, and only by typing.
// ---------------------------------------------------------------------------

import type { CandorClip } from '@/lib/candor-objections';

export const INTRO_PLAYBACK_ID = 'yKhVSrcQogAB183FFfNDnKejOjmp00KtidbA6LvdmhuA';

/** Shown on the story badge. The asset is 144.8s. */
export const INTRO_DURATION = '2:25';

/**
 * Keyed on the playback id, so a new clip lights every visitor's ring again:
 * a story they have "seen" is the old one.
 */
export const INTRO_SEEN_KEY = `nexli:candor:story-seen:${INTRO_PLAYBACK_ID}`;

/** Her words, as she says them. Paragraphs follow the chapters below. */
export const INTRO_TRANSCRIPT = `Here's something most CPA firm owners don't expect: going from 1 million to 10 million is often easier than going from zero to 1 million. If your firm has flatlined year over year, it's rarely a talent problem. It's usually a system problem. So let me walk you through the system we build to 10x a firm.

It starts with tax planning, used as your acquisition strategy, not just another service on the menu. A tax planning client is worth far more than a returns client, and they usually stay for bookkeeping and payroll too. Tax planning is what stops you from looking like a commodity. You're the firm legally keeping their money from the IRS.

Next, we build you a funnel with a qualifier that keeps low-leverage clients away. Owners who aren't your ideal client get weeded out before they ever reach your calendar. And we fill that funnel with ads using AI-generated creative.

Here's why that matters. If you've hired an agency before, you know the drill: scripts, filming days, recording video after video while running your firm. With AI-generated creative, you don't have to get on camera. You don't have to become a YouTube or Instagram influencer.

Here's how Facebook works now. Meta's Andromeda update tends to favor advertisers who feed it lots of fresh creative, so we refresh your videos and photos, usually every 7 to 14 days depending on performance. And the creative does the targeting. The video, the photo and the copy underneath tell Meta who it's for. Meta's system scans all of that and puts it in front of the right owner, just like it put this video in front of you.

Now the math. A booked call typically runs $150 to $350 with winning creatives. $5,000 a month in ad spend works out to roughly 14 to 33 booked calls. Tax planning engagements usually land between $15,000 and $55,000. Say you close just 2 owners at $15,000. That's $30,000 from tax planning alone, and that's the bare minimum. But you're not bare minimum, because you wouldn't be here looking for more. Close 7 at the top of that range and it's $385,000. These are examples, not promises. And that's before bookkeeping and payroll, which you blend in on top of the planning.

Yes, it's a risk to get started. But just based off of those numbers, this is something that will keep you up at night. Of course nobody wants to hire an agency, I get it. But you yourself know the numbers. The numbers are inevitable, and this is your only route to scaling your business. Not with referrals, not with going door to door and just handing out your card.

Where do you want to be in the next 6 to 12 months? Do you only want to grow 1% year over year? You're better off investing in the S&P 500. What is it that's really holding you back from going all in?`;

/**
 * The clip, as five answers.
 *
 * Matched AFTER every recorded objection, so a question that is both — "I
 * got burned by an agency, how is this different?" — gets the objection's
 * own clip. Ties go to the objection for the same reason.
 *
 * The patterns are narrower than they could be, on the rule in
 * lib/candor-objections: a wrong video is worse than no video. In
 * particular nothing here matches "what if it doesn't work" or "is it
 * guaranteed". The risk chapter ends on "the numbers are inevitable", which
 * is the wrong thing to play to someone asking for a guarantee — the
 * written answer, which says plainly there isn't one, does that alone.
 *
 * posterTime is a frame whose caption reads like a title for the chapter,
 * since the poster is the first thing anyone sees of it.
 */
export const INTRO_CHAPTERS: CandorClip[] = [
  {
    id: 'intro-system',
    label: 'How the system works',
    muxPlaybackId: INTRO_PLAYBACK_ID,
    startTime: 0,
    posterTime: 0,
    match: {
      strong: [
        /\bhow (does|do|would|will|did) (this|it|that|the (whole )?(system|program|process|thing)|your (system|process)|nexli)( \w+)? work\b/i,
        /\bwalk me through\b/i,
        /\bwhat (exactly )?(do|does|will|would) (you|you guys|nexli|your team) (actually )?(do|build|provide|handle)\b/i,
        /\bwhat('s| is) (included|in the (system|package|offer))\b/i,
        /\bwhat do (i|we) (actually )?get\b/i,
        /\b(flatlined|plateau(ed)?|stalled|stuck at)\b/i,
      ],
      weak: [/\bsystem\b/i, /\bprocess\b/i, /\bfunnel\b/i, /\bqualifier\b/i, /\b10x\b/i, /\bgrow(th)?\b/i],
    },
  },
  {
    id: 'intro-creative',
    label: "You don't have to get on camera",
    muxPlaybackId: INTRO_PLAYBACK_ID,
    startTime: 42,
    posterTime: 44.5,
    match: {
      strong: [
        /\bon[- ]camera\b/i,
        /\b(film|filming|record|recording|shoot|shooting) (myself|me|videos?|content|ads?)\b/i,
        /\bai[- ](generated|made|created)\b/i,
        /\bai (ads?|videos?|creative|content|avatars?)\b/i,
        /\b(influencer|youtuber|tiktoker)\b/i,
        /\b(do|will|would) (i|we) (have|need) to (be|appear|show up) (in|on)\b/i,
        /\bwho (makes|creates|writes|films) (the )?(ads|videos|creative|content|scripts)\b/i,
      ],
      weak: [/\bcreatives?\b/i, /\bvideos?\b/i, /\bcontent\b/i, /\bscripts?\b/i, /\bai\b/i],
    },
  },
  {
    id: 'intro-meta',
    label: 'How the ads find the right owners',
    muxPlaybackId: INTRO_PLAYBACK_ID,
    startTime: 59.8,
    posterTime: 60,
    match: {
      strong: [
        /\bandromeda\b/i,
        /\b(meta|facebook|instagram)('s)? (algorithm|targeting)\b/i,
        /\bhow (do|does|will|would) (the |my |your |our )?ads? (find|reach|target|know)\b/i,
        /\btarget(ing)? the right\b/i,
        /\b(ad fatigue|refresh(ing)? (the )?(ads|creative))\b/i,
        /\bwho (will |would )?sees? (the|my|our) ads\b/i,
      ],
      weak: [/\b(meta|facebook|instagram)\b/i, /\balgorithm\b/i, /\btargeting\b/i, /\bads?\b/i],
    },
  },
  {
    id: 'intro-math',
    label: 'The math',
    muxPlaybackId: INTRO_PLAYBACK_ID,
    startTime: 82,
    posterTime: 84,
    match: {
      strong: [
        /\b(roi|roas|return on (investment|ad spend))\b/i,
        /\bcost per (booked )?(call|lead|appointment|client|acquisition)\b/i,
        /\bhow many (booked )?(calls|leads|appointments|clients|consults?)\b/i,
        /\b(is it|is this|would it be|will it be) (really )?worth (it|the (money|investment|cost|price))\b/i,
        /\bwhat (can|should|could|would) (i|we) (realistically )?expect\b/i,
        /\b(break[- ]?even|pay (for )?itself|payback)\b/i,
        /\b(run|show me|walk me through|what are) the (math|numbers)\b/i,
        /\bthe math\b/i,
      ],
      weak: [/\bnumbers\b/i, /\bworth\b/i, /\bexpect\b/i, /\breturn\b/i, /\bbooked calls?\b/i],
    },
  },
  {
    id: 'intro-risk',
    label: "Yes, it's a risk",
    muxPlaybackId: INTRO_PLAYBACK_ID,
    startTime: 116.9,
    posterTime: 117.5,
    match: {
      strong: [
        /\b(risky|too much risk|the risk|a risk|risk it)\b/i,
        /\b(on the fence|cold feet|second thoughts|hesitant|hesitating|nervous|scared|afraid)\b/i,
        /\bnot sure (if|whether|about)\b/i,
        /\bbig (decision|commitment|investment|leap)\b/i,
        /\bholding (me|us) back\b/i,
        /\bwhy (should|would) (i|we) (do|start|commit to|sign up for|go with|choose|pick) (this|it|nexli|you)\b/i,
      ],
      weak: [/\brisk\b/i, /\bworried\b/i, /\bunsure\b/i, /\bcommit(ment)?\b/i, /\binvestment\b/i],
    },
  },
];
