
import React from 'react';
import { motion } from 'framer-motion';
import { Home, ChevronRight } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <>
      <div className="fixed top-8 left-8 z-[100] hidden md:block">
        <div className="flex items-center gap-2 group cursor-pointer bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/5">
          <svg className="w-8 h-8" viewBox="0 0 48 48" fill="none">
            <defs>
              <linearGradient id="logo-grad-nav" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
            <path d="M4 36L20 24L4 12L4 20L12 24L4 28L4 36Z" fill="#2563EB" />
            <path d="M12 36L28 24L12 12L12 18L18 24L12 30L12 36Z" fill="url(#logo-grad-nav)" />
            <path d="M20 36L44 24L20 12L20 18L32 24L20 30L20 36Z" fill="#06B6D4" />
          </svg>
          <span className="text-xl font-black tracking-tighter text-white" style={{ fontFamily: "'Syne', sans-serif" }}>NEXLI</span>
        </div>
      </div>

      <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-max">
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "circOut" }}
          className="glass-nav flex items-center p-2 gap-6 rounded-full border border-white/10 shadow-2xl px-6"
        >
          <div className="flex items-center gap-8">
            <a href="#solutions" className="text-white/70 text-sm font-semibold hover:text-white transition-all tracking-tight">
              Solutions
            </a>
            <a href="#testimonials" className="text-white/70 text-sm font-semibold hover:text-white transition-all tracking-tight">
              Results
            </a>
            <a href="#calculator" className="text-white/70 text-sm font-semibold hover:text-white transition-all tracking-tight">
              Calculator
            </a>
          </div>

          <a
            href="#book"
            className="bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Book Now
          </a>
        </motion.nav>
      </div>
    </>
  );
};

export default Navbar;
