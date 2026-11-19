'use client';

// ---------------------------------------------------------------------------
// The gold star (Marcel, 2026-11-16: "a gold animated star that makes it
// really stand out"). It sat on the annual plan's bonus on /math; since
// 2026-11-19 it marks the six-month prepay's saving there, and it decorates
// the tax-planning tool's summary.
//
// A five-point star in a gold gradient that tilts and breathes, a pulsing
// gold glow behind it, and three sparkles that twinkle in turn. It holds
// still, fully drawn, in the PDF (usePrint) and for anyone who asks the OS
// for reduced motion, so nothing is ever caught mid-animation on paper.
//
// BONUS_SHEEN_CSS is the slow light sweep across the gold block it sits
// with: a CSS animation, so it is gated on prefers-reduced-motion itself.
// ---------------------------------------------------------------------------
import { useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { usePrint } from './print';

const STAR = 'M12 1.6l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.4l-6.2 3.3L7 13.8 2 8.9l6.9-1L12 1.6z';
const SPARKLE = 'M12 0c.6 6.6 5.4 11.4 12 12-6.6.6-11.4 5.4-12 12-.6-6.6-5.4-11.4-12-12C6.6 11.4 11.4 6.6 12 0z';

/** Where the sparkles sit, as a share of the star's box. */
const SPARKLES = [
  { left: '-14%', top: '6%', size: 0.3, delay: 0 },
  { left: '84%', top: '-10%', size: 0.24, delay: 0.6 },
  { left: '88%', top: '70%', size: 0.2, delay: 1.2 },
];

export const BONUS_SHEEN_CSS = `
@keyframes bonus-sheen {
  0% { transform: translateX(-160%) skewX(-20deg); }
  55%, 100% { transform: translateX(360%) skewX(-20deg); }
}
.bonus-sheen::after {
  content: '';
  position: absolute;
  inset: 0;
  width: 35%;
  pointer-events: none;
  background: linear-gradient(90deg, transparent, rgba(255, 247, 214, 0.28), transparent);
  transform: translateX(-160%) skewX(-20deg);
}
@media (prefers-reduced-motion: no-preference) {
  .bonus-sheen::after { animation: bonus-sheen 4.2s ease-in-out infinite; }
}
`;

export default function BonusStar({ size = 64, className = '' }: { size?: number; className?: string }) {
  const reduce = useReducedMotion();
  const print = usePrint();
  const still = reduce || print;
  const gradient = `bonus-star-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <span aria-hidden="true" className={`relative inline-block shrink-0 ${className}`} style={{ width: size, height: size }}>
      <motion.span
        className="absolute rounded-full"
        style={{
          inset: '-35%',
          background: 'radial-gradient(circle, rgba(251,191,36,0.5) 0%, rgba(251,191,36,0.18) 40%, rgba(251,191,36,0) 68%)',
        }}
        initial={{ opacity: 0.85, scale: 1 }}
        animate={still ? undefined : { opacity: [0.55, 1, 0.55], scale: [0.92, 1.12, 0.92] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.svg
        viewBox="0 0 24 24"
        className="absolute inset-0 h-full w-full"
        style={{ filter: 'drop-shadow(0 3px 10px rgba(245,158,11,0.55))' }}
        initial={{ rotate: 0, scale: 1 }}
        animate={still ? undefined : { rotate: [-7, 7, -7], scale: [1, 1.08, 1] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <defs>
          <linearGradient id={gradient} x1="0.15" y1="0" x2="0.85" y2="1">
            <stop offset="0%" stopColor="#FFF7D6" />
            <stop offset="38%" stopColor="#FCD34D" />
            <stop offset="72%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
        </defs>
        <path d={STAR} fill={`url(#${gradient})`} stroke="#FEF3C7" strokeWidth="0.55" strokeLinejoin="round" />
        {/* A soft highlight on the upper-left arms, so it reads as metal. */}
        <path d="M12 3.4l2.4 4.9-4.6.5L12 3.4z" fill="#FFFBEB" opacity="0.55" />
      </motion.svg>
      {SPARKLES.map((s) => (
        <motion.svg
          key={s.left + s.top}
          viewBox="0 0 24 24"
          className="absolute"
          style={{ left: s.left, top: s.top, width: size * s.size, height: size * s.size }}
          initial={{ opacity: still ? 0.9 : 0, scale: still ? 1 : 0.4 }}
          animate={still ? undefined : { opacity: [0, 1, 0], scale: [0.4, 1, 0.4], rotate: [0, 45, 90] }}
          transition={{ duration: 1.9, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
        >
          <path d={SPARKLE} fill="#FEF3C7" />
        </motion.svg>
      ))}
    </span>
  );
}
