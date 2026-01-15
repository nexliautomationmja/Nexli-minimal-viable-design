
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Video } from 'lucide-react';

const BookingSection: React.FC = () => {
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
    Cal("init", "nexli-demo", { origin: "https://app.cal.com" });

    Cal.ns["nexli-demo"]("inline", {
      elementOrSelector: "#my-cal-inline-nexli-demo",
      config: { "layout": "month_view", "theme": "dark" },
      calLink: "nexli-automation-6fgn8j/nexli-demo",
    });

    Cal.ns["nexli-demo"]("ui", { "theme": "dark", "hideEventTypeDetails": false, "layout": "month_view" });
  }, []);

  return (
    <section className="py-32 bg-[#020617]" id="book">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20"
          >
            <span className="text-blue-400 text-xs font-black tracking-[0.2em] uppercase">The First Step</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, ease: "circOut" }}
            className="text-white mb-6"
          >
            Book Your <span className="text-blue-500">Strategy Session</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/40 max-w-2xl mx-auto text-lg"
          >
            In 30 minutes, we'll audit your current systems and map out a high-performance roadmap tailored to your RIA or practice.
          </motion.p>
        </div>

        {/* What to Expect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          {[
            { icon: <Video className="text-blue-400" size={20} />, title: "Digital Governance", sub: "Secure Face-to-Face" },
            { icon: <Clock className="text-blue-400" size={20} />, title: "30-Min Audit", sub: "Focused & Strategic" },
            { icon: <Calendar className="text-blue-400" size={20} />, title: "Direct Calendar", sub: "Zero Friction" }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-5 p-6 glass-card rounded-3xl border border-white/5 group hover:border-blue-500/20 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500/20 transition-all">
                {item.icon}
              </div>
              <div>
                <div className="text-white font-bold text-base">{item.title}</div>
                <div className="text-white/30 text-[10px] font-black uppercase tracking-widest">{item.sub}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Cal.com Embed Container */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-[48px] overflow-hidden border border-white/10 shadow-3xl"
        >
          <div
            style={{ width: '100%', height: '700px', overflow: 'auto' }}
            id="my-cal-inline-nexli-demo"
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-white/20 text-[10px] font-black uppercase tracking-[0.2em] mt-12"
        >
          Confidentiality Guaranteed • High-Net-Worth Specialist
        </motion.p>
      </div>
    </section>
  );
};

export default BookingSection;
