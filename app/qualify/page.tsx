'use client';

import { useEffect } from 'react';
import { useBooking } from '@/components/QualificationProvider';

export default function QualifyPage() {
  const { openBooking } = useBooking();

  // Automatically open the qualification modal when the page loads
  useEffect(() => {
    openBooking();
  }, [openBooking]);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <svg className="w-16 h-16 md:w-20 md:h-20 mx-auto" viewBox="0 0 48 48" fill="none">
            <defs>
              <linearGradient id="logo-grad-qualify" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
            <path d="M4 36L20 24L4 12L4 20L12 24L4 28L4 36Z" fill="#2563EB" />
            <path d="M12 36L28 24L12 12L12 18L18 24L12 30L12 36Z" fill="url(#logo-grad-qualify)" />
            <path d="M20 36L44 24L20 12L20 18L32 24L20 30L20 36Z" fill="#06B6D4" />
          </svg>
          <h1
            className="text-3xl md:text-4xl font-black tracking-tighter text-white mt-4"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            NEXLI
          </h1>
        </div>

        {/* Heading */}
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          See If Your Firm Qualifies
        </h2>
        <p className="text-lg text-gray-400 mb-8">
          Answer 4 quick questions to see if you're eligible for a strategy call
        </p>

        {/* Loading state while modal opens */}
        <div className="inline-flex items-center gap-2 text-blue-400">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
}
