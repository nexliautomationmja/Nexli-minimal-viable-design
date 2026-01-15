
import React from 'react';
import { motion } from 'framer-motion';
import { Apple, Smartphone } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-[#05010d] via-[#1a0b2e] to-[#05010d]">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-orange-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-purple-600 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-20 pb-32">
        <div className="z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white font-bold mb-6"
          >
            One app for <br />
            <span className="text-orange-500 underline decoration-orange-500/30">all your needs</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white/70 text-lg md:text-xl max-w-lg mb-10 leading-relaxed"
          >
            A single account for all your payments, investments, and global transfers. Experience the future of unified finance.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap gap-4"
          >
            <button className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-white/90 transition-all">
              <Apple size={20} />
              App Store
            </button>
            <button className="flex items-center gap-2 bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all backdrop-blur-sm">
              <Smartphone size={20} />
              Google Play
            </button>
          </motion.div>
        </div>

        {/* Animated Coins Visual */}
        <div className="relative h-[400px] lg:h-[600px] flex items-center justify-center">
          <div className="coin-stack relative w-full h-full flex justify-center items-center">
            {[...Array(12)].map((_, i) => (
              <div 
                key={i} 
                className="coin" 
                style={{ 
                  marginTop: `${i * 15}px`, 
                  zIndex: 20 - i,
                  animationDelay: `${i * 0.1}s`,
                  opacity: 1 - (i * 0.05)
                }} 
              />
            ))}
          </div>
          
          {/* Decorative floating bits */}
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute top-20 right-20 w-12 h-12 bg-orange-500 rounded-lg blur-xl opacity-40"
          />
        </div>
      </div>
      
      <div className="absolute bottom-10 left-6 flex items-center gap-2 text-white/40 text-sm font-medium">
        <div className="w-1 h-8 bg-orange-500/20 rounded-full relative">
          <motion.div 
            animate={{ top: ['0%', '70%', '0%'] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-0 left-0 w-full h-2 bg-orange-500 rounded-full" 
          />
        </div>
        SCROLL
      </div>
    </section>
  );
};

export default Hero;
