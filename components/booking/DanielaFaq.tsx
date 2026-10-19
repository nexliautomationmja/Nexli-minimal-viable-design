'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, Pause, Play } from 'lucide-react';
import Image from 'next/image';
import { useTheme } from '../ThemeProvider';

/**
 * Daniela's pre-recorded answers, shared by both confirmation pages.
 *
 * Lifted out of the since-deleted BookingConfirmed because B needed the same
 * objection handling without the 370-line intel block that used to sit
 * above it. The four state values and the play handler were used by this
 * section alone, so they came with it.
 */
export const DEFAULT_FAQ_ITEMS = [
  { question: 'How exactly does the system get me higher-value clients?', audio: '/audio/faq/faq-how-it-works.mp3' },
  { question: 'Who runs the ads — you or my firm?', audio: '/audio/faq/faq-who-runs-ads.mp3' },
  { question: 'What kind of clients will actually show up on my calendar?', audio: '/audio/faq/faq-client-quality.mp3' },
  { question: 'Most of my revenue is compliance work today — can I deliver advisory at those fees?', audio: '/audio/faq/faq-deliver-advisory.mp3' },
  { question: 'I\'ve been burned by marketing agencies and lead lists before. How is this different?', audio: '/audio/faq/faq-burned-before.mp3' },
  { question: 'How secure is this for my clients\' data? What about compliance?', audio: '/audio/faq/faq-security.mp3' },
];

export interface FaqItem {
  question: string;
  /**
   * Pre-recorded answer, under public/audio/faq/. Optional: an item with
   * only an `answer` renders as Daniela's written reply with no player,
   * which is what page B does until its recordings exist.
   */
  audio?: string;
  /**
   * The written answer, always visible when present — NOT hidden behind a
   * "read transcript" toggle.
   *
   * With `audio` it is what she is saying, on screen while she says it. A
   * prospect who cannot play sound, is skimming, or wants to re-read one
   * sentence is not forced to sit through 90 seconds to get it, and the
   * one who does press play gets to follow along.
   */
  answer?: string;
}

export interface DanielaFaqProps {
  /** Override the questions; defaults to the six below. */
  items?: FaqItem[];
  /** Section eyebrow. Voice-specific by default. */
  badge?: string;
  heading?: React.ReactNode;
  /** Sub-copy under the heading. */
  intro?: string;
}

export default function DanielaFaq({
  items = DEFAULT_FAQ_ITEMS,
  badge = 'Ask Daniela',
  heading,
  intro = 'Tap any question to hear Daniela answer it personally — in her own voice.',
}: DanielaFaqProps) {
  const { theme } = useTheme();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [faqPlaying, setFaqPlaying] = useState<number | null>(null);
  const faqAudioRef = useRef<HTMLAudioElement | null>(null);

  const handleFaqPlay = (index: number) => {
    // If already playing this one, pause
    if (faqPlaying === index && faqAudioRef.current) {
      faqAudioRef.current.pause();
      setFaqPlaying(null);
      return;
    }

    // Stop any other playing audio
    if (faqAudioRef.current) {
      faqAudioRef.current.pause();
      setFaqPlaying(null);
    }

    const src = faqItems[index].audio;
    if (!src) return;

    const audio = new Audio(src);
    faqAudioRef.current = audio;
    audio.onended = () => setFaqPlaying(null);
    // A missing or blocked file rejects. Unhandled, that left the button
    // stuck on Pause with nothing playing and threw in the console; the
    // catch puts the control back where it was.
    audio.onerror = () => setFaqPlaying(null);
    audio.play().catch(() => setFaqPlaying(null));
    setFaqPlaying(index);
  };

  const faqItems = items;

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: 'circOut' }}
      className="mb-24"
    >
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 mb-4 md:mb-6 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
          <HelpCircle size={14} className="text-green-400" />
          <span className="text-green-400 text-[9px] md:text-xs font-black tracking-[0.2em] uppercase">{badge}</span>
        </div>
        {/* `heading` and `intro` were destructured and then never used —
            both pages got the hard-coded copy below whatever they passed. */}
        <h2 className="text-2xl md:text-5xl font-bold text-[var(--text-main)] mb-4">
          {heading ?? (
            <>
              Questions Before <span className="text-green-500">Your Call?</span>
            </>
          )}
        </h2>
        <p className="text-[var(--text-muted)] max-w-2xl mx-auto text-sm md:text-lg">{intro}</p>
      </div>

      <div className="max-w-3xl mx-auto space-y-3">
        {faqItems.map((item, i) => (
          <div
            key={i}
            className={`rounded-2xl border transition-all ${expandedFaq === i ? (theme === 'dark' ? 'border-green-500/30 bg-green-500/5' : 'border-green-500/30 bg-green-50/50') : 'border-[var(--glass-border)] bg-[var(--glass-bg)]'}`}
          >
            <button
              onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-5 md:px-6 py-4 md:py-5 text-left"
            >
              <span className="text-sm md:text-base font-bold text-[var(--text-main)]">{item.question}</span>
              <motion.div animate={{ rotate: expandedFaq === i ? 180 : 0 }} transition={{ duration: 0.3 }} className="text-[var(--text-muted)] flex-shrink-0">
                <ChevronDown size={18} />
              </motion.div>
            </button>
            <AnimatePresence initial={false}>
              {expandedFaq === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  {/*
                    One layout, three states. It used to be two completely
                    separate branches — a player OR a bare paragraph — which
                    made page B's answers look like they came from the site
                    rather than from a person.

                    Now every answer is from Daniela: avatar, name, bubble.
                    The player appears above the words when there is a
                    recording, and the words are always on screen. Nothing
                    is hidden behind "read transcript".
                  */}
                  <div className="px-5 md:px-6 pb-5 md:pb-6">
                    {(
                      <div className="flex items-start gap-3">
                        <Image src="/daniela-headshot.png" alt="Daniela" width={36} height={36} className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover border border-green-500/30 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0 space-y-2">
                          <p className="text-[10px] font-bold ml-1 text-[var(--text-muted)]">Daniela, COO</p>

                          {/* The player, only where a recording exists. */}
                          {item.audio && (
                          <div className={`rounded-2xl rounded-bl-md px-4 py-3 ${theme === 'dark' ? 'bg-white/[0.04] border border-white/10' : 'bg-slate-50 border border-slate-200'}`}>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => handleFaqPlay(i)}
                                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors bg-green-500/20 hover:bg-green-500/30"
                              >
                                {faqPlaying === i ? (
                                  <Pause size={16} className="text-green-400" />
                                ) : (
                                  <Play size={16} className="text-green-400 ml-0.5" />
                                )}
                              </button>
  
                              {/* Waveform bars */}
                              <div className="flex items-center gap-[2px] h-8 flex-1 min-w-0">
                                {Array.from({ length: 48 }).map((_, barIdx) => {
                                  const h = 20 + Math.sin(barIdx * 0.7) * 35 + Math.sin(barIdx * 1.4) * 20 + Math.cos(barIdx * 0.5) * 10;
                                  return (
                                    <div
                                      key={barIdx}
                                      className={`flex-1 min-w-[2px] rounded-full transition-all duration-200 ${
                                        faqPlaying === i ? 'bg-green-400/90' : 'bg-green-400/40'
                                      }`}
                                      style={{ height: `${Math.max(15, h)}%` }}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                          )}

                          {/* What she says, on screen. Always open.
                              This replaces a "Read transcript" toggle whose
                              panel only ever said "Transcript will be
                              available after playback" — it was never wired
                              to anything and nothing ever filled it in. */}
                          {item.answer && (
                            <div
                              className={`rounded-2xl rounded-bl-md px-4 py-3 ${
                                theme === 'dark'
                                  ? 'bg-white/[0.04] border border-white/10'
                                  : 'bg-slate-50 border border-slate-200'
                              }`}
                            >
                              <p
                                className="text-sm md:text-[0.95rem] leading-relaxed whitespace-pre-line"
                                style={{ color: 'var(--text-muted)' }}
                              >
                                {item.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
