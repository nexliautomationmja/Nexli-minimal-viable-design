'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, CalendarCheck, Rocket, ArrowRight, Calculator, Equal, X as XIcon } from 'lucide-react';
import { useBooking } from './QualificationProvider';

// ─────────────────────────────────────────────────────────────────────────────
// GUARANTEE SECTION — Two written guarantees for the Digital Rainmaker System.
// Shared by every VSL page (VslFunnel.tsx + VslFunnelOffer.tsx).
// Tune the numbers here; the pipeline math below is computed from them.
// ─────────────────────────────────────────────────────────────────────────────
const LEADS = 50;
const DAYS = 90;
const ENGAGEMENT_LOW = 5_000;
const ENGAGEMENT_HIGH = 25_000;
const LAUNCH_DAYS = 14;
const CREDIT = 1_000;

const ENGAGEMENT_AVG = (ENGAGEMENT_LOW + ENGAGEMENT_HIGH) / 2;
const PIPELINE_VALUE = LEADS * ENGAGEMENT_AVG;

const usd = (n: number) => `$${n.toLocaleString('en-US')}`;

const EMERALD = '#34d399';
const EMERALD_GLOW = 'drop-shadow(0 0 12px rgba(52,211,153,0.5))';

interface GuaranteeSectionProps {
  /** Matches the CTA color of the host page: blue for VslFunnel, green for VslFunnelOffer. */
  accent?: 'blue' | 'green';
  /**
   * Hide the "See If Your Firm Qualifies" button. Use on pages where the
   * visitor has already qualified and the calendar is on the page, so the
   * button would send them back through the gate they just cleared.
   */
  hideCta?: boolean;
}

const guarantees = [
  {
    n: 1,
    Icon: CalendarCheck,
    title: `${LEADS} Qualified Leads in ${DAYS} Days`,
    body: `We guarantee at least ${LEADS} qualified advisory leads within ${DAYS} days of campaign launch — business owners and high earners who match the criteria you set with us and have asked your firm to contact them.`,
    missLabel: 'If we miss it',
    miss: `We keep working for free until you hit ${LEADS}. No extra fees, no renegotiation, no clock.`,
  },
  {
    n: 2,
    Icon: Rocket,
    title: `${LAUNCH_DAYS}-Day Funnel Launch Guarantee`,
    body: `We build your entire funnel — website, landing pages, booking flow, follow-up and the portal behind it — and we guarantee it is live within ${LAUNCH_DAYS} days. The clock starts the day we have your assets, access and approvals, and pauses for anything we are waiting on from you.`,
    missLabel: 'If we miss it',
    miss: `If the delay is on our end, you receive a ${usd(CREDIT)} credit toward your next monthly payment.`,
  },
];

const GuaranteeSection: React.FC<GuaranteeSectionProps> = ({ accent = 'blue', hideCta = false }) => {
  const { openBooking } = useBooking();
  const btnClass =
    accent === 'green'
      ? 'bg-green-600 hover:bg-green-500 shadow-green-600/25'
      : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/25';

  return (
    <section
      className="relative py-14 sm:py-20 md:py-28 px-4 bg-[#1a2332] border-b"
      style={{ borderColor: 'rgba(255,255,255,0.07)' }}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[260px] rounded-full blur-[120px] bg-emerald-500/8 pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-14"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-5"
            style={{ backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.25)' }}
          >
            <ShieldCheck size={14} style={{ color: EMERALD }} />
            <span className="text-xs font-bold tracking-wide uppercase" style={{ color: EMERALD }}>
              Two Written Guarantees
            </span>
          </div>
          <h2
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black leading-tight mb-4"
            style={{ fontFamily: "'Syne', sans-serif", color: '#ffffff' }}
          >
            You Don&apos;t Carry the Risk.{' '}
            <span style={{ color: EMERALD, filter: EMERALD_GLOW }}>We Do.</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Both guarantees are written into your agreement. Here is exactly what they mean and what
            happens if we fall short.
          </p>
        </motion.div>

        {/* Guarantee cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 mb-8 sm:mb-10">
          {guarantees.map((g, i) => (
            <motion.div
              key={g.n}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative rounded-2xl sm:rounded-3xl border p-6 sm:p-8 flex flex-col"
              style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(16,185,129,0.2)' }}
            >
              <div className="flex items-center gap-3 mb-5">
                <span
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-[#0a0f1c] shrink-0"
                  style={{ backgroundColor: EMERALD }}
                >
                  {g.n}
                </span>
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'rgba(52,211,153,0.12)' }}
                >
                  <g.Icon size={20} style={{ color: EMERALD }} />
                </span>
              </div>

              <h3
                className="text-lg sm:text-xl md:text-2xl font-black leading-tight mb-3"
                style={{ fontFamily: "'Syne', sans-serif", color: '#ffffff' }}
              >
                {g.title}
              </h3>
              <p className="text-sm sm:text-base leading-relaxed mb-5 flex-1" style={{ color: 'rgba(255,255,255,0.75)' }}>
                {g.body}
              </p>

              <div
                className="rounded-xl border p-4"
                style={{ backgroundColor: 'rgba(52,211,153,0.06)', borderColor: 'rgba(52,211,153,0.25)' }}
              >
                <p className="text-[11px] font-bold tracking-[0.15em] uppercase mb-1" style={{ color: EMERALD }}>
                  {g.missLabel}
                </p>
                <p className="text-sm sm:text-base font-semibold leading-relaxed" style={{ color: '#ffffff' }}>
                  {g.miss}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pipeline math */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="rounded-2xl sm:rounded-3xl border p-6 sm:p-8 mb-6"
          style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-2 mb-6">
            <Calculator size={16} style={{ color: EMERALD }} />
            <p className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: EMERALD }}>
              What Guarantee #1 Puts in Your Pipeline
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto_1.2fr] gap-4 sm:gap-3 items-center">
            <div className="text-center sm:text-left">
              <p className="text-3xl sm:text-4xl font-black" style={{ color: '#ffffff', fontFamily: "'Syne', sans-serif" }}>
                {LEADS}
              </p>
              <p className="text-xs sm:text-sm leading-snug mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
                Guaranteed qualified leads
              </p>
            </div>

            <XIcon size={22} className="mx-auto" style={{ color: 'rgba(255,255,255,0.35)' }} />

            <div className="text-center sm:text-left">
              <p className="text-3xl sm:text-4xl font-black" style={{ color: '#ffffff', fontFamily: "'Syne', sans-serif" }}>
                {usd(ENGAGEMENT_AVG)}
              </p>
              <p className="text-xs sm:text-sm leading-snug mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
                Average engagement ({usd(ENGAGEMENT_LOW)} to {usd(ENGAGEMENT_HIGH)})
              </p>
            </div>

            <Equal size={22} className="mx-auto" style={{ color: 'rgba(255,255,255,0.35)' }} />

            <div
              className="text-center sm:text-left rounded-xl border px-4 py-3"
              style={{ backgroundColor: 'rgba(52,211,153,0.06)', borderColor: 'rgba(52,211,153,0.25)' }}
            >
              <p className="text-3xl sm:text-4xl font-black" style={{ color: EMERALD, filter: EMERALD_GLOW, fontFamily: "'Syne', sans-serif" }}>
                {usd(PIPELINE_VALUE)}
              </p>
              <p className="text-xs sm:text-sm leading-snug mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Pipeline value in {DAYS} days
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm leading-relaxed mt-5" style={{ color: 'rgba(255,255,255,0.45)' }}>
            The {LEADS} leads are guaranteed. The {usd(PIPELINE_VALUE)} is not — it is what those leads
            are worth <em className="pr-[0.12em]">if</em> every one of them becomes an engagement at your average fee, which no
            firm closes at. It is there to size the opportunity, not to promise revenue; your close rate
            decides what you actually bank. Qualified means a US-based business owner or high-income
            individual who matches the advisory criteria you set with us and has asked your firm to
            contact them. Those criteria and the full terms are written into your agreement.
          </p>
        </motion.div>

        {/* CTA */}
        {!hideCta && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mt-8 sm:mt-10"
        >
          <button
            onClick={() => openBooking()}
            className={`inline-flex items-center justify-center gap-2 sm:gap-3 ${btnClass} text-white px-7 py-4 sm:px-10 sm:py-5 rounded-full text-base sm:text-lg md:text-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl group cursor-pointer`}
          >
            See If Your Firm Qualifies
            <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="mt-3 text-xs sm:text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
            We only partner with established CPA firms. No startups. No high-pressure pitch.
          </p>
        </motion.div>
        )}
      </div>
    </section>
  );
};

export default GuaranteeSection;
