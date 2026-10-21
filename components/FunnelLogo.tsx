'use client';

import React from 'react';

/**
 * Non-linking brand anchor for self-contained funnel pages.
 *
 * Absolute on phones, fixed from md up.
 *
 * It was fixed at every width. That is fine on a short hero page, but
 * /booking-confirmed-b scrolls for twelve thousand pixels, and on a 390px
 * screen the pill sat permanently over the top-left of whatever you had
 * scrolled to — it was covering the opening words of the website section's
 * body copy ("A real one, runn…"). There is no left margin to hide in at
 * phone width the way there is on desktop.
 *
 * Absolute puts it at the top of the page, where it scrolls away after the
 * hero. The pages that use it all give <main> enough top padding (pt-24)
 * that it never overlaps their own first element.
 *
 * `belowBanner` drops it clear of a DeadlineBanner, which is a full-width
 * in-flow bar at the very top of the page - at top-6 the logo lands on top
 * of it. Same two values VslFunnel's StaticLogo and the UrgencyPill use, so
 * the three stay in line.
 */
const FunnelLogo: React.FC<{ belowBanner?: boolean }> = ({ belowBanner = false }) => (
  <div
    className={`absolute md:fixed left-6 md:left-8 z-[110] ${
      belowBanner ? 'top-[4.5rem] md:top-[5.25rem]' : 'top-6 md:top-8'
    }`}
  >
    <div
      className="flex items-center gap-2 backdrop-blur-md px-3 py-2 md:px-4 md:py-2 rounded-full border"
      style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.05)' }}
    >
      <svg className="w-6 h-6 md:w-8 md:h-8" viewBox="0 0 48 48" fill="none">
        <defs>
          <linearGradient id="logo-grad-funnel" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        <path d="M4 36L20 24L4 12L4 20L12 24L4 28L4 36Z" fill="#2563EB" />
        <path d="M12 36L28 24L12 12L12 18L18 24L12 30L12 36Z" fill="url(#logo-grad-funnel)" />
        <path d="M20 36L44 24L20 12L20 18L32 24L20 30L20 36Z" fill="#06B6D4" />
      </svg>
      <span
        className="text-sm md:text-xl font-black tracking-tighter text-white"
        style={{ fontFamily: "'Syne', sans-serif" }}
      >
        NEXLI
      </span>
    </div>
  </div>
);

export default FunnelLogo;
