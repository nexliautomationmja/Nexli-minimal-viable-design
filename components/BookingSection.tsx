import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Video } from 'lucide-react';

import { useTheme } from '../App';

const BookingSection: React.FC = () => {
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Load Cal.com embed script
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
    // Use column_view for mobile (more touch-friendly), month_view for desktop
    const layout = isMobile ? "column_view" : "month_view";

    Cal("init", "nexli-demo", { origin: "https://app.cal.com" });

    Cal.ns["nexli-demo"]("inline", {
      elementOrSelector: "#my-cal-inline-nexli-demo",
      config: { "layout": layout, "theme": theme },
      calLink: "nexli-automation-6fgn8j/nexli-demo",
    });

    Cal.ns["nexli-demo"]("ui", { "theme": theme, "hideEventTypeDetails": false, "layout": layout });
  }, [theme, isMobile]);

  return (
    <section className="py-12 md:py-32 bg-[var(--bg-main)] transition-colors duration-300" id="book">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12 md:mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 mb-4 md:mb-6 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20"
          >
            <span className="text-blue-400 text-[9px] md:text-xs font-black tracking-[0.2em] uppercase">The First Step</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, ease: "circOut" }}
            className="text-[var(--text-main)] mb-4 md:mb-6 text-2xl md:text-5xl font-bold"
          >
            Book Your <span className="text-blue-500">Strategy Session</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[var(--text-muted)] max-w-2xl mx-auto text-sm md:text-lg px-4"
          >
            In 30 minutes, we'll audit your current systems and map out a high-performance roadmap tailored to your RIA or practice.
          </motion.p>
        </div>

        {/* What to Expect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-8 mb-10 md:mb-16"
        >
          {[
            { icon: <Video className="text-blue-400" size={20} />, title: "Digital Governance", sub: "Secure Face-to-Face" },
            { icon: <Clock className="text-blue-400" size={20} />, title: "30-Min Audit", sub: "Focused & Strategic" },
            { icon: <Calendar className="text-blue-400" size={20} />, title: "Direct Calendar", sub: "Zero Friction" }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 md:gap-5 p-4 md:p-6 glass-card rounded-xl md:rounded-3xl border border-[var(--glass-border)] group hover:border-blue-500/20 transition-all">
              <div className="w-9 h-9 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500/20 transition-all">
                {React.cloneElement(item.icon as React.ReactElement, { size: 16 })}
              </div>
              <div>
                <div className="text-[var(--text-main)] font-bold text-xs md:text-base">{item.title}</div>
                <div className="text-[var(--text-muted)] opacity-50 text-[8px] md:text-[10px] font-black uppercase tracking-widest">{item.sub}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Cal.com Embed Container */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-xl md:rounded-[48px] overflow-hidden border border-[var(--glass-border)] shadow-3xl"
          style={isMobile ? { transform: 'scale(0.9)', transformOrigin: 'top center' } : {}}
        >
          <div
            style={{
              width: '100%',
              height: isMobile ? '550px' : 'calc(100vh - 300px)',
              minHeight: isMobile ? '550px' : '500px',
              maxHeight: isMobile ? '550px' : '800px',
              overflow: 'hidden'
            }}
            id="my-cal-inline-nexli-demo"
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-[var(--text-muted)] text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mt-8 md:mt-12"
        >
          Confidentiality Guaranteed • High-Net-Worth Specialist
        </motion.p>
      </div>
    </section>
  );
};

export default BookingSection;
