'use client';

// ---------------------------------------------------------------------------
// What actually gets built, as a flow — booking-confirmed B.
//
//     [ Ad ] -> [ The offer ] -> [ Qualifier ]
//                                      |
//                        +-------------+-------------+
//              [ Qualified: VSL + calendar ]   [ Not a fit: keeps the
//                                                guide, you keep the lead ]
//
// The list of deliverables two sections down says WHAT we build. This says
// how the pieces connect, which is the thing a firm cannot picture from a
// list, and it answers the question the list raises: what happens to the
// leads who are not ready? They are not thrown away.
//
// THE FREEBIE IS THE ENTRY, NOT THE CONSOLATION. This diagram used to show
// a generic "funnel" page in the middle and put the guide on the not-a-fit
// branch, as though it were what you hand someone who failed. That is
// backwards and it misdescribes the funnel we actually run: the free guide
// is the thing the ad promises, answering the questions is how you get it,
// and everybody who answers receives it. Qualifying is what the offer DOES,
// not a gate in front of it.
//
// Theme-aware, unlike AdCreativeLab above it. This is page content, so it
// uses the page's own tokens (--glass-bg / --glass-border / --text-main) and
// green accent, matching the timeline rows in BookingConfirmedB.
//
// The fork is drawn with CSS borders, not SVG and not AnimatedBeam.
// components/ui/AnimatedBeam.tsx measures getBoundingClientRect on refs and
// recomputes on resize — fine for a fixed showcase, fragile for a layout
// that reflows from a row into a stack. Three borders cannot desynchronise.
// ---------------------------------------------------------------------------

import React from 'react';
import {
  ArrowRight,
  CalendarCheck,
  ChevronDown,
  Gift,
  ListFilter,
  Megaphone,
  UserPlus,
} from 'lucide-react';

const GREEN = 'rgba(34,197,94,';
const AMBER = 'rgba(251,191,36,';

/** The three stages before the split. */
const STAGES = [
  {
    Icon: Megaphone,
    label: 'The ad',
    body: 'Photo and video angles running on Meta, pointed at business owners and high earners in your market.',
  },
  {
    Icon: Gift,
    label: 'The offer',
    body: 'A free guide or a low-ticket product, built to be worth having on its own. It is what the ad promises and what makes the right person raise their hand.',
  },
  {
    Icon: ListFilter,
    label: 'The qualifier',
    body: 'Answering a short set of questions is how they get it. That is also what sorts a real prospect from a tyre-kicker, before anyone reaches your calendar.',
  },
];

function IconChip({
  Icon,
  tone = 'green',
}: {
  Icon: React.ElementType;
  tone?: 'green' | 'amber';
}) {
  const rgb = tone === 'amber' ? AMBER : GREEN;
  return (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
      style={{ backgroundColor: `${rgb}0.1)`, border: `1px solid ${rgb}0.3)` }}
      aria-hidden="true"
    >
      <Icon size={18} className={tone === 'amber' ? 'text-amber-500' : 'text-green-500'} />
    </span>
  );
}

function Node({
  Icon,
  label,
  body,
  tone = 'green',
  className = '',
}: {
  Icon: React.ElementType;
  label: string;
  body: string;
  tone?: 'green' | 'amber';
  className?: string;
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 ${className}`}
    >
      <IconChip Icon={Icon} tone={tone} />
      <div className="min-w-0">
        {/* Inline colour. globals.css:62 sets `p { color: var(--text-muted) }`
            unlayered, which in Tailwind v4 beats any layered text-* utility —
            text-green-500 on a <p> renders as muted body text in both themes.
            The page's own timeline label has the same bug; flagged separately
            rather than fixed here, because the rule is site-wide. */}
        <p
          className="text-[11px] font-black uppercase tracking-[0.18em]"
          style={{ color: tone === 'amber' ? '#f59e0b' : '#22c55e' }}
        >
          {label}
        </p>
        <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {body}
        </p>
      </div>
    </div>
  );
}

/** Stacked-layout connector. Replaces the arrows and the fork below `sm`. */
function StackChevron() {
  return (
    <div className="flex justify-center py-1.5 sm:hidden" aria-hidden="true">
      <ChevronDown size={16} className="text-green-500/40" />
    </div>
  );
}

export default function SystemFlow() {
  return (
    <div className="mx-auto max-w-4xl">
      {/* ── The three stages ────────────────────────────────────────────
          Arrows only exist from `sm` up, where the nodes are side by side.
          Same device as components/demo/DemoExperience.tsx:203 and
          components/ProfitCalculator.tsx:709, in this page's green. */}
      <ol className="grid grid-cols-1 gap-0 sm:grid-cols-3 sm:gap-3">
        {STAGES.map((s, i) => (
          <li key={s.label} className="relative flex flex-col">
            {i > 0 && (
              <ArrowRight
                size={14}
                aria-hidden="true"
                className="absolute -left-[11px] top-1/2 hidden -translate-y-1/2 sm:block"
                style={{ color: `${GREEN}0.5)` }}
              />
            )}
            <Node Icon={s.Icon} label={s.label} body={s.body} className="flex-1" />
            {i < STAGES.length - 1 && <StackChevron />}
          </li>
        ))}
      </ol>

      {/* ── The fork ─────────────────────────────────────────────────────
          Four borders: a stem down from THE QUALIFIER, a crossbar reaching
          back across, and a drop into each branch.

          The stem sits at 83.33% — the centre of the third of three equal
          columns — not at 50%. Centred under the whole row it read as though
          the funnel did the splitting, which is wrong: the qualifier is the
          thing that decides, and that is the entire point of the section.

          Hidden below `sm`, where a StackChevron does the same job in a
          tenth of the markup. */}
      <div className="relative hidden h-10 sm:block" aria-hidden="true">
        {/* stem, down from the qualifier */}
        <span
          className="absolute top-0 h-5 w-px"
          style={{ left: '83.333%', background: `${GREEN}0.4)` }}
        />
        {/* crossbar, from the stem back across to the left branch */}
        <span
          className="absolute top-5 h-px"
          style={{ left: '25%', right: '16.667%', background: `${GREEN}0.4)` }}
        />
        {/* drops, into the centre of each branch column */}
        <span
          className="absolute top-5 h-5 w-px"
          style={{ left: '25%', background: `${GREEN}0.4)` }}
        />
        <span
          className="absolute top-5 h-5 w-px"
          style={{ left: '75%', background: `${AMBER}0.45)` }}
        />
      </div>

      <StackChevron />

      {/* ── The two outcomes ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2">
        <Node
          Icon={CalendarCheck}
          className="h-full"
          label="Qualified → the video, then your calendar"
          body="They are shown a short video making the case for the work, with your calendar directly beneath it. They book without going anywhere, answers attached, so you open the call already knowing the firm."
        />
        {/* Amber, never red. A lead who is not ready today is not a loss,
            and colouring them like one would argue against the point the
            copy is making. */}
        <Node
          Icon={UserPlus}
          tone="amber"
          className="h-full"
          label="Not a fit → you still get the lead"
          body="They receive what they came for and nothing else is asked of them. You keep the contact and they stay in follow-up, so nothing you paid to reach is thrown away."
        />
      </div>
    </div>
  );
}
