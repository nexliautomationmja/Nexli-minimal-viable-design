
import React from 'react';
import { motion } from 'framer-motion';

const Testimonials: React.FC = () => {
  return (
    <section className="relative py-32 overflow-hidden bg-[#0a0614]">
      {/* Background with stylized image overlay */}
      <div className="absolute inset-0 opacity-20">
        <img 
          src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=2000&q=80" 
          className="w-full h-full object-cover"
          alt="Abstract tech background"
        />
        <div className="absolute inset-0 bg-[#05010d]/80" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-white mb-6">Hear it from our clients</h2>
          <p className="text-white/50 max-w-xl mx-auto">Join over 1 million users worldwide who have revolutionized their financial lives with Lumina.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: "Vamsi K.", initials: "VK", color: "#BCFFBB", text: "Very happy with the app. Does what it says, simple payments and transactions. 24/7 support is elite." },
            { name: "Leonie A.", initials: "LA", color: "#BBD2FF", text: "Awesome app, very user friendly. Would highly recommend to any frequent traveler." },
            { name: "Karl R.", initials: "KR", color: "#F5FFBB", text: "The best payment solution for European customers. verifying my account took less than 5 minutes." },
            { name: "Dennis P.", initials: "DP", color: "#FFBBF0", text: "Great app for fast and easy transfers. I use the virtual card for all my online subscriptions now." }
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="glass-card p-8 rounded-3xl"
            >
              <p className="text-white/80 italic mb-8 leading-relaxed">"{item.text}"</p>
              <div className="flex items-center gap-4">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-black"
                  style={{ backgroundColor: item.color }}
                >
                  {item.initials}
                </div>
                <div className="text-white font-medium">{item.name}</div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-24 text-center">
          <div className="inline-block p-[1px] rounded-full bg-gradient-to-r from-orange-500 to-purple-600">
            <div className="bg-[#05010d] rounded-full px-8 py-3 text-white/70 font-medium">
              Trusted by <span className="text-white font-bold">Fortune 500</span> partners globally
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
