import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight, Sun, Moon } from 'lucide-react';
import { useTheme } from '../App';

interface NavbarProps {
  setView: (view: 'home' | 'privacy' | 'terms' | 'guide' | 'services' | 'blog' | 'blogPost') => void;
  currentView: 'home' | 'privacy' | 'terms' | 'guide' | 'services' | 'blog' | 'blogPost';
}

const Navbar: React.FC<NavbarProps> = ({ setView, currentView }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { label: 'Client Feedback', id: 'complaints', view: 'home' as const },
    { label: 'Brand Audit', id: 'brand-audit', view: 'home' as const },
    { label: 'Services', view: 'services' as const },
    { label: 'Blog', view: 'blog' as const },
    { label: 'Free Guide', view: 'guide' as const },
  ];

  const handleNavClick = (link: typeof navLinks[0]) => {
    setIsOpen(false);
    if (link.id) {
      setView('home');
      setTimeout(() => document.getElementById(link.id!)?.scrollIntoView({ behavior: 'smooth' }), 100);
    } else {
      setView(link.view);
    }
  };

  return (
    <>
      {/* Desktop Logo - Top Left */}
      <div className="fixed top-8 left-8 z-[110] hidden md:block">
        <button
          onClick={() => setView('home')}
          className={`flex items-center gap-2 group cursor-pointer backdrop-blur-md px-4 py-2 rounded-full border no-underline transition-colors duration-300 ${theme === 'dark'
            ? 'bg-black/20 border-white/5'
            : 'bg-[var(--glass-bg)] border-[var(--glass-border)]'
            }`}
        >
          {theme === 'dark' ? (
            <svg className="w-8 h-8" viewBox="0 0 48 48" fill="none">
              <defs>
                <linearGradient id="logo-grad-nav" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2563EB"></stop>
                  <stop offset="100%" stopColor="#06B6D4"></stop>
                </linearGradient>
              </defs>
              <path d="M4 36L20 24L4 12L4 20L12 24L4 28L4 36Z" fill="#2563EB"></path>
              <path d="M12 36L28 24L12 12L12 18L18 24L12 30L12 36Z" fill="url(#logo-grad-nav)"></path>
              <path d="M20 36L44 24L20 12L20 18L32 24L20 30L20 36Z" fill="#06B6D4"></path>
            </svg>
          ) : (
            <img
              src="/logos/icon-light.svg"
              alt="Nexli"
              className="w-8 h-8"
            />
          )}
          <span className="text-xl font-black tracking-tighter text-[var(--text-main)]" style={{ fontFamily: "'Syne', sans-serif" }}>NEXLI</span>
        </button>
      </div>

      {/* Floating Center Nav - Combined for Desktop and Mobile Expansion */}
      <div className="fixed top-6 md:top-8 left-1/2 -translate-x-1/2 z-[100] w-[90%] md:w-max">
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "circOut" }}
          className={`glass-nav flex flex-col md:flex-row items-center p-2 gap-2 md:gap-6 rounded-[2rem] md:rounded-full shadow-2xl px-4 md:px-6 transition-all duration-500 overflow-hidden ${isOpen ? 'max-h-[500px]' : 'max-h-[64px] md:max-h-none'}`}
        >
          {/* Main Bar (Items visible at all times) */}
          <div className="w-full flex items-center justify-between md:justify-start gap-4 md:gap-6">

            {/* Mobile Logo Identification */}
            <button
              onClick={() => { setIsOpen(false); setView('home'); }}
              className={`flex md:hidden items-center gap-2 group cursor-pointer backdrop-blur-md px-3 py-1.5 rounded-full border no-underline transition-colors duration-300 ${theme === 'dark'
                ? 'bg-black/20 border-white/5'
                : 'bg-[var(--glass-bg)] border-[var(--glass-border)]'
                }`}
            >
              {theme === 'dark' ? (
                <svg className="w-6 h-6" viewBox="0 0 48 48" fill="none">
                  <defs>
                    <linearGradient id="logo-grad-mobile" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#2563EB"></stop>
                      <stop offset="100%" stopColor="#06B6D4"></stop>
                    </linearGradient>
                  </defs>
                  <path d="M4 36L20 24L4 12L4 20L12 24L4 28L4 36Z" fill="#2563EB"></path>
                  <path d="M12 36L28 24L12 12L12 18L18 24L12 30L12 36Z" fill="url(#logo-grad-mobile)"></path>
                  <path d="M20 36L44 24L20 12L20 18L32 24L20 30L20 36Z" fill="#06B6D4"></path>
                </svg>
              ) : (
                <img
                  src="/logos/icon-light.svg"
                  alt="Nexli"
                  className="w-6 h-6"
                />
              )}
              <span className="text-sm font-black tracking-tighter text-[var(--text-main)]" style={{ fontFamily: "'Syne', sans-serif" }}>NEXLI</span>
            </button>

            {/* Desktop Links (Hidden on mobile) */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link)}
                  className={`text-sm tracking-tight transition-all bg-transparent border-none p-0 px-3 py-1 rounded-full ${(link.view === currentView && link.view !== 'home')
                    ? 'text-blue-500 bg-blue-500/10 font-bold'
                    : 'text-[var(--text-muted)] font-semibold hover:text-[var(--text-main)]'
                    }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all duration-300"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <button
                onClick={() => { setIsOpen(false); setView('home'); setTimeout(() => document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
                className="bg-blue-600 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full text-[10px] md:text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap"
              >
                Book Now
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors focus:outline-none"
              >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Expanded Mobile Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="w-full flex md:hidden flex-col pt-4 pb-4 border-t border-[var(--glass-border)]"
              >
                {navLinks.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => handleNavClick(link)}
                    className={`flex items-center justify-between py-3.5 px-2 rounded-xl text-left transition-colors ${(link.view === currentView && link.view !== 'home')
                      ? 'bg-blue-500/10 text-blue-500 font-bold text-lg'
                      : 'text-[var(--text-main)] text-base font-semibold'
                      }`}
                  >
                    {link.label}
                    <ChevronRight size={16} className="text-[var(--text-muted)] opacity-50" />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      </div>
    </>
  );
};

export default Navbar;
