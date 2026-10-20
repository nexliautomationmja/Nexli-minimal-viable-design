// ---------------------------------------------------------------------------
// The eight answers on /booking-confirmed-b.
//
// A plain module, not JSX, for one reason: scripts/generate-faq-audio.ts
// imports THIS file to render Daniela's recordings. The words she says and
// the words on screen come from the same string, so they cannot drift —
// edit an answer here and the next run of the script re-voices it.
// ---------------------------------------------------------------------------

import type { FaqItem } from '@/components/booking/DanielaFaq';
import {
  AGENCY_AD_SPEND,
  AGENCY_DAYS,
  AGENCY_LAUNCH_DAYS,
  AGENCY_LAUNCH_DAYS_MAX,
  AGENCY_LAUNCH_DAYS_MIN,
  AGENCY_LEADS,
  AGENCY_TOTAL_MONTHLY,
  usd,
} from '@/lib/agency-offer';

/**
 * Daniela answers these, in her voice AND in writing — the words on screen
 * are the words she is saying. Pressing play is an option, never a toll:
 * a prospect skimming on a phone in a car park gets the whole answer, and
 * one who plays it gets to follow along.
 *
 * THE `answer` STRING IS THE SCRIPT. The mp3s under public/audio/faq/ were
 * rendered from these exact strings by scripts/generate-faq-audio.ts, so
 * editing an answer here puts the page out of sync with the voice until you
 * re-run it:
 *
 *     npx tsx scripts/generate-faq-audio.ts --force --only b-pricing
 *
 * OUTSTANDING: the pricing answer still ends "because it depends on what
 * you already have". That clause was removed everywhere else on
 * 2026-10-20 — the pricing card, the confirmation email and the SEO
 * answer in lib/site.ts — because it read as a reason the fee might vary
 * and invited a firm to negotiate down from a number nobody had said
 * yet. It is one build, and almost nobody arrives with any of it in
 * place.
 *
 * It survives HERE only because b-pricing.mp3 was rendered from this
 * exact string and the ElevenLabs key has since been rotated, so the
 * clip cannot be re-rendered. Changing the text alone would have
 * Daniela saying a sentence the page does not show. Fix both together:
 * put a working ELEVENLABS_API_KEY in .env.local, drop the clause, and
 * run the command above.
 *
 * Dropping `audio` from an item is safe — it falls back to her written
 * reply with no player, and the layout is identical either way.
 *
 * Page A's six recordings are NOT reused here. They were cut on 1 September,
 * before guarantees were removed, before the single ${'$'}9,997 price and before
 * ad spend started running through us — so they may state things this page
 * now contradicts. Two of the questions match word for word and were still
 * left unwired for that reason.
 *
 * Figures come from lib/agency-offer.ts so an answer can never disagree with
 * the pricing block above it.
 */
export const BOOKING_B_FAQ: FaqItem[] = [
  {
    question: 'How exactly does the system get me higher-value clients?',
    audio: '/audio/faq/b-how-it-works.mp3',
    answer:
      `We build the front end a high earner judges you by — the website, the booking flow, the portal they log into — and then run Meta campaigns at business owners and high-income individuals who are actively looking for tax help. The ads do not sell your firm; they offer a conversation about what someone is overpaying. Intake, follow-up and reminders are automated, so the ones who respond land on your calendar already knowing what the meeting is about. The target is ${AGENCY_LEADS} qualified advisory leads inside ${AGENCY_DAYS} days of launch.`,
  },
  {
    question: 'Who runs the ads — you or a white-label agency?',
    audio: '/audio/faq/b-who-runs-ads.mp3',
    answer:
      'We do, in house. No white-label, no subcontractor, no media buyer you never meet. We build the campaigns, write and produce the creative, and manage the Facebook ad account day to day.\n\nThe ad budget is part of your monthly and runs through us. That is deliberate: it means the spend reaches the campaigns on the day it is supposed to, rather than pausing because a card on file expired. The weekly update shows exactly what went out and what it brought back.',
  },
  {
    question: 'How soon can this be up and running?',
    audio: '/audio/faq/b-timeline.mp3',
    answer:
      `Most firms are live in ${AGENCY_LAUNCH_DAYS_MIN} to ${AGENCY_LAUNCH_DAYS} days. Around ${AGENCY_LAUNCH_DAYS_MAX} days is the realistic worst case, and the variable is almost never us — it is how fast branding, logins and approvals come back. Send everything in the first few days and you are at the short end of that range.`,
  },
  {
    question: 'What do I actually own at the end of it?',
    audio: '/audio/faq/b-what-you-own.mp3',
    answer:
      'The website is yours. It is on your domain, and if we part ways you keep it.\n\nThe rest is not. The automations, the client portal and the review engine are built and run by us on our infrastructure, and they stop working when the engagement does. We would rather say that now than have you find out later.\n\nThe honest version: the website on its own will not bring anyone in, and it will not onboard anybody onto tax planning. The part that does that is the part you are paying us to run.',
  },
  {
    question: "How secure is this for my clients' data? What about compliance?",
    audio: '/audio/faq/b-security.mp3',
    answer:
      'Documents are encrypted with AES-256 at rest and TLS in transit — the same standard banks use — and the portal is built to GLBA/FTC Safeguards and the IRS Publication 4557 requirements for tax professionals. Access is per-client, so one of your clients can never see another one.\n\nWhat that does not mean: we are not your compliance department. Your WISP, your retention policy and who on your team gets access are yours to set, and we will build around whatever you already have rather than hand you a policy and call it done.',
  },
  {
    question: 'How often will we actually talk?',
    audio: '/audio/faq/b-communication.mp3',
    answer:
      'Once a week, reliably. You get a written update covering exactly what we did in the ad account and in the business that week, and what it produced. Not a dashboard link — a personal note.\n\nWe also run an internal survey every week on how the work is going, so problems surface while they are still small.\n\nWe are not on call, and you will not be chasing us for a status. Nothing is worse than an agency delivering and never telling you.',
  },
  {
    question: 'Who is actually running my account?',
    audio: '/audio/faq/b-who-runs-account.mp3',
    answer:
      'Marcel, the founder. Not a junior, not a pod, not someone you meet once on the kickoff call and never again. As the firm grows that will change, and we will tell you before it does.',
  },
  {
    question: 'How is the price built?',
    audio: '/audio/faq/b-pricing.mp3',
    answer:
      `${usd(AGENCY_TOTAL_MONTHLY)} a month. One number, one invoice.\n\n${usd(AGENCY_AD_SPEND)} of that is your ad budget, which we place into the campaigns for you, and the rest is the system — the website, the portal, the funnel and the automations behind them, built and run for you.\n\nOn top of that there is a one-time setup fee covering the build — the website, the portal, the funnel and the automations all have to be made before any of this runs, and that is real work before you see a lead. We put a number on it on the call, because it depends on what you already have. What there is not is per-component pricing: we do not sell the pieces separately because they do not work separately. There is an agreement to sign with a six-month initial term — long enough for the campaigns to have actually run — and after that it continues month to month on 30 days notice.`,
  },
];
