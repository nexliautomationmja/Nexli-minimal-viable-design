
import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ValueProposition from './components/ValueProposition';
import Testimonials from './components/Testimonials';
import ContactForm from './components/ContactForm';
import BookingSection from './components/BookingSection';

const App: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <ValueProposition />
      <Testimonials />
      <ContactForm />
      <BookingSection />
      <Navbar />
      <footer className="py-20 border-t border-white/5 bg-[#020617] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,#1e3a8a11_0%,transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex items-center gap-3">
              <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
                <defs>
                  <linearGradient id="logo-grad-footer" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2563EB" />
                    <stop offset="100%" stopColor="#06B6D4" />
                  </linearGradient>
                </defs>
                <path d="M4 36L20 24L4 12L4 20L12 24L4 28L4 36Z" fill="#2563EB" />
                <path d="M12 36L28 24L12 12L12 18L18 24L12 30L12 36Z" fill="url(#logo-grad-footer)" />
                <path d="M20 36L44 24L20 12L20 18L32 24L20 30L20 36Z" fill="#06B6D4" />
              </svg>
              <span className="text-3xl font-black tracking-tighter text-white" style={{ fontFamily: "'Syne', sans-serif" }}>NEXLI</span>
            </div>
            <div className="flex gap-10 text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">
              <a href="#" className="hover:text-blue-500 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-blue-500 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-blue-500 transition-colors">Compliance</a>
            </div>
            <div className="text-white/20 text-[10px] font-black uppercase tracking-[0.2em]">
              © 2026 Nexli. High-End Automation for Elite Advisors.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
