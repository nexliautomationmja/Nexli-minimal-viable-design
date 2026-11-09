// ---------------------------------------------------------------------------
// The deck, in order: shared by the deck itself (app/math/math-deck) and the
// page its PDF is made from (app/math/print), so the PDF can never show a
// different set of slides from the deck.
// ---------------------------------------------------------------------------
import { FrontDoorSlide, HowSlide, OneStopSlide, ReturnSlide, ScenariosSlide, TitleSlide } from './slides-a';
import {
  BreakEvenSlide,
  BundleSlide,
  CloseSlide,
  InvestSlide,
  TimelineSlide,
  WhoSlide,
  YearTwoSlide,
} from './slides-b';

/**
 * Order matters: it is the deck. `id` must match the slide's own id.
 *
 * HIDDEN, 2026-11-09, at Marcel's request: fifteen slides was analysis
 * paralysis, so the deck keeps to what decides. Three slides are out, not
 * deleted; put a line back here to show one again (in the deck and the PDF):
 *   { id: 'sources', title: 'Getting them on your calendar', C: SourcesSlide }       after 'return'
 *   { id: 'sources-value', title: 'What a client is worth', C: ValueSourcesSlide }   after 'sources'
 *   { id: 'stack', title: 'Clients stack', C: StackSlide }                           after 'one-stop-shop'
 * The assumptions they spelled out are still on screen elsewhere: the
 * scenarios table (cost per call, close rate), the five steps (show rate)
 * and the front door ($24,000 a year, about half taking it).
 *
 * After any change here, rebuild the PDF: node scripts/build-math-pdf.mjs
 */
export const SLIDES = [
  { id: 'top', title: 'What $5,000 can turn into', C: TitleSlide },
  { id: 'how', title: 'How the math works', C: HowSlide },
  { id: 'scenarios', title: 'Three scenarios', C: ScenariosSlide },
  { id: 'return', title: 'New fees each month', C: ReturnSlide },
  { id: 'front-door', title: 'Tax planning is the front door', C: FrontDoorSlide },
  { id: 'one-stop-shop', title: 'The one-stop shop', C: OneStopSlide },
  { id: 'who-does-what', title: 'Who does what', C: WhoSlide },
  { id: 'first-90-days', title: 'The first 90 days', C: TimelineSlide },
  { id: 'invest', title: 'What you invest', C: InvestSlide },
  { id: 'bundle', title: 'Your clients cover our fee', C: BundleSlide },
  { id: 'year-two', title: 'Going into year two', C: YearTwoSlide },
  { id: 'break-even', title: 'When you break even', C: BreakEvenSlide },
  { id: 'next', title: 'Next step', C: CloseSlide },
] as const;
