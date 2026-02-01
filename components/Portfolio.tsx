import React from 'react';
import { motion } from 'framer-motion';
import PortfolioPreview from './portfolio/PortfolioPreview';
import SummitTaxGroup from './portfolio/SummitTaxGroup';
import ClarityAdvisory from './portfolio/ClarityAdvisory';
import MeridianFinancial from './portfolio/MeridianFinancial';
import HarborWealth from './portfolio/HarborWealth';
import { BackgroundGradientAnimation } from './ui/BackgroundGradientAnimation';

interface PortfolioProps {
  onNavigateToFirm: (slug: string) => void;
}

const firms = [
  {
    title: 'Summit Tax Group',
    subtitle: 'CPA Firm',
    slug: 'summit-tax-group',
    accentColor: '#7c3aed',
    component: SummitTaxGroup,
  },
  {
    title: 'Clarity Advisory',
    subtitle: 'CPA Firm',
    slug: 'clarity-advisory',
    accentColor: '#d4a853',
    component: ClarityAdvisory,
  },
  {
    title: 'Meridian Financial',
    subtitle: 'Registered Investment Advisor',
    slug: 'meridian-financial',
    accentColor: '#f97316',
    component: MeridianFinancial,
  },
  {
    title: 'Harbor Wealth',
    subtitle: 'Wealth Management',
    slug: 'harbor-wealth',
    accentColor: '#84cc16',
    component: HarborWealth,
  },
];

const Portfolio: React.FC<PortfolioProps> = ({ onNavigateToFirm }) => {
  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      {/* Hero Section with Gradient Animation */}
      <section className="relative overflow-hidden">
        <BackgroundGradientAnimation
          gradientBackgroundStart="rgb(0, 17, 82)"
          gradientBackgroundEnd="rgb(2, 6, 23)"
          firstColor="59, 130, 246"
          secondColor="6, 182, 212"
          thirdColor="99, 102, 241"
          fourthColor="139, 92, 246"
          fifthColor="14, 165, 233"
          pointerColor="59, 130, 246"
          size="90%"
          blendingValue="hard-light"
          containerClassName="pt-32 pb-16 md:pt-40 md:pb-24"
        >
          <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="max-w-7xl mx-auto px-6 text-center">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm mb-8"
              >
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">
                  Our Work
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-white mb-6"
              >
                Websites that
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-aurora">
                  convert clients.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-base md:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed"
              >
                Premium digital experiences built for financial firms. Each project is
                crafted to reflect the caliber of service our clients provide.
              </motion.p>
            </div>
          </div>
        </BackgroundGradientAnimation>
      </section>

      {/* Portfolio Grid */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-32">
        <div className="grid grid-cols-2 gap-4 md:gap-8">
          {firms.map((firm, index) => (
            <motion.div
              key={firm.slug}
              className="w-full"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                duration: 0.7,
                delay: index * 0.15,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <PortfolioPreview
                title={firm.title}
                subtitle={firm.subtitle}
                slug={firm.slug}
                accentColor={firm.accentColor}
                onNavigate={onNavigateToFirm}
              >
                <firm.component />
              </PortfolioPreview>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mt-24"
        >
          <p className="text-[var(--text-muted)] text-sm font-semibold uppercase tracking-[0.2em] mb-4">
            Want a website like these?
          </p>
          <p className="text-[var(--text-muted)] text-base max-w-lg mx-auto mb-8">
            Every project is custom-designed. No templates, no shortcuts.
            Just premium digital experiences tailored to your firm.
          </p>
          <button
            onClick={() => {
              window.history.pushState({}, '', '/');
              window.location.reload();
            }}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Start Your Project
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </motion.div>
      </section>
    </div>
  );
};

export default Portfolio;
