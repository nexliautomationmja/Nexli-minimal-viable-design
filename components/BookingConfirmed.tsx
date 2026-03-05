'use client';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, ChevronDown, Play, Send, Calendar,
  Bot, HelpCircle, Mail, Loader2, Volume2, Pause,
  Mic, Square, Type, AudioLines, ArrowRight,
  Sparkles, Video, ClipboardCheck, MessageSquare
} from 'lucide-react';
import { useTheme } from './ThemeProvider';

// ---------------------------------------------------------------------------
// Step Badge — matches section badge pattern from AI Automations
// ---------------------------------------------------------------------------
const StepBadge = ({ number, label }: { number: number; label: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    className="flex items-center gap-3 mb-6 md:mb-8"
  >
    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-black text-sm md:text-base shadow-lg shadow-green-600/20">
      {number}
    </div>
    <span className="text-green-400 text-[10px] md:text-xs font-black tracking-[0.2em] uppercase">{label}</span>
  </motion.div>
);

// ---------------------------------------------------------------------------
// Video Placeholder — premium card style
// ---------------------------------------------------------------------------
const VideoPlaceholder = ({ label }: { label: string }) => (
  <div className="relative w-full aspect-video rounded-xl md:rounded-2xl overflow-hidden group cursor-pointer">
    <div className="absolute inset-0 bg-gradient-to-br from-green-950 via-emerald-900 to-teal-900" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
    <div className="relative z-10 flex flex-col items-center justify-center h-full gap-3">
      <motion.div
        whileHover={{ scale: 1.1 }}
        className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl"
      >
        <Play size={28} className="text-white ml-1" />
      </motion.div>
      <span className="text-white/80 text-xs md:text-sm font-bold uppercase tracking-widest">{label}</span>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Voice Recorder — single recording for all questions
// ---------------------------------------------------------------------------
interface VoiceRecorderProps {
  value: string;
  onChange: (val: string) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ value, onChange }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice recording is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = '';

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += (finalTranscript ? ' ' : '') + event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      onChange(finalTranscript + (interim ? ' ' + interim : ''));
    };

    recognition.onerror = () => {
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setHasRecording(true);
      if (timerRef.current) clearInterval(timerRef.current);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setRecordingTime(0);

    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  }, [onChange]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) recognitionRef.current.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    setHasRecording(true);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-green-500/5 border border-green-500/10 p-3 md:p-5">
        <div className="flex items-start gap-2.5 mb-3">
          <Mic size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-[var(--text-main)] mb-0.5">Record your answers</p>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Hit record and answer all three questions in one go. Speak naturally — we&apos;ll transcribe everything.
            </p>
          </div>
        </div>

        <div className="bg-[var(--glass-border)] rounded-lg p-3 mb-3">
          <p className="text-[10px] font-black text-[var(--text-muted)] opacity-50 uppercase tracking-[0.2em] mb-2">Questions to answer</p>
          <ol className="space-y-1.5 text-sm text-[var(--text-main)] list-decimal list-inside leading-relaxed">
            <li>What&apos;s your biggest operational challenge right now?</li>
            <li>What outcome would make this investment a no-brainer for you?</li>
            <li>How many clients does your firm serve?</li>
          </ol>
        </div>

        <div className="flex flex-col items-center gap-2">
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="group relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-red-500/10 border-2 border-red-500/30 hover:border-red-500/50 hover:bg-red-500/20 transition-all flex items-center justify-center shadow-xl shadow-red-500/10 hover:shadow-red-500/20"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-red-500 group-hover:bg-red-400 transition-colors flex items-center justify-center shadow-lg">
                <Mic size={24} className="text-white" />
              </div>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-red-500/20 border-2 border-red-500/40 transition-all flex items-center justify-center"
            >
              <span className="absolute inset-0 rounded-full animate-ping bg-red-500/20" />
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
                <Square size={20} className="text-white fill-white" />
              </div>
            </button>
          )}
          <span className="text-xs font-bold text-[var(--text-muted)]">
            {isRecording ? `Recording... ${formatTime(recordingTime)}` : hasRecording ? 'Tap to record again' : 'Tap to record'}
          </span>
        </div>
      </div>

      {value && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 md:p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]"
        >
          <p className="text-[10px] md:text-xs font-black text-green-400 uppercase tracking-[0.2em] mb-2">Transcription</p>
          <p className="text-sm text-[var(--text-main)] leading-relaxed">{value}</p>
        </motion.div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// FAQ Questions — Pre-recorded Justine voice answers
// ---------------------------------------------------------------------------
const faqItems = [
  { question: 'How secure is the document portal? What about compliance?', audio: '/audio/faq/faq-security.mp3' },
  { question: 'What happens to my data? Do I actually own it?', audio: '/audio/faq/faq-data-ownership.mp3' },
  { question: 'I already have a website. Why do I need a new one?', audio: '/audio/faq/faq-website.mp3' },
  { question: 'I don\'t have time for a big project right now.', audio: '/audio/faq/faq-time.mp3' },
  { question: 'How is this different from other marketing agencies?', audio: '/audio/faq/faq-different.mp3' },
  { question: 'My clients are used to how we do things — won\'t this disrupt everything?', audio: '/audio/faq/faq-disruption.mp3' },
];

// ---------------------------------------------------------------------------
// Waveform Visualizer — real-time audio analysis with Web Audio API
// ---------------------------------------------------------------------------
interface WaveformProps {
  audioElement: HTMLAudioElement | null;
  isActive: boolean;
  isLoading?: boolean;
}

const WaveformVisualizer: React.FC<WaveformProps> = ({ audioElement, isActive, isLoading }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number>(0);
  const tickRef = useRef(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Connect audio analyser if we have an audio element
    if (audioElement && !contextRef.current) {
      try {
        const ctx = new AudioContext();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.8;
        const source = ctx.createMediaElementSource(audioElement);
        source.connect(analyser);
        analyser.connect(ctx.destination);
        contextRef.current = ctx;
        analyserRef.current = analyser;
        sourceRef.current = source;
      } catch {
        // Audio context may fail in some browsers
      }
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      tickRef.current++;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const barCount = 24;
      const gap = 3;
      const barWidth = (w - gap * (barCount - 1)) / barCount;

      if (isActive && analyserRef.current) {
        // Real audio data
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);
        const step = Math.floor(bufferLength / barCount);

        for (let i = 0; i < barCount; i++) {
          const value = dataArray[i * step] / 255;
          const barHeight = Math.max(4, value * h * 0.9);
          const x = i * (barWidth + gap);
          const y = (h - barHeight) / 2;

          const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
          gradient.addColorStop(0, 'rgba(34, 197, 94, 0.9)');
          gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.7)');
          gradient.addColorStop(1, 'rgba(34, 197, 94, 0.9)');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 2);
          ctx.fill();
        }
      } else if (isLoading) {
        // Animated loading wave
        const t = tickRef.current * 0.05;
        for (let i = 0; i < barCount; i++) {
          const wave = (Math.sin(t - i * 0.3) + 1) / 2;
          const barHeight = 4 + wave * h * 0.6;
          const x = i * (barWidth + gap);
          const y = (h - barHeight) / 2;

          ctx.fillStyle = `rgba(34, 197, 94, ${0.2 + wave * 0.4})`;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 2);
          ctx.fill();
        }
      } else {
        // Idle — subtle static bars
        for (let i = 0; i < barCount; i++) {
          const barHeight = 4 + Math.sin(i * 0.6) * 4;
          const x = i * (barWidth + gap);
          const y = (h - barHeight) / 2;

          ctx.fillStyle = 'rgba(34, 197, 94, 0.15)';
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 2);
          ctx.fill();
        }
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [audioElement, isActive, isLoading]);

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={40}
      className="w-full h-10"
    />
  );
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
const BookingConfirmed: React.FC = () => {
  const { theme } = useTheme();

  // Input mode toggle
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
  const [voiceTranscript, setVoiceTranscript] = useState('');

  // Intel form state
  const [intelForm, setIntelForm] = useState({
    challenge: '',
    outcome: '',
    clientCount: '',
  });
  const [intelSubmitted, setIntelSubmitted] = useState(false);
  const [intelLoading, setIntelLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [aiError, setAiError] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // FAQ state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
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

    // Play pre-recorded audio
    const audio = new Audio(faqItems[index].audio);
    faqAudioRef.current = audio;
    audio.onended = () => setFaqPlaying(null);
    audio.play();
    setFaqPlaying(index);
  };

  const handleIntelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiError('');
    setIntelLoading(true);

    const payload = inputMode === 'voice'
      ? { challenge: voiceTranscript, outcome: '(included in voice response above)', clientCount: '(included in voice response above)' }
      : intelForm;

    try {
      const response = await fetch('/api/booking-intel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      setAiResponse(data.message);
      if (data.audioUrl) setAudioUrl(data.audioUrl);
      setIntelSubmitted(true);
    } catch {
      setAiError('Your responses have been saved and Justine will review them before your call.');
      setIntelSubmitted(true);
    } finally {
      setIntelLoading(false);
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const isFormValid = inputMode === 'voice'
    ? voiceTranscript.trim().length > 0
    : intelForm.challenge && intelForm.outcome && intelForm.clientCount;

  const inputClass = 'w-full bg-[var(--glass-border)] border border-[var(--glass-border)] rounded-xl md:rounded-xl px-3 md:px-4 py-2 md:py-3 text-[var(--text-main)] focus:outline-none focus:border-green-500 transition-all font-medium text-sm placeholder:text-[var(--text-muted)] placeholder:opacity-40';
  const labelClass = 'text-[8px] md:text-[10px] font-black text-[var(--text-muted)] opacity-50 uppercase tracking-[0.2em] ml-2 mb-1.5 block';

  const heroIcons = [CheckCircle, Video, ClipboardCheck, MessageSquare, Calendar];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] transition-colors duration-300 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">

        {/* ── SECTION 1: Hero — two-column layout matching AI Automations ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'circOut' }}
          >
            {/* Shimmer badge */}
            <div className="relative inline-flex items-center mb-6 rounded-full overflow-hidden p-[1.5px]">
              <span
                className="absolute inset-[-100%] animate-[shimmer_8s_linear_infinite] opacity-80"
                style={{
                  background: 'conic-gradient(from 0deg at 50% 50%, #22C55E, #10B981, #059669, #34D399, #22C55E)',
                }}
              />
              <span
                className="absolute inset-[-100%] animate-[shimmer_8s_linear_infinite] blur-md opacity-40"
                style={{
                  background: 'conic-gradient(from 0deg at 50% 50%, #22C55E, #10B981, #059669, #34D399, #22C55E)',
                }}
              />
              <span className="relative z-10 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-main)]">
                <CheckCircle size={14} className="text-green-400" />
                <span className="text-[var(--text-main)] text-[10px] md:text-xs font-black tracking-[0.2em] uppercase">Booking Confirmed</span>
              </span>
            </div>

            <h1
              className="text-[26px] sm:text-4xl md:text-6xl font-black text-[var(--text-main)] mb-6 leading-tight tracking-tighter"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Your Strategy Session{' '}
              <br className="hidden md:block" />
              <span className="text-green-500">Is Confirmed.</span>
            </h1>

            {/* Mobile floating icons */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: 'circOut' }}
              className="flex lg:hidden items-center justify-center my-8 relative"
            >
              <div className="absolute inset-0 bg-green-500/10 blur-[80px] rounded-full" />
              <div className="relative z-10 flex flex-col items-center gap-3">
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                >
                  <Sparkles size={48} className="text-green-400" style={{ filter: 'drop-shadow(0 0 20px rgba(34, 197, 94, 0.4))' }} />
                </motion.div>
                <div className="flex gap-3" style={{ perspective: '600px' }}>
                  {heroIcons.map((Icon, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{
                        opacity: 1,
                        y: [0, -6, 0],
                        rotateX: [0, 4, 0],
                        rotateY: [0, i % 2 === 0 ? 6 : -6, 0],
                      }}
                      transition={{
                        opacity: { delay: 0.3 + i * 0.15, duration: 0.6 },
                        y: { delay: 0.8 + i * 0.15, duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut' },
                        rotateX: { delay: 0.8 + i * 0.15, duration: 3.5 + i * 0.3, repeat: Infinity, ease: 'easeInOut' },
                        rotateY: { delay: 0.8 + i * 0.15, duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut' },
                      }}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <div className="w-10 h-10 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center" style={{ filter: 'drop-shadow(0 4px 8px rgba(34, 197, 94, 0.3))' }}>
                        <Icon size={20} className="text-green-400" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            <p className="text-sm sm:text-lg md:text-xl text-[var(--text-muted)] mb-8 max-w-xl leading-relaxed">
              Before your call, complete the steps below so we can prepare a custom strategy tailored to your firm. This takes about 5 minutes and makes all the difference.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-5">
              <button
                onClick={() => document.getElementById('step-1')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-full text-sm font-bold hover:bg-green-500 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-green-600/20 group"
              >
                Get Started
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>

          {/* Right: floating icons (desktop) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: 'circOut' }}
            className="relative hidden lg:flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-green-500/10 blur-[100px] rounded-full" />
            <div className="relative z-10 flex flex-col items-center gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex items-center gap-3"
              >
                <Sparkles size={48} className="text-green-400" />
                <span className="text-3xl font-bold text-[var(--text-main)]">You&apos;re All Set</span>
              </motion.div>
              <div className="flex gap-3" style={{ perspective: '600px' }}>
                {heroIcons.map((Icon, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: 1,
                      y: [0, -6, 0],
                      rotateX: [0, 4, 0],
                      rotateY: [0, i % 2 === 0 ? 6 : -6, 0],
                      rotateZ: [0, i % 2 === 0 ? 2 : -2, 0],
                    }}
                    transition={{
                      opacity: { delay: 0.3 + i * 0.15, duration: 0.6 },
                      y: { delay: 0.8 + i * 0.15, duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut' },
                      rotateX: { delay: 0.8 + i * 0.15, duration: 3.5 + i * 0.3, repeat: Infinity, ease: 'easeInOut' },
                      rotateY: { delay: 0.8 + i * 0.15, duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut' },
                      rotateZ: { delay: 0.8 + i * 0.15, duration: 5 + i * 0.4, repeat: Infinity, ease: 'easeInOut' },
                    }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <div
                      className="w-14 h-14 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center"
                      style={{ filter: 'drop-shadow(0 4px 8px rgba(34, 197, 94, 0.3))' }}
                    >
                      <Icon size={28} className="text-green-400" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── STEP 1: Welcome Video ── */}
        <motion.section
          id="step-1"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'circOut' }}
          className="mb-14"
        >
          <StepBadge number={1} label="Watch the Welcome Video" />

          <div className={`relative max-w-3xl mx-auto rounded-[1.5rem] md:rounded-[2.5rem] border border-[var(--glass-border)] shadow-2xl overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-[#050505]' : 'bg-white'}`}>
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-[200px] blur-[100px] pointer-events-none transition-opacity duration-500 ${theme === 'dark' ? 'bg-green-500/5 opacity-100' : 'bg-green-500/10 opacity-50'}`} />

            <div className="relative z-10 p-4 md:p-8">
              <VideoPlaceholder label="Watch Welcome Video" />

              <p className="mt-5 text-sm md:text-base text-[var(--text-muted)] leading-relaxed text-center max-w-xl mx-auto">
                A quick welcome from our team. We&apos;ll walk you through what to expect on your strategy session and how to get the most out of it.
              </p>
            </div>
          </div>
        </motion.section>

        {/* ── INTEL FORM + AI RESPONSE ── */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'circOut' }}
          className="mb-14"
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4 md:mb-6 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
              <Bot size={14} className="text-green-400" />
              <span className="text-green-400 text-[9px] md:text-xs font-black tracking-[0.2em] uppercase">Powered by Justine, COO</span>
            </div>
            <h2 className="text-2xl md:text-5xl font-bold text-[var(--text-main)] mb-4 md:mb-6">
              Help Us Prepare <span className="text-green-500">Your Custom Strategy</span>
            </h2>
            <p className="text-[var(--text-muted)] max-w-2xl mx-auto text-sm md:text-lg">
              Answer three quick questions so our COO, Justine, can analyze your firm&apos;s needs and prepare strategic insights before the call.
            </p>
          </div>

          <div className={`relative max-w-3xl mx-auto rounded-[1.5rem] md:rounded-[2.5rem] border border-[var(--glass-border)] shadow-2xl overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-[#050505]' : 'bg-white'}`}>
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-[200px] blur-[100px] pointer-events-none transition-opacity duration-500 ${theme === 'dark' ? 'bg-green-500/5 opacity-100' : 'bg-green-500/10 opacity-50'}`} />

            <div className="relative z-10 p-4 md:p-8">
              <AnimatePresence mode="wait">
                {!intelSubmitted ? (
                  <motion.form
                    key="form"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleIntelSubmit}
                    className="space-y-4 md:space-y-5"
                  >
                    {/* Input mode toggle */}
                    <div className="flex items-center justify-center gap-2 p-1.5 rounded-xl bg-[var(--glass-border)] w-fit mx-auto">
                      <button
                        type="button"
                        onClick={() => setInputMode('text')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all ${
                          inputMode === 'text'
                            ? 'bg-green-600 text-white shadow-lg shadow-green-600/20'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                        }`}
                      >
                        <Type size={14} />
                        Type Answers
                      </button>
                      <button
                        type="button"
                        onClick={() => setInputMode('voice')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all ${
                          inputMode === 'voice'
                            ? 'bg-green-600 text-white shadow-lg shadow-green-600/20'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                        }`}
                      >
                        <AudioLines size={14} />
                        Record Voice
                      </button>
                    </div>

                    {inputMode === 'text' ? (
                      <>
                        <div>
                          <label className={labelClass}>Question 1</label>
                          <textarea
                            rows={2}
                            placeholder="What's your biggest operational challenge right now?"
                            value={intelForm.challenge}
                            onChange={(e) => setIntelForm(prev => ({ ...prev, challenge: e.target.value }))}
                            className={`${inputClass} resize-none`}
                            required
                          />
                        </div>

                        <div>
                          <label className={labelClass}>Question 2</label>
                          <textarea
                            rows={2}
                            placeholder="What outcome would make this investment a no-brainer for you?"
                            value={intelForm.outcome}
                            onChange={(e) => setIntelForm(prev => ({ ...prev, outcome: e.target.value }))}
                            className={`${inputClass} resize-none`}
                            required
                          />
                        </div>

                        <div>
                          <label className={labelClass}>Question 3</label>
                          <input
                            type="text"
                            placeholder="How many clients does your firm serve?"
                            value={intelForm.clientCount}
                            onChange={(e) => setIntelForm(prev => ({ ...prev, clientCount: e.target.value }))}
                            className={inputClass}
                            required
                          />
                        </div>
                      </>
                    ) : (
                      <VoiceRecorder
                        value={voiceTranscript}
                        onChange={setVoiceTranscript}
                      />
                    )}

                    <button
                      type="submit"
                      disabled={intelLoading || !isFormValid}
                      className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 md:py-3.5 rounded-xl text-sm font-bold hover:bg-green-500 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-green-600/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {intelLoading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Justine is analyzing your responses...
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Submit to Justine
                        </>
                      )}
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="response"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {aiResponse ? (
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-600/20 border border-green-500/30 flex items-center justify-center">
                              <Bot size={20} className="text-green-400" />
                            </div>
                            <div>
                              <p className="text-sm md:text-base font-bold text-[var(--text-main)]">Justine</p>
                              <p className="text-[10px] md:text-xs text-[var(--text-muted)]">COO, Nexli Automation</p>
                            </div>
                          </div>

                          {audioUrl && (
                            <button
                              onClick={toggleAudio}
                              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-all text-xs md:text-sm font-bold"
                            >
                              {isPlaying ? <Pause size={16} /> : <Volume2 size={16} />}
                              {isPlaying ? 'Pause' : 'Listen to Justine'}
                            </button>
                          )}
                        </div>

                        {audioUrl && (
                          <audio
                            ref={audioRef}
                            src={audioUrl}
                            onEnded={() => setIsPlaying(false)}
                          />
                        )}

                        <div className="rounded-xl md:rounded-2xl bg-green-500/5 border border-green-500/10 p-5 md:p-8">
                          {aiResponse.split('\n\n').map((paragraph, i) => (
                            <p key={i} className="text-sm md:text-base text-[var(--text-main)] leading-relaxed mb-4 last:mb-0">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle size={32} className="text-green-500 mx-auto mb-4" />
                        <p className="text-sm md:text-base text-[var(--text-main)] font-bold mb-2">Responses Received</p>
                        <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-md mx-auto">{aiError}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.section>

        {/* ── STEP 2: Digital Rainmaker System Video ── */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'circOut' }}
          className="mb-14"
        >
          <StepBadge number={2} label="See the Digital Rainmaker System" />

          <div className={`relative max-w-3xl mx-auto rounded-[1.5rem] md:rounded-[2.5rem] border border-[var(--glass-border)] shadow-2xl overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-[#050505]' : 'bg-white'}`}>
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-[200px] blur-[100px] pointer-events-none transition-opacity duration-500 ${theme === 'dark' ? 'bg-green-500/5 opacity-100' : 'bg-green-500/10 opacity-50'}`} />

            <div className="relative z-10 p-4 md:p-8">
              <VideoPlaceholder label="Watch How It Works" />

              <p className="mt-5 text-sm md:text-base text-[var(--text-muted)] leading-relaxed text-center max-w-xl mx-auto">
                See exactly how the Digital Rainmaker System combines a premium website, AI automation, and Google review amplification to turn your firm into a client acquisition machine.
              </p>
            </div>
          </div>
        </motion.section>

        {/* ── STEP 3: Calendar Acceptance ── */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'circOut' }}
          className="mb-14"
        >
          <StepBadge number={3} label="Confirm Your Calendar Invite" />

          <div className={`relative max-w-3xl mx-auto rounded-[1.5rem] md:rounded-[2.5rem] border border-[var(--glass-border)] shadow-2xl overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-[#050505]' : 'bg-white'}`}>
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-[200px] blur-[100px] pointer-events-none transition-opacity duration-500 ${theme === 'dark' ? 'bg-green-500/5 opacity-100' : 'bg-green-500/10 opacity-50'}`} />

            <div className="relative z-10 p-4 md:p-8">
              <div className="relative w-full aspect-video rounded-xl md:rounded-2xl overflow-hidden mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-green-950 via-emerald-900 to-teal-900" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="relative z-10 flex flex-col items-center justify-center h-full gap-3 text-center px-4">
                  <Calendar size={40} className="text-green-400" style={{ filter: 'drop-shadow(0 0 15px rgba(34, 197, 94, 0.4))' }} />
                  <span className="text-white/80 text-xs md:text-sm font-bold uppercase tracking-widest">Calendar Acceptance Screenshot</span>
                  <span className="text-white/50 text-[10px] md:text-xs">Image coming soon</span>
                </div>
              </div>

              <div className="space-y-3 md:space-y-4 max-w-xl mx-auto">
                {[
                  { num: 1, text: 'Check your email for the calendar invite from Nexli' },
                  { num: 2, text: 'Click "Accept" to add the session to your calendar' },
                  { num: 3, text: 'Set a reminder 15 minutes before so you\'re ready' },
                ].map((item) => (
                  <div key={item.num} className="flex items-start gap-4 p-3 md:p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-green-600/20 border border-green-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-400 text-xs md:text-sm font-bold">{item.num}</span>
                    </div>
                    <p className="text-sm md:text-base text-[var(--text-main)] leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── FAQ: Justine Voice Responses ── */}
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
              <span className="text-green-400 text-[9px] md:text-xs font-black tracking-[0.2em] uppercase">Ask Justine</span>
            </div>
            <h2 className="text-2xl md:text-5xl font-bold text-[var(--text-main)] mb-4">
              Questions Before <span className="text-green-500">Your Call?</span>
            </h2>
            <p className="text-[var(--text-muted)] max-w-2xl mx-auto text-sm md:text-lg">
              Tap any question to hear Justine answer it personally — in her own voice.
            </p>
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
                      <div className="px-5 md:px-6 pb-5 md:pb-6">
                        {/* Voice message card */}
                        <div className="rounded-xl md:rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] p-4 md:p-5">
                          <div className="flex items-center gap-3 md:gap-4">
                            {/* Play button */}
                            <button
                              type="button"
                              onClick={() => handleFaqPlay(i)}
                              className={`flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all ${
                                faqPlaying === i
                                  ? 'bg-green-600 shadow-lg shadow-green-600/30'
                                  : 'bg-green-600 hover:bg-green-500 hover:scale-105 active:scale-95 shadow-lg shadow-green-600/20'
                              }`}
                            >
                              {faqPlaying === i ? (
                                <Pause size={20} className="text-white" />
                              ) : (
                                <Play size={20} className="text-white ml-0.5" />
                              )}
                            </button>

                            {/* Waveform visualizer */}
                            <div className="flex-1 min-w-0">
                              <WaveformVisualizer
                                audioElement={faqPlaying === i ? faqAudioRef.current : null}
                                isActive={faqPlaying === i}
                              />
                            </div>
                          </div>

                          {/* Status text */}
                          <p className="text-[10px] md:text-xs mt-3 ml-[3.75rem] md:ml-[4.5rem] font-medium text-[var(--text-muted)]">
                            {faqPlaying === i ? 'Playing...' : 'Tap play to hear Justine\u2019s answer'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── Final CTA — matching other pages ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="max-w-4xl mx-auto p-6 md:p-20 rounded-[1.5rem] md:rounded-[3rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-green-500/10 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-xl md:text-5xl font-bold text-[var(--text-main)] mb-4 md:mb-8 tracking-tight leading-tight">
                We Look Forward to <br className="hidden md:block" /><span className="text-green-500">Speaking With You.</span>
              </h2>
              <p className="text-sm md:text-xl text-[var(--text-muted)] mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed font-medium">
                If you have any questions before your call, don&apos;t hesitate to reach out.
              </p>
              <a
                href="mailto:mail@nexli.net"
                className="inline-flex items-center gap-2 md:gap-3 bg-green-600 text-white px-6 md:px-10 py-3 md:py-5 rounded-full text-sm md:text-lg font-bold hover:bg-green-500 hover:scale-105 transition-all shadow-xl shadow-green-600/25 active:scale-95"
              >
                <Mail size={16} className="md:w-5 md:h-5" />
                mail@nexli.net
              </a>
            </div>
          </div>
        </motion.section>

      </div>
    </div>
  );
};

export default BookingConfirmed;
