import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center pt-20 md:pt-24 pb-0 overflow-hidden bg-[var(--bg-main)]">
      {/* Cinematic Video Background - Seamlessly Blended */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {/* Topography Matching Layer: Dimming to ensure text contrast */}
        <div className="absolute inset-0 bg-[var(--bg-main)]/40 dark:bg-[#020617]/40 z-20" />

        {/* The 3D Animated Video - Responsive */}
        <div className="w-full h-full relative">
          {/* Desktop Video */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="hidden md:block w-full h-full object-cover mix-blend-screen dark:mix-blend-screen opacity-90 scale-105"
          >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>

          {/* Mobile Video - Using same source for now as mobile asset was empty */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="block md:hidden w-full h-full object-cover mix-blend-screen dark:mix-blend-screen opacity-95"
          >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Professional Edge Blending (Top & Bottom Vignettes) */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[var(--bg-main)] to-transparent z-30" />
        <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-[var(--bg-main)] to-transparent z-30" />

        {/* Outer Vignette for focal focus */}
        <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(2,6,23,0.5)] dark:shadow-[inset_0_0_150px_rgba(2,6,23,1)] z-30" />
      </div>

      {/* Hero Content Section - Layered on Top */}
      <div className="max-w-4xl mx-auto px-6 w-full flex flex-col items-center text-center relative z-40">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-4 mb-8 md:mb-10 px-5 py-2.5 rounded-full bg-blue-500/5 border border-blue-500/10 backdrop-blur-md shadow-[0_0_30px_rgba(59,130,246,0.05)]"
        >
          {/* Avatar Stack */}
          <div className="flex -space-x-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="relative">
                <div className="w-8 h-8 rounded-full border-2 border-[var(--bg-main)] overflow-hidden">
                  <img
                    src={`/Founder Photos/Founder ${i}.PNG`}
                    alt={`Active Searcher ${i}`}
                    className="w-full h-full object-cover object-[center_20%]"
                  />
                </div>
                {/* Pulsing Status Dot */}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[var(--bg-main)]">
                  <motion.span
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                    className="absolute inset-0 bg-green-400 rounded-full"
                  />
                </span>
              </div>
            ))}
          </div>

          <span className="text-white text-[10px] md:text-sm font-bold tracking-tight">
            Every 8 seconds, a high-net-worth client searches for an advisor online.
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-white mb-6 md:mb-8 text-[28px] sm:text-5xl md:text-7xl font-bold tracking-tight px-4 leading-[1.2] md:leading-[1.1]"
        >
          Your Website Is <span className="text-blue-500">Costing You</span><br className="hidden sm:block" />
          Your Dream Clients.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="text-white/80 text-sm md:text-xl font-medium max-w-2xl mb-10 md:mb-12 drop-shadow-lg px-4"
        >
          Referrals won't save you forever. Prospects don't see your expertise — they see your homepage. We fix that gap.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-5 w-auto"
        >
          <a
            href="#book"
            className="flex items-center justify-center gap-2 md:gap-3 bg-blue-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-full text-sm font-bold md:font-bold hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-blue-600/20 group backdrop-blur-sm"
          >
            Book Consultation
            <ArrowRight size={16} className="md:size-[18px] group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="#solutions"
            className="flex items-center justify-center gap-2 md:gap-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-main)] px-6 md:px-8 py-3 md:py-4 rounded-full text-sm font-bold md:font-bold hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-md"
          >
            Our Solutions
            <ArrowRight size={16} className="md:size-[18px]" />
          </a>
        </motion.div>
      </div>

    </section>
  );
};

export default Hero;
