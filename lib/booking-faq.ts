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
  AGENCY_ENGAGEMENT_HIGH,
  AGENCY_ENGAGEMENT_LOW,
  AGENCY_LAUNCH_DAYS,
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
 * RESOLVED 2026-11-04, though not the way this note first prescribed.
 * The clause is now gone from the written answer, and b-pricing is the
 * one item with no `audio` — because /candor answers the same question
 * live and two surfaces contradicting each other about money is worse
 * than one question having no player. The key still returns 401, so
 * re-rendering remains blocked; see the note on the item itself for how
 * to restore the clip once that is fixed.
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
    // NO AUDIO: b-how-it-works.mp3 was rendered from the old answer, which
    // ended "The target is 50 qualified advisory leads inside 90 days of
    // launch" — an offer retired on 2026-11-09 (see lib/agency-offer.ts).
    // Re-render it from the answer below the way the pricing item at the end
    // of this list describes, then put this line back:
    //   audio: '/audio/faq/b-how-it-works.mp3',
    question: 'How exactly does the system get me higher-value clients?',
    answer:
      `We build the front end a high earner judges you by — the website, the booking flow, the portal they log into — and then run Meta campaigns at business owners and high-income individuals who are actively looking for tax help. The ads do not sell your firm; they offer a conversation about what someone is overpaying. Intake, follow-up and reminders are automated, so the ones who respond land on your calendar already knowing what the meeting is about. Every one of them is a tax-planning client worth ${usd(AGENCY_ENGAGEMENT_LOW)} to ${usd(AGENCY_ENGAGEMENT_HIGH)} an engagement.`,
  },
  {
    question: 'Who runs the ads — you or a white-label agency?',
    audio: '/audio/faq/b-who-runs-ads.mp3',
    answer:
      'We do, in house. No white-label, no subcontractor, no media buyer you never meet. We build the campaigns, write and produce the creative, and manage the Facebook ad account day to day.\n\nThe ad budget is part of your monthly and runs through us. That is deliberate: it means the spend reaches the campaigns on the day it is supposed to, rather than pausing because a card on file expired. The weekly update shows exactly what went out and what it brought back.',
  },
  {
    // NO AUDIO: b-timeline.mp3 was rendered from the old answer, "10 to 14
    // days", retired on 2026-11-09 for one number, about 21. Same reason and
    // same restore steps as the pricing item at the end of this list.
    question: 'How soon can this be up and running?',
    answer:
      `About ${AGENCY_LAUNCH_DAYS} days from kickoff, for the whole system: the website, the portal, the funnel, the automations, the texting registration, your ad account and invoicing. Launch is the day your ads go live, and nothing monthly is billed before it.\n\nThe variable is almost never us. It is how fast branding, logins and approvals come back, plus the carriers' and the ad platform's own reviews, which nobody controls. Send everything in the first few days and you keep it on schedule.`,
  },
  {
    // NO AUDIO: b-what-you-own.mp3 says the portal and automations "stop
    // working when the engagement does". Marcel, 2026-11-09: the firm owns
    // all of it and pays its own hosting (components/TermsAndConditions,
    // section 6). Re-render it the way the pricing item below describes.
    // Marcel, 2026-11-09 (later): the one exception is the ad creative,
    // which Nexli keeps. Never "all of it" again.
    question: 'What do I actually own at the end of it?',
    answer:
      'Everything but the ad creative. The website, the client portal, the funnel and the automations we build are yours, along with your domain, your content, your ad account and your client data. You pay your hosting provider directly, so none of it sits on our bill. The ad creative we make for your campaigns, the videos and images, stays ours.\n\nWhat the monthly pays for is us: keeping the whole system maintained, changing the funnels, ads and automations as they need it, and running the campaigns. If we part ways, that work stops, and so does the ad budget we place for you. The system stays yours.\n\nThe honest version: a system nobody is tuning goes stale. The part that keeps it bringing in tax-planning clients is the part you are paying us to do.',
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
    // NO AUDIO, DELIBERATELY, AND THE ONLY ITEM WITHOUT IT.
    //
    // b-pricing.mp3 was rendered from the old string, which ended "because
    // it depends on what you already have". That claim was retired on
    // 2026-10-20 and the written answer below is now corrected: the setup
    // fee is FLAT, the same for every firm. The clip cannot be re-rendered
    // — the ElevenLabs key in .env.local returns 401 — so the choice was
    // between Daniela's voice making a money claim the company no longer
    // makes, and this question having no player. Silence wins.
    //
    // The header above calls this out as the safe move: dropping `audio`
    // falls back to the written reply and the layout is identical.
    //
    // TO RESTORE: put a working ELEVENLABS_API_KEY in .env.local, then
    //   npx tsx scripts/generate-faq-audio.ts --force --only b-pricing
    // and add `audio: '/audio/faq/b-pricing.mp3',` back here. The script
    // renders from the string below, so the two cannot drift again.
    question: 'How is the price built?',
    answer:
      `${usd(AGENCY_TOTAL_MONTHLY)} a month. One number, one invoice.\n\n${usd(AGENCY_AD_SPEND)} of that is your ad budget, which we place into the campaigns for you, and the rest is the system — the website, the portal, the funnel and the automations behind them, built and run for you.\n\nOn top of that there is a one-time setup fee covering the build — the website, the portal, the funnel and the automations all have to be made before any of this runs, and that is real work before you see a lead. We put a number on it on the call. It is the same fee for every firm — everyone gets the same build, and it does not work with a piece missing. What there is not is per-component pricing: we do not sell the pieces separately because they do not work separately. There is an agreement to sign with a six-month initial term from launch — long enough for the campaigns to have actually run — and after that it continues month to month on 30 days notice.`,
  },
];
