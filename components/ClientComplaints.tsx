'use client';
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Marquee } from './ui/Marquee';
import { cn } from '../lib/utils';
import { useTheme } from './ThemeProvider';
import { AuroraText } from './ui/AuroraText';
import { AGENCY_ENGAGEMENT_AVG, usd } from '@/lib/agency-offer';

interface Complaint {
  name: string;
  username: string;
  avatar: string;
  text: string;
}

/**
 * Repositioned onto tax planning.
 *
 * The set used to be service complaints — unanswered emails, a broken
 * document portal, a padded invoice. True, and the wrong argument: a CPA
 * reading them concludes they should answer email faster, not that there is
 * a $15,000 engagement sitting in their book.
 *
 * Every card now has an owner losing real money to the IRS and nobody
 * bringing them a plan. Six were kept because they already made that point;
 * six were replaced.
 *
 * These are illustrative, not transcriptions of real posts. See the note on
 * the verified badge in ComplaintCard.
 */
const complaints: Complaint[] = [
  // ── Kept: already about tax planning, not service ──────────────────────
  {
    name: "Peyton L.",
    username: "@peyton_investor",
    avatar: "/avatars/peyton-l.webp",
    text: "My CPA never once mentioned estimated quarterly taxes. I got hit with a $12K penalty at filing. Isn't the whole point of hiring a CPA to AVOID surprises?"
  },
  {
    name: "Keyonna M.",
    username: "@keyonna_estate",
    avatar: "/avatars/keyonna-m.webp",
    text: "When I asked my CPA about tax strategies for my small business, he laughed and said 'you don't make enough for that to matter.' I make $400K/year."
  },
  {
    name: "James C.",
    username: "@james_market",
    avatar: "/avatars/james-c.webp",
    text: "Found out my previous CPA missed the pass-through entity deduction for TWO YEARS. Cost me over $80K. His response? 'These things happen.'"
  },
  {
    name: "Robert F.",
    username: "@robert_vanguard",
    avatar: "/avatars/robert-f.webp",
    text: "Every time I bring a new idea to my accountant, the answer is 'no.' It feels like my CPA works for the IRS, not for me."
  },
  {
    name: "Patricia N.",
    username: "@patricia_hnw",
    avatar: "/avatars/patricia-n.webp",
    text: "My CPA has never once called me about a tax law change, a deduction, or anything that would lower my bill. I only hear from them when the invoice is due."
  },
  {
    name: "Peyton R.",
    username: "@peyton_research",
    avatar: "/avatars/peyton-r.webp",
    text: "72% of business owners left their CPA because they weren't offered any strategic advice — just compliance work and a bill."
  },

  // ── Replaced: the service complaints, swapped for the money ────────────
  {
    name: "Jian Z.",
    username: "@jian_wealth",
    avatar: "/avatars/jian-z.webp",
    text: "Wrote a $340K cheque to the IRS in April. My accountant's entire strategy was 'maybe max out your 401(k).' That was it. That was the plan."
  },
  {
    name: "Sandra K.",
    username: "@sandra_cpa",
    avatar: "/avatars/sandra-k.webp",
    text: "I would hand someone $50K tomorrow if they could show me how to legally keep an extra $200K. In 11 years nobody has ever offered."
  },
  {
    name: "Roberto W.",
    username: "@roberto_client",
    avatar: "/avatars/roberto-w.webp",
    text: "Sold the business and got blindsided by the tax bill. One conversation in October would have been worth seven figures to me. Nobody called."
  },
  {
    name: "William R.",
    username: "@william_trust",
    avatar: "/avatars/william-r.webp",
    text: "I pay $900 to have my return filed and I save nothing. A guy I know pays his CPA $20K a year for planning and his effective rate is half mine."
  },
  {
    name: "Bernice P.",
    username: "@bernice_advisor",
    avatar: "/avatars/bernice-p.webp",
    text: "Every year I ask 'is there anything we can do about this bill?' Every year: 'not really.' There is always something. They just don't do that work."
  },
  {
    name: "Catherine D.",
    username: "@catherine_closing",
    avatar: "/avatars/catherine-d.webp",
    text: "Paid more in federal tax last year than my first house cost. Still waiting on my accountant to bring me one single idea."
  }
];

const firstRow = complaints.slice(0, complaints.length / 2);
const secondRow = complaints.slice(complaints.length / 2);

const ComplaintCard = ({ name, username, avatar, text, isDark }: Complaint & { isDark: boolean }) => {
  return (
    <figure
      className={cn(
        "relative w-72 md:w-80 cursor-pointer overflow-hidden rounded-2xl border p-4 md:p-5",
        "transition-all duration-300",
        isDark
          ? "border-white/10 bg-[#16181c] hover:bg-[#1d1f23]"
          : "border-gray-200 bg-white hover:bg-gray-50"
      )}
    >
      {/* X.com logo */}
      <div className="absolute top-4 right-4 md:top-5 md:right-5">
        <svg viewBox="0 0 24 24" className={cn("w-5 h-5", isDark ? "text-white/70" : "text-black/70")} fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </div>
      <div className="flex flex-row items-center gap-3 pr-8">
        <img
          className="rounded-full w-10 h-10 md:w-12 md:h-12 object-cover"
          alt={name}
          src={avatar}
          loading="lazy"
        />
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <figcaption className={cn("text-sm md:text-base font-bold", isDark ? "text-white" : "text-gray-900")}>
              {name}
            </figcaption>
            {/*
              NOTE: these cards are illustrative — composite complaints, not
              transcriptions of real posts, with stock avatars and invented
              handles. The X logo and this badge together read as "verified
              real account", which is a stronger claim than the content can
              support. Worth dropping the badge, or labelling the section,
              before this goes in front of a CPA who checks things.
            */}
            <svg viewBox="0 0 22 22" className="w-4 h-4 text-[#1d9bf0]" fill="currentColor">
              <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
            </svg>
          </div>
          <p className="text-xs md:text-sm text-gray-500">{username}</p>
        </div>
      </div>
      <blockquote className={cn("mt-3 text-sm md:text-base leading-relaxed", isDark ? "text-gray-300" : "text-gray-700")}>
        {text}
      </blockquote>
    </figure>
  );
};

const ClientComplaints: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section className="relative py-12 md:py-32 overflow-hidden bg-[var(--bg-main)] transition-colors duration-300" id="complaints">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(29,155,240,0.08)_0%,transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,rgba(29,155,240,0.08)_0%,transparent_50%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-10 md:mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 mb-4 md:mb-6 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-[#1d9bf0]/10 border border-[#1d9bf0]/20"
          >
            <span className="text-[#1d9bf0] text-[9px] md:text-xs font-black tracking-[0.2em] uppercase">What they are actually asking for</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, ease: "circOut" }}
            className="text-[var(--text-main)] mb-4 md:mb-6 text-2xl md:text-5xl font-bold"
          >
            They Will Pay {usd(AGENCY_ENGAGEMENT_AVG)}+ to Stop{' '}
            <AuroraText>Overpaying the IRS</AuroraText>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[var(--text-muted)] max-w-2xl mx-auto text-sm md:text-lg px-4"
          >
            Would you pay {usd(AGENCY_ENGAGEMENT_AVG)} to someone who saves you $100,000? If the answer
            is no, you do not know math — and neither does the firm still charging $800 to file
            their return. These owners are writing six and seven-figure cheques to the IRS and
            nobody is bringing them a plan.{' '}
            <span className="text-[var(--text-main)] font-semibold">That work is sitting in your book right now.</span>
          </motion.p>
        </div>
      </div>

      {/* Marquee Section */}
      <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
        {/* Gradient overlays for fade effect */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-[var(--bg-main)] to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-[var(--bg-main)] to-transparent z-10" />

        <Marquee pauseOnHover duration={45}>
          {firstRow.map((complaint, idx) => (
            <ComplaintCard key={idx} {...complaint} isDark={isDark} />
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover duration={50}>
          {secondRow.map((complaint, idx) => (
            <ComplaintCard key={idx} {...complaint} isDark={isDark} />
          ))}
        </Marquee>
      </div>

      {/* Call to Action */}
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 md:mt-16 text-center"
        >
          <p className="text-[var(--text-muted)] text-sm md:text-base mb-4">
            Don't let your firm become another complaint.
          </p>
          <button
            onClick={() => {
              setTimeout(() => {
                const isMobile = window.innerWidth < 768;
                if (isMobile) {
                  document.getElementById('book-mobile')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                  document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' });
                }
              }, 100);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/25"
          >
            See How Nexli Solves This
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default ClientComplaints;
