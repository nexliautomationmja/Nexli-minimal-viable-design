'use client';

// ---------------------------------------------------------------------------
// The SYSTEMS cut of the advisory VSL.
//
// Near-copy of app/agency/agency-client by design; see the note in
// app/better-clients/better-clients-client.tsx for why these are not one
// shared component.
//
// THE HEADLINE ATTACKS THE BEHAVIOUR, NOT THE PERSON. The alternative
// drafted for this page opened "You Hate Your Firm", which is a guess
// about the reader: a partner running a $1-5M practice can be proud of it
// and frustrated by it at once, and the ones who do not hate it leave on
// the first line. "Swinging blind" names what they are DOING - no data, no
// metrics, running on instinct - which is the argument anyway.
// ---------------------------------------------------------------------------

import VslFunnel, { CHIP_GREEN } from '@/components/VslFunnel';
import {
  SYSTEMS_VSL_PLAYBACK_ID,
  SYSTEMS_VSL_POSTER_TIME,
  SYSTEMS_VSL_TITLE,
} from '@/lib/advisory-config';

export default function SystemsVslClient({ ctaHref }: { ctaHref: string }) {
  return (
    <VslFunnel
      variant="Systems-Angle"
      muxPlaybackId={SYSTEMS_VSL_PLAYBACK_ID}
      videoTitle={SYSTEMS_VSL_TITLE}
      posterTime={SYSTEMS_VSL_POSTER_TIME}
      showHiddenDrain={false}
      showExitIntent={false}
      metaChip
      showEyebrow={false}
      showFaq={false}
      // The banner is back, carrying the 2027 line rather than the old
      // December 31 one. This flag also offsets the logo and the capacity
      // pill — VslFunnel passes it through as their belowBanner value — and
      // switches on the explained version of the same argument further down
      // the page, so the two cannot disagree.
      deadlineUrgency
      ctaHref={ctaHref}
      // TWO ACCENTS, SAME LOGIC AS /better-clients: the page's own colour on
      // the state they are stuck in, and the shared green on the money. Green
      // means the same thing on every angle; violet is this page's problem
      // colour the way red is Better Clients'.
      //
      // "Help you 10x" rather than "will 10x you". The difference is a
      // promise of a specific outcome versus a description of what systems
      // do, and this site does not make the first kind - the same reason the
      // 10-14 day build chip came off the homepage and the PDF calls its own
      // arithmetic an illustration.
      //
      // The $100K+ figure has moved to the subheadline rather than left the
      // page. The headline carries the multiple, the line under it carries
      // the number, and the green marks the same thing in both places.
      //
      // Title case, not the caps it was drafted in. Three lines of caps at
      // hero size is a wall, and the other three angles are title case -
      // which is also why it is "10x Your Business" and not "10x your
      // business" mid-sentence.
      headline={
        <>
          Stop{' '}
          <span className="bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent">
            Swinging Blind
          </span>
          . Implement AI Systems That Help You{' '}
          <span style={{ color: CHIP_GREEN }}>10x Your Business</span>
        </>
      }
      // The McDonald's line earns its place: it is the fastest way to make
      // "systems beat effort" land without sounding like an insult. Nobody
      // argues McDonald's makes the best burger, and nobody disputes it won.
      //
      // Green on "$100K+ a month in profit" because /better-clients marks
      // the reader's ambition the same way in its own subheadline, and the
      // two pages should not disagree about what green means.
      subheadline={
        <>
          Twelve-hour days spent redesigning the logo and nudging the website
          feel like progress and move nothing. McDonald&apos;s does not sell
          the best burger — it sells the best system. That is the only way to
          make{' '}
          <span className="font-bold" style={{ color: CHIP_GREEN }}>
            $100K+ a month in profit
          </span>
          .
        </>
      }
    />
  );
}
