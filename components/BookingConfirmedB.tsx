'use client';

// ---------------------------------------------------------------------------
// Booking confirmed, variant B — the whole engagement, before the call.
//
// A asks them questions (Daniela's intel form) and keeps the product mostly
// described rather than shown. B does the opposite: same hero and welcome
// video, then the actual thing — the website, the portal, the engagement
// letter getting signed, the organizer collecting documents — followed by
// the price and what happens after they sign.
//
// The bet is that a firm owner who can see all of it, including the number,
// arrives at the call deciding WHEN rather than WHETHER. Nothing here is
// held back for the call.
//
// Marcel points traffic at this URL by hand; nothing in the app assigns
// anyone to it. A is untouched and still the default destination.
// ---------------------------------------------------------------------------

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import MuxPlayer from '@mux/mux-player-react';
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  CheckCircle2,
  FileSignature,
  Mail,
  Rocket,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import FunnelLogo from './FunnelLogo';
import BrowserFrame from './demo/BrowserFrame';
import PortalDemo from './demo/PortalDemo';
import AdCreativeLab from './booking/AdCreativeLab';
import SystemFlow from './booking/SystemFlow';
import PricingBlock from './booking/PricingBlock';
import DanielaFaq from './booking/DanielaFaq';
import { BOOKING_B_FAQ } from '@/lib/booking-faq';
import { useTheme } from './ThemeProvider';
import { trackMetaEvent } from '@/lib/meta-events';
import {
  AGENCY_DAYS,
  AGENCY_LAUNCH_DAYS,
  AGENCY_LAUNCH_DAYS_MAX,
  AGENCY_LAUNCH_DAYS_MIN,
  AGENCY_LEADS,
} from '@/lib/agency-offer';
import {
  BOOKING_WELCOME_VIDEO_ID,
  BOOKING_WELCOME_VIDEO_POSTER_TIME,
  BOOKING_WELCOME_VIDEO_TITLE,
  DEMO_FIRM_ACCENT,
  DEMO_FIRM_ACCENT_2,
  DEMO_FIRM_NAME,
  DEMO_FIRM_OWNER,
  DEMO_FIRM_SITE_PATH,
  demoFirmLogo,
} from '@/lib/demo-config';

/**
 * What happens after they sign. Every number is read from agency-offer.ts
 * rather than typed, and none of it is a guarantee — Nexli does not offer
 * them. These are the timelines the system is built to.
 */
const TIMELINE = [
  {
    Icon: FileSignature,
    when: 'Day 0',
    title: 'You sign. That is the whole commitment.',
    body: 'No setup fee and no deposit. You sign the agreement and the first month starts the day we do.',
  },
  {
    Icon: Sparkles,
    when: 'Days 1–3',
    title: 'We collect assets and access',
    body: 'Logo, bios, services, your ad account and domain. This is the only part that needs you, and the launch clock pauses on anything we are waiting for.',
  },
  {
    Icon: Rocket,
    when: `Days ${AGENCY_LAUNCH_DAYS_MIN}–${AGENCY_LAUNCH_DAYS}`,
    title: 'Everything is live',
    body: `Website, client portal, funnel and the automations behind them. Around ${AGENCY_LAUNCH_DAYS_MAX} days is the realistic worst case, and the variable is how fast your assets come back — not us.`,
  },
  {
    Icon: CalendarCheck,
    when: `Days ${AGENCY_LAUNCH_DAYS}–${AGENCY_DAYS}`,
    title: 'Campaigns run, your calendar fills',
    body: `${AGENCY_LEADS} qualified advisory leads inside ${AGENCY_DAYS} days of launch is what the system is built to produce. We report on it every week, so you see the pace rather than waiting to find out.`,
  },
  {
    Icon: ShieldCheck,
    when: 'Ongoing',
    title: 'Six months, then month to month',
    body: 'The initial term is six months — long enough for the campaigns to have actually run. After that it continues month to month and you can end it on 30 days notice.',
  },
];


/** What the firm actually receives, named plainly. */
const INCLUDED = [
  'A custom website on your own domain',
  'Your branded client portal',
  'Engagement letters with legally binding e-signature',
  'Tax organizers that ask by entity type and chase the documents',
  'Invoicing with online payments',
  'Secure client messaging and document collection',
  'AI automations for intake, follow-up and reminders',
  'Meta campaigns — built, run and reported on',
];

export default function BookingConfirmedB() {
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  const firstName = (searchParams.get('name') || '').trim().split(' ')[0];
  const [frameReady, setFrameReady] = useState(false);

  // Neither confirmation page fired anything before this. The Schedule event
  // happens upstream on the call page, before the redirect, so without this
  // there is no signal at all from the page people actually land on.
  useEffect(() => {
    trackMetaEvent('ViewContent', {
      content_name: 'Booking Confirmed (Variant B)',
      content_category: 'Booking',
    });
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-main)' }}>
      <FunnelLogo />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 md:pt-28 pb-20 space-y-16 md:space-y-24">
        {/* ── 1. Confirmed ──────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/*
            Same treatment as the "Campaigns built and run on Meta" chip on
            the VSL: a light travelling around the rim, and the scalloped
            verified badge rather than a plain tick.

            The rim lives in its own clipping layer and the interior is
            opaque — the green is layered OVER --bg-main rather than being a
            translucent fill, or the shimmer rotates straight through the
            middle of the pill instead of around its edge.

            6s, slower than the VSL's 5s and the eyebrow's 4s. This one sits
            alone at the top of a page somebody is about to read, not in a
            hero competing for attention.
          */}
          <span className="relative inline-flex rounded-full p-[1px]">
            <span
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
              aria-hidden="true"
            >
              <span
                className="absolute inset-[-100%] animate-[shimmer_6s_linear_infinite]"
                // Theme-aware, because a two-tone rim always loses one of
                // its stops against one of the backgrounds. The VSL's chip
                // can hard-code a bright/near-black pair — that page is
                // always dark. Here a near-black stop vanishes on white and
                // a pale one vanishes on near-black, and either way the rim
                // renders as a broken dashed line instead of a moving light.
                // So: a bright stop and a dim one picked per theme.
                style={{
                  background:
                    theme === 'dark'
                      ? 'conic-gradient(from 0deg at 50% 50%, #4ade80, #166534, #4ade80, #166534, #4ade80)'
                      : 'conic-gradient(from 0deg at 50% 50%, #22c55e, #14532d, #22c55e, #14532d, #22c55e)',
                }}
              />
            </span>

            <span
              className="relative z-10 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
              style={{
                background:
                  'linear-gradient(rgba(34,197,94,0.12), rgba(34,197,94,0.12)), var(--bg-main)',
              }}
            >
              {/* Solid-filled scalloped badge — the shape platforms use for
                  verified accounts. The tick is knocked out in the page's own
                  dark so it reads in both themes. */}
              <BadgeCheck
                size={15}
                className="shrink-0"
                fill="#22c55e"
                stroke="#052e16"
                strokeWidth={2.5}
                aria-hidden="true"
              />
              {/* green-400 on the pale interior was thin in light mode.
                  The pill reads the same either way now. */}
              <span
                className={`text-xs sm:text-sm font-black uppercase tracking-wide ${
                  theme === 'dark' ? 'text-green-400' : 'text-green-700'
                }`}
              >
                Booking confirmed
              </span>
            </span>
          </span>

          <h1 className="mt-6 text-3xl sm:text-4xl md:text-5xl font-black leading-[1.1] tracking-tight text-[var(--text-main)]">
            {firstName ? `${firstName}, your call is booked.` : 'Your call is booked.'}
            <br className="hidden sm:block" />{' '}
            <span className="text-green-500">Here is everything, before we speak.</span>
          </h1>

          <p className="mt-5 max-w-2xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed text-[var(--text-muted)]">
            No pitch on the call. Below is the system you would be buying, what it costs
            and what the first ninety days look like. Read it, and come to the call with
            the only question left: when do we start.
          </p>

          {/* The one thing we need them to do before the call. */}
          <div
            className="mt-8 mx-auto max-w-xl rounded-2xl border p-4 sm:p-5 text-left"
            style={{
              borderColor: 'rgba(34,197,94,0.25)',
              backgroundColor: 'rgba(34,197,94,0.06)',
            }}
          >
            <p className="text-xs font-black uppercase tracking-[0.2em] text-green-500">
              One thing first
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
              Accept the calendar invite, or reply <strong className="text-[var(--text-main)]">CONFIRM</strong>{' '}
              to the text we just sent. That is all we need to hold the time.
            </p>
          </div>
        </motion.section>

        {/* ── 2. Welcome video ──────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-4xl mx-auto overflow-hidden rounded-2xl md:rounded-3xl border border-[var(--glass-border)]">
            <MuxPlayer
              playbackId={BOOKING_WELCOME_VIDEO_ID}
              // Without this Mux serves a frame from the middle of the video.
              thumbnailTime={BOOKING_WELCOME_VIDEO_POSTER_TIME}
              metadata={{ video_title: BOOKING_WELCOME_VIDEO_TITLE }}
              streamType="on-demand"
              accentColor="#22c55e"
              style={{ aspectRatio: '16/9', width: '100%' }}
            />
          </div>
        </motion.section>

        {/* ── 3. The website ────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <SectionHead
            step="01"
            title="The website your clients land on"
            body="A real one, running right now — not a screenshot. Scroll it, click it. Yours is built on your own domain with your brand."
          />
          <div className="mt-6">
            <BrowserFrame
              src={`${DEMO_FIRM_SITE_PATH}?theme=${theme}`}
              title="Example firm website"
              address="evergreentax.com"
              height={640}
              onLoad={() => setFrameReady(true)}
              className={frameReady ? '' : 'opacity-80'}
            />
          </div>
        </motion.section>

        {/* ── 4. The portal and the whole flow ──────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <SectionHead
            step="02"
            title="The portal, and how the work actually moves"
            body="Click the tabs. Draft an engagement letter and send it — that is the real flow, not a video of it. Then look at the organizer, and at what your client sees."
          />
          <div className="mt-6">
            <PortalDemo
              firmName={DEMO_FIRM_NAME}
              accent={DEMO_FIRM_ACCENT}
              accent2={DEMO_FIRM_ACCENT_2}
              ownerName={DEMO_FIRM_OWNER}
              logoUrl={demoFirmLogo(theme)}
              theme={theme}
            />
          </div>
          <p className="mt-4 text-xs leading-relaxed text-[var(--text-muted)]">
            Demo data. Sending a letter here updates this screen only — nothing leaves the building.
          </p>
        </motion.section>

        {/* ── 5. The ads ────────────────────────────────────────────
            The website and the portal are the easy things to show. This is
            what the ad spend actually buys, and it was missing. */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <SectionHead
            step="03"
            title="The ads, and who makes them"
            body="We do not guess at one perfect ad. Several angles run at once, in photo and in video, and the spend decides which ones survive."
          />
          <div className="mt-6">
            <AdCreativeLab />
          </div>
          <p className="mx-auto mt-4 max-w-3xl text-xs leading-relaxed text-[var(--text-muted)]">
            The presenters in the video ads are AI-generated. You never record anything, you are
            never on camera, and you do not have to become a content creator to run ads for your
            firm. We write the angles, produce the creative and run the account.
          </p>
        </motion.section>

        {/* ── 6. The system, as a flow ──────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <SectionHead
            step="04"
            title="What gets built, end to end"
            body="Five moving parts and one fork. Everything above plugs into this."
          />
          <div className="mt-6">
            <SystemFlow />
          </div>
        </motion.section>

        {/* ── 7. What's included ────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <SectionHead step="05" title="Everything in the engagement" />
          <ul className="mt-6 grid max-w-4xl mx-auto grid-cols-1 sm:grid-cols-2 gap-3">
            {INCLUDED.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4"
              >
                <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-green-500" aria-hidden="true" />
                <span className="text-sm leading-relaxed text-[var(--text-main)]">{item}</span>
              </li>
            ))}
          </ul>
        </motion.section>

        {/* ── 8. The price ──────────────────────────────────────────── */}
        <section>
          <PricingBlock />
        </section>

        {/* ── 9. After you sign ─────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <SectionHead
            step="06"
            title="What happens after you say yes"
            body="So there are no surprises about how this runs."
          />
          <ol className="mt-6 max-w-3xl mx-auto space-y-3">
            {TIMELINE.map(({ Icon, when, title, body }) => (
              <li
                key={when}
                className="flex items-start gap-4 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 sm:p-5"
              >
                <span
                  className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: 'rgba(34,197,94,0.1)',
                    border: '1px solid rgba(34,197,94,0.25)',
                  }}
                >
                  <Icon size={18} className="text-green-500" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-green-500">
                    {when}
                  </p>
                  <p className="mt-1 text-sm sm:text-base font-bold text-[var(--text-main)]">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--text-muted)]">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </motion.section>

        {/* ── 10. Objections, answered ───────────────────────────────── */}
        <DanielaFaq
          items={BOOKING_B_FAQ}
          badge="Before the call"
          heading={<>Everything else you were <span className="text-green-500">going to ask</span></>}
          intro="Read them, or play them and hear Daniela answer in her own voice. Either way the call can be about whether this fits, not about what it is."
        />

        {/* ── 11. Close ──────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="relative max-w-4xl mx-auto overflow-hidden rounded-[1.5rem] md:rounded-[3rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 md:p-20 backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-green-500/10 to-transparent" />
            <div className="relative z-10">
              <h2 className="mb-4 text-xl md:text-5xl font-bold leading-tight tracking-tight text-[var(--text-main)] md:mb-8">
                That is all of it.{' '}
                <br className="hidden md:block" />
                <span className="text-green-500">See you on the call.</span>
              </h2>
              <p className="mx-auto mb-6 max-w-2xl text-sm md:text-xl font-medium leading-relaxed text-[var(--text-muted)] md:mb-8">
                Nothing is being saved for a pitch. If something here does not work for your
                firm, say so on the call and we will part as friends.
              </p>
              <a
                href="mailto:mail@nexli.net"
                className="inline-flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-green-600/25 transition-all hover:scale-105 hover:bg-green-500 active:scale-95 md:gap-3 md:px-10 md:py-5 md:text-lg"
              >
                <Mail size={16} className="md:h-5 md:w-5" />
                mail@nexli.net
              </a>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}

/** Numbered section heading, so the page reads as a sequence. */
function SectionHead({ step, title, body }: { step: string; title: string; body?: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <span className="inline-flex items-center gap-2">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black text-green-500"
          style={{
            backgroundColor: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.3)',
          }}
        >
          {step}
        </span>
        <ArrowRight size={14} className="text-green-500/50" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight text-[var(--text-main)]">
        {title}
      </h2>
      {body && (
        <p className="mt-3 text-sm sm:text-base leading-relaxed text-[var(--text-muted)]">{body}</p>
      )}
    </div>
  );
}
