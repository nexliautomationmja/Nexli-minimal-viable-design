import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useTheme } from '../App';
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
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    (function (C: any, A: string, L: string) {
      let p = function (a: any, ar: any) { a.q.push(ar); };
      let d = C.document;
      C.Cal = C.Cal || function () {
        let cal = C.Cal;
        let ar = arguments;
        if (!cal.loaded) {
          cal.ns = {};
          cal.q = cal.q || [];
          d.head.appendChild(d.createElement("script")).src = A;
          cal.loaded = true;
        }
        if (ar[0] === L) {
          const api = function () { p(api, arguments); };
          const namespace = ar[1];
          api.q = api.q || [];
          if (typeof namespace === "string") {
            cal.ns[namespace] = cal.ns[namespace] || api;
            p(cal.ns[namespace], ar);
            p(cal, ["initNamespace", namespace]);
          } else p(cal, ar);
          return;
        }
        p(cal, ar);
      };
    })(window, "https://app.cal.com/embed/embed.js", "init");

    const Cal = (window as any).Cal;
    Cal("init", "nexli-demo", { origin: "https://app.cal.com" });

    if (!isMobile) {
      Cal.ns["nexli-demo"]("inline", {
        elementOrSelector: "#portfolio-cal-inline",
        config: { "layout": "month_view", "theme": theme },
        calLink: "nexli-automation-6fgn8j/nexli-demo",
      });
      Cal.ns["nexli-demo"]("ui", { "theme": theme, "hideEventTypeDetails": false, "layout": "month_view" });
    }
  }, [isMobile, theme]);

  const openCalPopup = () => {
    const Cal = (window as any).Cal;
    if (Cal && Cal.ns && Cal.ns["nexli-demo"]) {
      Cal.ns["nexli-demo"]("modal", {
        calLink: "nexli-automation-6fgn8j/nexli-demo",
        config: { "layout": "month_view", "theme": theme },
      });
    }
  };

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
          containerClassName="min-h-[70vh] md:min-h-0 pt-32 pb-20 md:pt-40 md:pb-24"
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
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24"
        >
          <div className="max-w-4xl mx-auto p-6 md:p-16 rounded-[1.5rem] md:rounded-[3rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent pointer-events-none" />

            <div className="relative z-10 text-center">
              <h2 className="text-xl md:text-4xl font-bold text-[var(--text-main)] mb-4 md:mb-6">
                Want a Website Like These?
              </h2>
              <p className="text-sm md:text-lg text-[var(--text-muted)] mb-6 md:mb-10 max-w-2xl mx-auto">
                Every project is custom-designed. No templates, no shortcuts.
                Just premium digital experiences tailored to your firm.
              </p>

              {isMobile ? (
                <button
                  onClick={openCalPopup}
                  className="inline-flex items-center gap-2 md:gap-3 bg-blue-600 text-white px-6 md:px-10 py-3 md:py-5 rounded-full text-sm md:text-lg font-bold hover:bg-blue-500 hover:scale-105 transition-all shadow-xl shadow-blue-600/25 active:scale-95 group"
                >
                  Book a Consultation
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: 'calc(100vh - 300px)',
                    minHeight: '500px',
                    maxHeight: '800px',
                    overflow: 'auto',
                  }}
                  id="portfolio-cal-inline"
                />
              )}
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Portfolio;
