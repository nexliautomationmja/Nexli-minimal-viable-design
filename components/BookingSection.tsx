'use client';
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calendar, Clock, Video, ArrowRight } from 'lucide-react';
import { ADVISORY_PATH } from '@/lib/advisory-config';

const BookingSection: React.FC = () => {

  return (
    <section className="py-12 md:py-32 bg-[var(--bg-main)] transition-colors duration-300" id="book">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="text-center mb-8 md:mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 mb-4 md:mb-6 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20"
          >
            <span className="text-blue-400 text-[9px] md:text-xs font-black tracking-[0.2em] uppercase">Not every firm is a fit</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, ease: "circOut" }}
            className="text-[var(--text-main)] mb-4 md:mb-6 text-2xl md:text-5xl font-bold"
          >
            See If You Qualify For <span className="text-blue-500">Our Offer</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[var(--text-muted)] max-w-2xl mx-auto text-sm md:text-lg px-2"
          >
            Watch the short presentation first. It covers what the system is, what it costs and
            what it is built to produce — so if you do book, you are booking on the facts rather
            than on curiosity. The questions come after the video, and they take about a minute.
          </motion.p>
        </div>

        {/* What to Expect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-8 mb-8 md:mb-16"
        >
          {[
            { icon: <Video className="text-blue-400" size={20} />, title: "Watch The Presentation", sub: "No form to see it" },
            { icon: <Clock className="text-blue-400" size={20} />, title: "Answer A Few Questions", sub: "About a minute" },
            { icon: <Calendar className="text-blue-400" size={20} />, title: "Book If You Qualify", sub: "Straight onto the calendar" }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 md:gap-5 p-4 md:p-6 glass-card rounded-xl md:rounded-3xl border border-[var(--glass-border)] group hover:border-blue-500/20 transition-all">
              <div className="w-9 h-9 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500/20 transition-all">
                {React.cloneElement(item.icon as React.ReactElement<any>, { size: 16 })}
              </div>
              <div>
                <div className="text-[var(--text-main)] font-bold text-xs md:text-base">{item.title}</div>
                <div className="text-[var(--text-muted)] opacity-50 text-[8px] md:text-[10px] font-black uppercase tracking-widest">{item.sub}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          {/*
            The VSL, not the qualifier directly.

            The video is the real first filter: it states the price and what
            the system does, so anyone who reaches the questions afterwards
            is answering them having been told. Dropping someone straight
            onto the form gets you people who will book a call on "yeah,
            sure" and no idea what they are walking into.
          */}
          <Link
            href={ADVISORY_PATH}
            className="inline-flex items-center gap-2 md:gap-3 bg-blue-600 text-white px-8 md:px-12 py-4 md:py-5 rounded-full text-base md:text-lg font-bold hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-blue-600/25 group"
          >
            See If You Qualify For Our Offer
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-[var(--text-muted)] text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mt-6 md:mt-12"
        >
          US-Based CPA Firms Only • Confidentiality Guaranteed
        </motion.p>
      </div>
    </section>
  );
};

export default BookingSection;
