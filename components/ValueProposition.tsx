
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Globe } from 'lucide-react';

const propositions = [
  {
    id: "01",
    title: "Uncompromising Security",
    description: "Multi-layer encryption and biometric verification protect every single transaction you make. Sleep easy knowing your assets are secure.",
    icon: <Shield className="text-orange-500" size={32} />,
    color: "from-orange-500/20"
  },
  {
    id: "02",
    title: "Instant Global Transfers",
    description: "Send money across continents in milliseconds. Our proprietary ledger system bypasses traditional banking delays.",
    icon: <Zap className="text-blue-500" size={32} />,
    color: "from-blue-500/20"
  },
  {
    id: "03",
    title: "Unified Asset Control",
    description: "Crypto, fiat, and stocks in one clean interface. No more switching apps to see your true net worth.",
    icon: <Globe className="text-green-500" size={32} />,
    color: "from-green-500/20"
  }
];

const ValueProposition: React.FC = () => {
  return (
    <section className="py-32 bg-[#05010d]" id="personal">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-20">
          <span className="text-orange-500 font-bold tracking-widest text-sm uppercase">The Core</span>
          <h2 className="text-white mt-4 max-w-2xl">Coupled with <br />intelligent tools</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {propositions.map((prop, idx) => (
            <motion.div
              key={prop.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className={`glass-card p-10 rounded-[32px] flex flex-col h-full bg-gradient-to-b ${prop.color} to-transparent`}
            >
              <div className="text-5xl font-black text-white/5 mb-6">{prop.id}</div>
              <div className="mb-6">{prop.icon}</div>
              <h3 className="text-2xl font-bold text-white mb-4">{prop.title}</h3>
              <p className="text-white/60 leading-relaxed mb-8 flex-grow">
                {prop.description}
              </p>
              <button className="text-orange-500 font-semibold flex items-center gap-2 group">
                Learn more 
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ChevronRight = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export default ValueProposition;
