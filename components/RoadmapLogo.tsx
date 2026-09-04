'use client';

import React from 'react';

/** Fixed, non-linking brand anchor for the roadmap funnel pages. */
const RoadmapLogo: React.FC = () => (
  <div className="fixed top-6 left-6 md:top-8 md:left-8 z-[110]">
    <div
      className="flex items-center gap-2 backdrop-blur-md px-3 py-2 md:px-4 md:py-2 rounded-full border"
      style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.05)' }}
    >
      <svg className="w-6 h-6 md:w-8 md:h-8" viewBox="0 0 48 48" fill="none">
        <defs>
          <linearGradient id="logo-grad-roadmap" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        <path d="M4 36L20 24L4 12L4 20L12 24L4 28L4 36Z" fill="#2563EB" />
        <path d="M12 36L28 24L12 12L12 18L18 24L12 30L12 36Z" fill="url(#logo-grad-roadmap)" />
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

export default RoadmapLogo;
