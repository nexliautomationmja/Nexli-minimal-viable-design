
import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ValueProposition from './components/ValueProposition';
import Testimonials from './components/Testimonials';
import ContactForm from './components/ContactForm';

const App: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <ValueProposition />
      <Testimonials />
      <ContactForm />
      <Navbar />
      
      <footer className="py-12 border-t border-white/5 bg-[#05010d]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-2xl font-bold tracking-tighter">LUMINA</div>
          <div className="flex gap-8 text-white/50 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
          <div className="text-white/30 text-sm">
            © 2026 Lumina Finance Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
