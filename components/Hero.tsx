
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#020617]">
      {/* Background Refinements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_30%,#1e3a8a33_0%,transparent_70%)]" />
        <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_80%,#1e40af22_0%,transparent_70%)]" />
        {/* Subtle Grid */}
        <div className="absolute inset-0 opacity-[0.03] select-none pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center pt-32 pb-24 relative z-10">
        <div>
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]"
          >
            <TrendingUp size={14} className="text-blue-400" />
            <span className="text-blue-400 text-xs font-bold tracking-widest uppercase">
              The Standard for Wealth Managers
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-white mb-8"
          >
            Your Returns Are <span className="text-blue-500">Exceptional.</span><br />
            Your Website Should Match.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="text-white/60 text-xl font-medium max-w-lg mb-12"
          >
            High-net-worth clients expect more than "good enough." We build digital experiences and automations that match the caliber of service you provide.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-wrap gap-5"
          >
            <a
              href="#book"
              className="flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-full font-bold hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-blue-600/20 group"
            >
              Book Consultation
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#solutions"
              className="flex items-center gap-3 bg-white/5 border border-white/10 text-white px-8 py-4 rounded-full font-bold hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-md"
            >
              Our Solutions
              <ArrowRight size={18} />
            </a>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 pt-8 border-t border-white/5 flex items-center gap-8"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#020617] bg-blue-900 flex items-center justify-center text-[10px] font-black text-blue-200">
                  {['RIA', 'CFP', 'WM', 'FA'][i - 1]}
                </div>
              ))}
            </div>
            <div className="text-xs font-semibold tracking-wide text-white/40 uppercase">
              Trusted by Elite Managers<br />
              <span className="text-white/80">Generating $100K+/Month</span>
            </div>
          </motion.div>
        </div>

        {/* 3D Coin Animation Container */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-blue-500/10 blur-[120px] rounded-full animate-pulse" />

          {/* Animated 3D Coin Objects */}
          <div className="coin-drop-container">
            {/* cinematic 3D Coin Circle - 8 Major Assets */}
            <div className="coin-circle-wrap">
              {[
                { id: 'btc', color: '#F7931A', icon: <svg viewBox="0 0 24 24" className="w-10 h-10 fill-current aspect-square"><path d="M23.638 14.904c-1.232 4.943-6.261 7.962-11.204 6.728-4.944-1.235-7.962-6.262-6.728-11.205C6.942 3.486 11.97.466 16.913 1.7c4.944 1.234 7.962 6.262 6.725 11.204zm-4.322-2.31c.232-1.554-.946-2.39-2.558-2.946l.523-2.1-1.278-.318-.51 2.043c-.337-.083-.68-.163-1.022-.244l.512-2.053-1.278-.318-.523 2.1c-.278-.063-.55-.125-.815-.19l.002-.007-1.763-.44-.34 1.366s.95.218.928.23c.518.13.613.473.596.745l-.597 2.395c.036.01.082.023.133.045l-.134-.033-.837 3.357c-.063.158-.224.394-.585.304.01.016-.928-.231-.928-.231l-.634 1.463 1.664.415c.31.077.613.158.913.232l-.527 2.115 1.278.318.524-2.102c.348.095.688.183 1.02.268l-.52 2.083 1.278.318.53-2.127c2.18.413 3.82.246 4.512-1.725.556-1.587-.028-2.503-1.173-3.098.835-.193 1.46-.74 1.636-1.87zm-2.942 4.098c-.395 1.587-3.064.73-3.93.513l.7-2.812c.867.216 3.645 1 body.54.3.54 3.23-.74 2.299zm.395-4.114c-.36 1.442-2.583.71-3.303.53l.636-2.55c.72.18 3.04.515 2.667 2.02z" /></svg> },
                { id: 'eth', color: '#627EEA', icon: <svg viewBox="0 0 24 24" className="w-10 h-10 fill-current aspect-square"><path d="M12 1.75l-4.25 7.086 4.25 1.91 4.25-1.91L12 1.75zM7.75 10.746L12 13.08v5.17l-4.25-2.618v-4.886zm8.5 0v4.886l-4.25 2.618v-5.17l4.25-2.334z" /></svg> },
                { id: 'aapl', color: '#FFFFFF', icon: <svg viewBox="0 0 24 24" className="w-10 h-10 fill-current aspect-square"><path d="M13.234 3.737c.797-.991 1.332-2.37 1.185-3.737-1.168.047-2.576.78-3.414 1.764-.75.865-1.405 2.29-1.22 3.615 1.303.102 2.651-.652 3.449-1.642zm-2.028 1.94c-1.914 0-3.536 1.144-4.508 2.37-1.222 1.545-1.833 3.805-1.833 6.002 0 3.391 1.639 6.442 4.085 6.442 1.146 0 2.146-.664 3.448-.664 1.259 0 2.204.664 3.424.664 2.155 0 4.015-3.018 4.015-4.305 0-.053-.027-.101-.064-.132a.167.167 0 0 0-.109-.035c-2.333-.311-3.662-3.134-3.662-5.111 0-1.802 1.253-4.246 4.29-5.148a.222.222 0 0 0 .153-.204c-.012-3.149-2.388-3.64-3.424-3.64l-.324.008c-1.189.043-2.038.547-3.491.547-1.42 0-2.396-.494-3.641-.494z" /></svg> },
                { id: 'tsla', color: '#E31937', icon: <svg viewBox="0 0 24 24" className="w-10 h-10 fill-current aspect-square"><path d="M22.84 0l-10 17.14L3.16 0h19.68zM12.84 19.14L24 0H1.68L12.84 19.14zM12 24l-3-5.14h6L12 24z" /></svg> },
                { id: 'nvda', color: '#76B900', icon: <svg viewBox="0 0 24 24" className="w-10 h-10 fill-current aspect-square"><path d="M12 0c6.627 0 12 5.373 12 12s-5.373 12-12 12-12-5.373-12-12 5.373-12 12-12zm0 2c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10-4.477-10-10-10zm0 3c3.866 0 7 3.134 7 7s-3.134 7-7 7-7-3.134-7-7 3.134-7 7-7zm0 2c-2.761 0-5 2.239-5 5s2.239 5 5 5 5-2.239 5-5-2.239-5-5-5z" /></svg> },
                { id: 'goog', color: '#4285F4', icon: <svg viewBox="0 0 24 24" className="w-10 h-10 fill-current aspect-square"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" /></svg> },
                { id: 'amzn', color: '#FF9900', icon: <svg viewBox="0 0 24 24" className="w-10 h-10 fill-current aspect-square"><path d="M18.704 15.341c-2.316 1.636-5.836 2.457-8.139 2.457-3.15 0-5.836-.821-7.056-2.457l-.558.46c1.395 1.802 4.464 2.819 7.614 2.819 2.511 0 6.096-.82 8.412-2.52l.279.713h1.395v-3.72h-4.464v.713l1.116.279.399.256v.001zM23 12c.005 6.075-4.92 11-11 11S1 18.075 1 12 5.925 1 12 1s11 4.925 11 11zm-1-7.778c-2.316-2.316-5.385-3.504-8.454-3.504-3.069 0-6.138 1.188-8.455 3.504-4.631 4.631-4.631 12.278 0 16.909 2.316 2.316 5.385 3.504 8.455 3.504 3.069 0 6.138-1.188 8.454-3.504 4.631-4.631 4.631-12.278 0-16.909z" /></svg> },
                { id: 'msft', color: '#00A4EF', icon: <svg viewBox="0 0 24 24" className="w-10 h-10 fill-current aspect-square"><path d="M1 1h10v10H1V1zm12 0h10v10H13V1zM1 13h10v10H1V13zm12 0h10v10H13V13z" /></svg> }
              ].map((item, i) => (
                <div
                  key={item.id}
                  className="heavy-metal-coin group"
                  style={{
                    transform: `rotateY(${i * 45}deg) translateZ(320px) rotateY(-${i * 45}deg) rotateX(-15deg)`,
                  }}
                >
                  <div className="coin-side coin-depth-1" />
                  <div className="coin-side coin-depth-2" />
                  <div className="coin-side coin-depth-3" />
                  <div className="coin-side coin-depth-4" />
                  <div className="coin-side coin-depth-5" />
                  <div className="coin-side coin-depth-6" />

                  {/* Front Face */}
                  <div className="coin-face">
                    <div
                      className="transition-all duration-500 group-hover:scale-110 flex items-center justify-center w-full h-full"
                      style={{ color: item.color, filter: `drop-shadow(0 0 10px ${item.color}66)` }}
                    >
                      {item.icon}
                    </div>
                  </div>

                  {/* Back Face */}
                  <div className="coin-face coin-face-back">
                    <div
                      className="transition-all duration-500 group-hover:scale-110 flex items-center justify-center w-full h-full"
                      style={{ color: item.color, filter: `drop-shadow(0 0 10px ${item.color}66)` }}
                    >
                      {item.icon}
                    </div>
                  </div>

                  <div className="coin-glow" style={{ background: `radial-gradient(circle, ${item.color}22 0%, transparent 70%)` }} />
                </div>
              ))}
            </div>

            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                key={i}
                className="coin-drop"
                style={{
                  animationDelay: `${i * 0.8}s`,
                  left: `${10 + Math.random() * 80}%`,
                  width: `${16 + Math.random() * 12}px`,
                  height: `${16 + Math.random() * 12}px`,
                  opacity: 0.3
                }}
              />
            ))}

            {/* Centerpiece - Nexli Breakthrough Symbol (Heavy Metal Version) */}
            <motion.div
              animate={{
                rotateY: 360,
                y: [0, -20, 0]
              }}
              transition={{
                rotateY: { duration: 20, repeat: Infinity, ease: "linear" },
                y: { duration: 8, repeat: Infinity, ease: "easeInOut" }
              }}
              className="w-72 h-72 rounded-full relative"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute inset-0 heavy-metal-coin w-full h-full scale-125">
                <div className="coin-side coin-depth-1" />
                <div className="coin-side coin-depth-2" />
                <div className="coin-side coin-depth-3" />
                <div className="coin-side coin-depth-4" />
                <div className="coin-side coin-depth-5" />
                <div className="coin-side coin-depth-6 opacity-50" />

                {/* Front Face */}
                <div className="coin-face">
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <svg className="w-24 h-24 drop-shadow-[0_0_15px_rgba(59,130,246,0.6)] aspect-square" viewBox="0 0 48 48" fill="none">
                      <path d="M24 4L4 14V34L24 44L44 34V14L24 4Z" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round" />
                      <path d="M24 14L10 21V27L24 34L38 27V21L24 14Z" fill="#3b82f6" fillOpacity="0.3" stroke="#3b82f6" strokeWidth="2" />
                      <path d="M24 20L18 23V25L24 28L30 25V23L24 20Z" fill="#3b82f6" />
                    </svg>
                  </div>
                </div>

                {/* Back Face */}
                <div className="coin-face coin-face-back">
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <svg className="w-24 h-24 drop-shadow-[0_0_15px_rgba(59,130,246,0.6)] aspect-square" viewBox="0 0 48 48" fill="none">
                      <path d="M24 4L4 14V34L24 44L44 34V14L24 4Z" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round" />
                      <path d="M24 14L10 21V27L24 34L38 27V21L24 14Z" fill="#3b82f6" fillOpacity="0.3" stroke="#3b82f6" strokeWidth="2" />
                      <path d="M24 20L18 23V25L24 28L30 25V23L24 20Z" fill="#3b82f6" />
                    </svg>
                  </div>
                </div>

                <div className="coin-glow" style={{ background: 'radial-gradient(circle, rgba(37, 99, 235, 0.4) 0%, transparent 80%)' }} />
              </div>
            </motion.div>

            {/* Cinematic Stage Glow / Podium Base */}
            <div className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 w-[1000px] h-[400px] pointer-events-none z-[-1]">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.15)_0%,transparent_70%)]" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent shadow-[0_0_50px_rgba(37,99,235,0.8)]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full" />
            </div>
          </div>

          {/* Floating Floating Stat Cards */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.8, ease: "circOut" }}
            className="absolute top-[5%] -right-12 glass-card p-6 rounded-3xl border border-blue-500/20 shadow-2xl shadow-blue-500/10"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <div className="text-white/40 text-[10px] font-black tracking-widest uppercase">Live Beta Access</div>
            </div>
            <div className="text-blue-400 text-3xl font-black">+52.4%</div>
            <div className="text-white/20 text-[10px] font-bold tracking-wider uppercase mt-1">Efficiency Delta</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 1, ease: "circOut" }}
            className="absolute bottom-[15%] -left-4 glass-card p-6 rounded-3xl"
          >
            <div className="text-white text-3xl font-black mb-1">Elite</div>
            <div className="text-white/40 text-xs font-bold tracking-widest uppercase">Market Position</div>
          </motion.div>
        </div>
      </div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30 group"
      >
        <span className="text-[10px] font-black tracking-[0.3em] uppercase text-white group-hover:opacity-100 transition-opacity">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent" />
      </motion.div>
    </section>
  );
};

export default Hero;
