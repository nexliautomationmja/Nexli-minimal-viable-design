
import React from 'react';
import { motion } from 'framer-motion';
import { Home, User, Briefcase, Info, ChevronRight } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-max">
      <nav className="floating-nav flex items-center p-1.5 gap-1">
        <button className="flex items-center justify-center w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white">
          <Home size={20} />
        </button>
        
        <div className="flex items-center px-4 py-2 gap-6">
          <a href="#personal" className="text-white/90 text-sm font-medium hover:text-white transition-colors">Personal</a>
          <a href="#business" className="text-white/90 text-sm font-medium hover:text-white transition-colors flex items-center gap-1">
            Business <ChevronRight size={14} className="-rotate-45" />
          </a>
          <a href="#company" className="text-white/90 text-sm font-medium hover:text-white transition-colors">Company</a>
        </div>
        
        <button className="bg-white text-black px-6 py-2.5 rounded-full text-sm font-bold shadow-lg hover:scale-105 active:scale-95 transition-all">
          Sign Up
        </button>
      </nav>
    </div>
  );
};

export default Navbar;
