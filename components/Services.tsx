'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight,
    Globe,
    Star,
    CheckCircle,
    Zap,
    Clock,
    Bot,
    Calendar,
    Send,
    TrendingUp,
    FileText,
    Shield,
    Droplets,
    Monitor,
    BarChart3,
    Eye,
    Users,
    ChevronDown,
    Smartphone,
    Search,
    PhoneMissed,
    MessageSquare,
    LayoutDashboard,
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useBooking } from './QualificationProvider';

// ── Google G SVG ────────────────────────────────────────
const GoogleGIcon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

// ── Hero sub-icons ──────────────────────────────────────
const heroSubIcons = [
    { Icon: Monitor, color: 'blue', label: 'Website', isGoogle: false },
    { Icon: Bot, color: 'violet', label: 'AI', isGoogle: false },
    { Icon: Shield, color: 'cyan', label: 'Portal', isGoogle: false },
    { Icon: null, color: 'amber', label: 'Reviews', isGoogle: true },
];

const getIconColors = (color: string) => {
    const map: Record<string, { bg: string; border: string; text: string; shadow: string }> = {
        blue: { bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-400', shadow: 'rgba(37, 99, 235, 0.3)' },
        violet: { bg: 'bg-violet-500/20', border: 'border-violet-500/30', text: 'text-violet-400', shadow: 'rgba(139, 92, 246, 0.3)' },
        cyan: { bg: 'bg-cyan-500/20', border: 'border-cyan-500/30', text: 'text-cyan-400', shadow: 'rgba(6, 182, 212, 0.3)' },
        amber: { bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-400', shadow: 'rgba(245, 158, 11, 0.3)' },
    };
    return map[color] || map.blue;
};

// ── Problem Stats ───────────────────────────────────────
const problemStats = [
    {
        id: 'impression',
        icon: <Eye className="w-5 h-5 md:w-6 md:h-6" />,
        stat: 'The First Impression',
        label: 'Website Gap',
        title: '73% of Prospects Judge Your Firm by Your Website',
        description: "Your website is the first thing high-value clients see — and they decide in 7 seconds whether you're worth their time. An outdated template signals 'small-time' to business owners looking for a premium CPA.",
        benefits: [
            'Prospects compare you to modern competitor sites',
            'An outdated site costs you $50K+ clients silently',
            'Mobile-first visitors bounce from clunky templates',
            'Your website is your 24/7 first impression',
        ],
    },
    {
        id: 'response',
        icon: <Clock className="w-5 h-5 md:w-6 md:h-6" />,
        stat: 'The Response Gap',
        label: 'Speed to Lead',
        title: '78% Choose the First Firm to Respond — Without Automation, You\'re Always Last',
        description: "A prospect fills out your contact form at 8pm. You see it at 9am. By then, they've already booked with the firm that texted back in 5 seconds. Every hour of delay is a client lost forever.",
        benefits: [
            'After 5 minutes, conversion drops 80%',
            'Most firms take 4+ hours to respond',
            'After-hours leads are highest intent',
            'Manual follow-up is the first thing that slips',
        ],
    },
    {
        id: 'trust',
        icon: <Star className="w-5 h-5 md:w-6 md:h-6" />,
        stat: 'The Trust Deficit',
        label: 'Review Gap',
        title: 'Firms With 50+ Reviews Get 3x More Calls — Most CPAs Have Under 10',
        description: "When prospects search 'CPA near me,' they see your competitor with 87 five-star reviews and glowing testimonials. Then they see your profile with 4 reviews from 2019. The choice is already made.",
        benefits: [
            '92% of prospects read reviews before choosing a CPA',
            'Recency matters more than total count',
            'No system = no reviews = no trust',
            'Your best clients would review you — if you asked',
        ],
    },
];

// ── System Pillars (Features Grid) ──────────────────────
const systemPillars = [
    { icon: <Monitor className="w-4 h-4 md:w-5 md:h-5" />, title: 'Custom Website Design', description: 'Designed for the financial services trust threshold — not a template. Conversion-optimized, mobile-first, and built to position you as the premium firm you are.', color: 'blue' },
    { icon: <Bot className="w-4 h-4 md:w-5 md:h-5" />, title: 'AI Lead Response', description: 'Every missed call triggers an instant SMS. Every form fill gets an immediate personalized reply. Prospects are engaged in seconds, not hours.', color: 'violet' },
    { icon: <Send className="w-4 h-4 md:w-5 md:h-5" />, title: 'Smart Nurture Sequences', description: 'Automated SMS and email follow-ups keep your firm top-of-mind. Prospects are nurtured over days and weeks until they book.', color: 'purple' },
    { icon: <Star className="w-4 h-4 md:w-5 md:h-5" />, title: 'Google Review Engine', description: 'Automated review requests sent at the perfect moment. Happy clients go to Google, unhappy feedback stays private. Your reputation compounds.', color: 'amber' },
    { icon: <LayoutDashboard className="w-4 h-4 md:w-5 md:h-5" />, title: 'Client Dashboard', description: 'Invoicing, engagement letters, document collection, and secure messaging — all in one branded portal your clients actually enjoy using.', color: 'cyan' },
    { icon: <Calendar className="w-4 h-4 md:w-5 md:h-5" />, title: 'Auto-Booking', description: 'Prospects book consultations directly from automated messages. Your calendar fills itself while you focus on client work.', color: 'indigo' },
];

const featureColorMap: Record<string, { iconDark: string; iconLight: string; text: string }> = {
    blue: { iconDark: 'bg-blue-500/10 border-blue-500/20', iconLight: 'bg-blue-50 border-blue-200', text: 'text-blue-400' },
    violet: { iconDark: 'bg-violet-500/10 border-violet-500/20', iconLight: 'bg-violet-50 border-violet-200', text: 'text-violet-400' },
    purple: { iconDark: 'bg-purple-500/10 border-purple-500/20', iconLight: 'bg-purple-50 border-purple-200', text: 'text-purple-400' },
    amber: { iconDark: 'bg-amber-500/10 border-amber-500/20', iconLight: 'bg-amber-50 border-amber-200', text: 'text-amber-400' },
    cyan: { iconDark: 'bg-cyan-500/10 border-cyan-500/20', iconLight: 'bg-cyan-50 border-cyan-200', text: 'text-cyan-400' },
    indigo: { iconDark: 'bg-indigo-500/10 border-indigo-500/20', iconLight: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-400' },
};

// ── How It Works — Expanding Step Cards ─────────────────
const expandedStepCards = [
    { step: '01', title: 'Premium Website', description: 'We build a custom website designed for the financial services trust threshold. Conversion-optimized, mobile-first, SEO-structured — positioned to turn visitors into booked consultations before the first call.', bg: 'from-blue-950 via-indigo-900 to-violet-900' },
    { step: '02', title: 'AI Automation Layer', description: 'We deploy an AI automation engine that processes every inbound inquiry 24/7. Missed-call text-back, instant form responses, intelligent follow-up sequences, and automated booking — no lead waits, no lead slips.', bg: 'from-violet-950 via-purple-900 to-indigo-900' },
    { step: '03', title: 'Google Review Engine', description: 'We activate a review amplification system that requests Google reviews at the perfect moment. Happy clients are routed to Google, unhappy feedback stays private. Your reputation compounds on autopilot.', bg: 'from-amber-950 via-yellow-900 to-orange-900' },
    { step: '04', title: 'Client Dashboard', description: 'We deploy your branded client portal — invoicing, engagement letters, document collection, and secure messaging in one place. Your clients get a premium experience. You get total visibility.', bg: 'from-cyan-950 via-teal-900 to-blue-900' },
];
const StepIcons = [Monitor, Bot, Star, LayoutDashboard];

// ── FAQ ─────────────────────────────────────────────────
const faqItems = [
    {
        question: 'Do I need all four components, or can I start with one?',
        answer: 'Most firms bundle all four for a complete digital transformation — and that\'s where you see the biggest ROI. But if you need to start with just one (usually the website), that works too. We\'ll help you prioritize based on where you\'re losing the most revenue.',
    },
    {
        question: 'How long does the full system take to build?',
        answer: 'The complete Rainmaker System is typically live within 3–4 weeks. Website comes first (2 weeks), then AI automations and the review engine are layered on top. Your client dashboard deploys in parallel. You don\'t need any technical knowledge — we handle everything.',
    },
    {
        question: 'Will this work for my size firm?',
        answer: 'The Rainmaker System is built for established CPA firms doing $500K+ in revenue who want to scale. Whether you\'re a solo practitioner or a 20-person firm, the system adapts to your volume. The automation handles 10 leads or 100 — same effort from you.',
    },
    {
        question: 'What makes this different from hiring a web designer?',
        answer: 'A web designer gives you a pretty site. We give you a revenue system. The website is just the foundation — it\'s the AI automation, review engine, and client dashboard working together that turns your online presence into a client acquisition machine.',
    },
];

// ── Component ───────────────────────────────────────────
const Services: React.FC = () => {
    const { theme } = useTheme();
    const router = useRouter();
    const { openBooking } = useBooking();
    const [activeStatIndex, setActiveStatIndex] = useState(0);
    const [statProgress, setStatProgress] = useState(0);
    const [expandedStep, setExpandedStep] = useState<number>(0);
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

    // Auto-progression for stats tabs
    useEffect(() => {
        const duration = 10000;
        const interval = 100;
        const step = (interval / duration) * 100;

        const timer = setInterval(() => {
            setStatProgress((prev) => {
                if (prev >= 100) {
                    setActiveStatIndex((current) => (current + 1) % problemStats.length);
                    return 0;
                }
                return prev + step;
            });
        }, interval);

        return () => clearInterval(timer);
    }, [activeStatIndex]);

    const handleStatTabClick = (index: number) => {
        setActiveStatIndex(index);
        setStatProgress(0);
        if (window.innerWidth < 768) {
            const displayArea = document.getElementById('rainmaker-stat-display');
            if (displayArea) {
                displayArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-main)] transition-colors duration-300 pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-6">

                {/* ── SECTION 1: Hero ── */}
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
                                    background: 'conic-gradient(from 0deg at 50% 50%, #3B82F6, #8B5CF6, #06B6D4, #F59E0B, #3B82F6)'
                                }}
                            />
                            <span
                                className="absolute inset-[-100%] animate-[shimmer_8s_linear_infinite] blur-md opacity-40"
                                style={{
                                    background: 'conic-gradient(from 0deg at 50% 50%, #3B82F6, #8B5CF6, #06B6D4, #F59E0B, #3B82F6)'
                                }}
                            />
                            <span className="relative z-10 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-main)]">
                                <Droplets size={14} className="text-blue-400" />
                                <span className="text-[var(--text-main)] text-[10px] md:text-xs font-black tracking-[0.2em] uppercase">Digital Rainmaker System</span>
                            </span>
                        </div>

                        <h1
                            className="text-[26px] sm:text-4xl md:text-6xl font-black text-[var(--text-main)] mb-6 leading-tight tracking-tighter"
                            style={{ fontFamily: "'Syne', sans-serif" }}
                        >
                            The Digital{' '}
                            <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500">Rainmaker System.</span>
                        </h1>

                        {/* Mobile floating icons */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, ease: 'circOut' }}
                            className="flex lg:hidden items-center justify-center my-8 relative"
                        >
                            <div className="absolute inset-0 bg-blue-500/10 blur-[80px] rounded-full" />
                            <div className="relative z-10 flex flex-col items-center gap-3">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                                >
                                    <Droplets size={48} className="text-blue-400" style={{ filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.4))' }} />
                                </motion.div>
                                <div className="flex gap-3" style={{ perspective: '600px' }}>
                                    {heroSubIcons.map((item, i) => {
                                        const colors = getIconColors(item.color);
                                        return (
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
                                                <div
                                                    className={`w-10 h-10 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center`}
                                                    style={{ filter: `drop-shadow(0 4px 8px ${colors.shadow})` }}
                                                >
                                                    {item.isGoogle ? (
                                                        <GoogleGIcon size={20} />
                                                    ) : item.Icon ? (
                                                        <item.Icon size={20} className={colors.text} />
                                                    ) : null}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>

                        <p className="text-sm sm:text-lg md:text-xl text-[var(--text-muted)] mb-8 max-w-xl leading-relaxed">
                            Your firm&apos;s business amplification system. A premium website, AI automation, Google review engine, and client dashboard — working together to process, vet, and nurture every inbound opportunity at light speed.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-5">
                            <button
                                onClick={openBooking}
                                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-full text-sm font-bold hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-blue-600/20 group"
                            >
                                Book a Consultation
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => document.getElementById('rainmaker-system')?.scrollIntoView({ behavior: 'smooth' })}
                                className="flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 rounded-full text-sm font-bold text-[var(--text-main)] border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-md hover:border-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                See the System
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
                        <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full" />
                        <div className="relative z-10 flex flex-col items-center gap-4">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                                className="flex items-center gap-3"
                            >
                                <Droplets size={48} className="text-blue-400" style={{ filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.4))' }} />
                                <span className="text-3xl font-bold text-[var(--text-main)]">Rainmaker System</span>
                            </motion.div>
                            <div className="flex gap-3" style={{ perspective: '600px' }}>
                                {heroSubIcons.map((item, i) => {
                                    const colors = getIconColors(item.color);
                                    return (
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
                                                className={`w-14 h-14 rounded-2xl ${colors.bg} ${colors.border} border flex items-center justify-center`}
                                                style={{ filter: `drop-shadow(0 4px 8px ${colors.shadow})` }}
                                            >
                                                {item.isGoogle ? (
                                                    <GoogleGIcon size={28} />
                                                ) : item.Icon ? (
                                                    <item.Icon size={28} className={colors.text} />
                                                ) : null}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* ── SECTION 2: Problem/Stats ── */}
                <motion.section
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                    className="mb-24"
                >
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 mb-4 md:mb-6 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                            <BarChart3 size={14} className="text-blue-400" />
                            <span className="text-blue-400 text-[9px] md:text-xs font-black tracking-[0.2em] uppercase">The Problem</span>
                        </div>
                        <h2 className="text-2xl md:text-5xl font-bold text-[var(--text-main)] mb-4 md:mb-6">
                            Three Gaps Killing Your <span className="text-blue-500">Growth</span>
                        </h2>
                        <p className="text-[var(--text-muted)] max-w-2xl mx-auto text-sm md:text-lg">
                            Your website, response time, and online reputation are either working for you — or silently sending clients to your competitors.
                        </p>
                    </div>

                    <div className="max-w-6xl mx-auto">
                        <div className={`relative rounded-[1.5rem] md:rounded-[3rem] border border-[var(--glass-border)] shadow-2xl overflow-hidden flex flex-col md:min-h-[600px] transition-colors duration-500 ${theme === 'dark' ? 'bg-[#050505]' : 'bg-white'}`}>

                            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] blur-[120px] pointer-events-none transition-opacity duration-500 ${theme === 'dark' ? 'bg-blue-500/5 opacity-100' : 'bg-blue-500/10 opacity-50'}`} />

                            <div id="rainmaker-stat-display" className="flex-grow grid lg:grid-cols-2 gap-5 md:gap-12 p-5 md:p-16 items-center">
                                {/* Left: Content */}
                                <div className="relative z-10 order-2 lg:order-1">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeStatIndex}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.4 }}
                                        >
                                            <div className="mb-4 md:mb-6 flex items-center gap-2 md:gap-3 text-blue-500">
                                                <div className="p-1.5 md:p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                                    {problemStats[activeStatIndex].icon}
                                                </div>
                                                <span className="font-bold tracking-widest uppercase text-[10px] md:text-xs">{problemStats[activeStatIndex].label}</span>
                                            </div>
                                            <h3 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 tracking-tight leading-tight text-[var(--text-main)]">
                                                {problemStats[activeStatIndex].title}
                                            </h3>
                                            <p className="text-[var(--text-muted)] text-sm md:text-lg leading-relaxed mb-5 md:mb-8">
                                                {problemStats[activeStatIndex].description}
                                            </p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 md:gap-4">
                                                {problemStats[activeStatIndex].benefits.map((benefit, i) => (
                                                    <div key={i} className="flex items-start gap-2 md:gap-2.5 text-xs md:text-sm font-semibold">
                                                        <CheckCircle size={14} className="text-blue-500 shrink-0 mt-0.5 md:w-4 md:h-4" />
                                                        <span className="text-[var(--text-main)] opacity-90">{benefit}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>

                                {/* Right: Scene */}
                                <div className="relative z-10 order-1 lg:order-2 h-full min-h-[260px] md:min-h-[300px] flex items-center justify-center">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeStatIndex}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 1.1 }}
                                            transition={{ duration: 0.5, ease: "easeOut" }}
                                            className="w-full h-full aspect-auto rounded-xl md:rounded-2xl border border-[var(--glass-border)] bg-gradient-to-br from-slate-900 to-slate-950 relative overflow-hidden flex items-center justify-center shadow-inner"
                                        >
                                            {/* Scene 1: The First Impression — website comparison */}
                                            {activeStatIndex === 0 && (
                                                <div className="w-full h-full flex items-center justify-center p-4 md:p-8">
                                                    <div className="w-full max-w-sm space-y-3">
                                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-4">
                                                            <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Prospect comparison</span>
                                                        </motion.div>
                                                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="rounded-xl bg-blue-500/10 border border-blue-500/30 p-3 md:p-4">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-blue-400 text-xs font-bold">Your Firm (with Nexli)</span>
                                                                <span className="text-blue-300 text-[10px] font-bold px-2 py-0.5 bg-blue-500/20 rounded-full">Premium</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <Monitor size={12} className="text-blue-400" />
                                                                <span className="text-white/60 text-[10px]">Custom design, fast, mobile-first</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 mt-2">
                                                                <CheckCircle size={12} className="text-green-400" />
                                                                <span className="text-green-400 text-[10px] font-semibold">Client books consultation</span>
                                                            </div>
                                                        </motion.div>
                                                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 md:p-4">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-red-400/70 text-xs font-bold">Average CPA Site</span>
                                                                <span className="text-red-300/60 text-[10px] font-bold px-2 py-0.5 bg-red-500/20 rounded-full">Template</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <Globe size={12} className="text-red-400/50" />
                                                                <span className="text-white/30 text-[10px]">Dated design, slow, not mobile-optimized</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 mt-2">
                                                                <Search size={12} className="text-red-400/50" />
                                                                <span className="text-red-400/50 text-[10px] font-semibold">Client keeps searching...</span>
                                                            </div>
                                                        </motion.div>
                                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-center pt-2">
                                                            <span className="text-white/30 text-[9px]">7 seconds to make or break a first impression</span>
                                                        </motion.div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Scene 2: The Response Gap — speed comparison */}
                                            {activeStatIndex === 1 && (
                                                <div className="w-full h-full flex items-center justify-center p-4 md:p-8">
                                                    <div className="w-full max-w-sm space-y-3">
                                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-4">
                                                            <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Time since lead inquiry</span>
                                                        </motion.div>
                                                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="rounded-xl bg-blue-500/10 border border-blue-500/30 p-3 md:p-4">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-blue-400 text-xs font-bold">Your Firm (with Nexli)</span>
                                                                <span className="text-blue-300 text-lg font-black">0:05</span>
                                                            </div>
                                                            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                                                                <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ delay: 0.4, duration: 1 }} className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500" />
                                                            </div>
                                                            <div className="flex items-center gap-1.5 mt-2">
                                                                <CheckCircle size={12} className="text-green-400" />
                                                                <span className="text-green-400 text-[10px] font-semibold">SMS sent instantly</span>
                                                            </div>
                                                        </motion.div>
                                                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 md:p-4">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-red-400/70 text-xs font-bold">Average Competitor</span>
                                                                <span className="text-red-300/70 text-lg font-black">4:32:00</span>
                                                            </div>
                                                            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                                                                <motion.div initial={{ width: 0 }} animate={{ width: '15%' }} transition={{ delay: 0.7, duration: 2 }} className="h-full rounded-full bg-red-500/50" />
                                                            </div>
                                                            <div className="flex items-center gap-1.5 mt-2">
                                                                <Clock size={12} className="text-red-400/50" />
                                                                <span className="text-red-400/50 text-[10px] font-semibold">Still waiting to respond...</span>
                                                            </div>
                                                        </motion.div>
                                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-center pt-2">
                                                            <span className="text-white/30 text-[9px]">78% of clients choose the first responder</span>
                                                        </motion.div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Scene 3: The Trust Deficit — review comparison */}
                                            {activeStatIndex === 2 && (
                                                <div className="w-full h-full flex items-center justify-center p-4 md:p-8">
                                                    <div className="w-full max-w-[280px] space-y-3">
                                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-3">
                                                            <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Google search results</span>
                                                        </motion.div>
                                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-amber-400 text-xs font-bold">Competitor Firm</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 mb-1">
                                                                {[1, 2, 3, 4, 5].map(s => (
                                                                    <motion.div key={s} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + s * 0.05, type: "spring" }}>
                                                                        <Star size={12} className="text-amber-400 fill-amber-400" />
                                                                    </motion.div>
                                                                ))}
                                                                <span className="text-amber-300 text-[10px] font-bold ml-1">4.9</span>
                                                            </div>
                                                            <span className="text-white/40 text-[9px]">87 reviews — &quot;Best CPA in the area!&quot;</span>
                                                        </motion.div>
                                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="rounded-xl bg-white/5 border border-white/10 p-3">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-white/40 text-xs font-bold">Your Firm</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 mb-1">
                                                                {[1, 2, 3, 4].map(s => (
                                                                    <Star key={s} size={12} className="text-white/20 fill-white/20" />
                                                                ))}
                                                                <Star size={12} className="text-white/10" />
                                                                <span className="text-white/30 text-[10px] font-bold ml-1">4.0</span>
                                                            </div>
                                                            <span className="text-white/20 text-[9px]">4 reviews — last one from 2019</span>
                                                        </motion.div>
                                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="flex items-center justify-center gap-2 mt-3 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                                                            <Star size={10} className="text-amber-400 fill-amber-400" />
                                                            <span className="text-amber-400 text-[9px] font-bold">92% check reviews before choosing a CPA</span>
                                                        </motion.div>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Tab Navigation */}
                            <div className="relative z-10 border-t border-[var(--glass-border)]">
                                <div className="flex overflow-x-auto no-scrollbar" style={{ scrollbarWidth: 'none' }}>
                                    {problemStats.map((stat, i) => (
                                        <button
                                            key={stat.id}
                                            onClick={() => handleStatTabClick(i)}
                                            className={`flex-1 min-w-[120px] flex flex-col items-center gap-1.5 md:gap-2 px-3 md:px-6 py-3 md:py-5 text-center transition-all relative ${activeStatIndex === i ? 'text-blue-400' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                                        >
                                            <div className="flex items-center gap-1.5 md:gap-2">
                                                <span className="[&>svg]:w-3.5 [&>svg]:h-3.5 md:[&>svg]:w-4 md:[&>svg]:h-4">{stat.icon}</span>
                                                <span className="text-[10px] md:text-sm font-bold whitespace-nowrap">{stat.stat}</span>
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-transparent">
                                                {activeStatIndex === i && (
                                                    <motion.div
                                                        className="h-full bg-blue-500 rounded-full"
                                                        initial={{ width: '0%' }}
                                                        animate={{ width: `${statProgress}%` }}
                                                        transition={{ duration: 0.1, ease: 'linear' }}
                                                    />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* ── SECTION 3: System Overview (Features Grid) ── */}
                <motion.section
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                    className="mb-24"
                    id="rainmaker-system"
                >
                    <div className="text-center mb-12 md:mb-16">
                        <div className="inline-flex items-center gap-2 mb-4 md:mb-6 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                            <Droplets size={14} className="text-blue-400" />
                            <span className="text-blue-400 text-[9px] md:text-xs font-black tracking-[0.2em] uppercase">The System</span>
                        </div>
                        <h2 className="text-2xl md:text-5xl lg:text-6xl font-bold text-[var(--text-main)] leading-tight">
                            Four Pillars. <span className="text-blue-500">One Machine.</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {systemPillars.map((card, idx) => {
                            const colors = featureColorMap[card.color];
                            const isDark = theme === 'dark';
                            return (
                                <motion.div
                                    key={card.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1, duration: 0.6, ease: 'circOut' }}
                                    className="glass-card p-6 md:p-8 rounded-2xl md:rounded-3xl border border-[var(--glass-border)] hover:border-blue-500/20 transition-all duration-300"
                                >
                                    <div className={`inline-flex p-2.5 md:p-3 rounded-lg md:rounded-xl border mb-4 md:mb-5 ${isDark ? colors.iconDark : colors.iconLight}`}>
                                        <div className={colors.text}>{card.icon}</div>
                                    </div>
                                    <h3 className="text-base md:text-xl font-bold text-[var(--text-main)] mb-2 md:mb-3">
                                        {card.title}
                                    </h3>
                                    <p className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
                                        {card.description}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.section>

                {/* ── SECTION 4: How It Works — Expanding Cards ── */}
                <motion.section
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                    className="mb-24"
                >
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 mb-4 md:mb-6 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                            <Zap size={14} className="text-blue-400" />
                            <span className="text-blue-400 text-[9px] md:text-xs font-black tracking-[0.2em] uppercase">How It Works</span>
                        </div>
                        <h2 className="text-2xl md:text-5xl font-bold text-[var(--text-main)] mb-4">
                            Your Firm, <span className="text-blue-500">Fully Loaded</span>
                        </h2>
                    </div>

                    {/* Desktop: Expanding Cards */}
                    <div className="hidden md:flex gap-3 h-[520px] max-w-6xl mx-auto">
                        {expandedStepCards.map((item, i) => {
                            const isActive = expandedStep === i;
                            const StepIcon = StepIcons[i];
                            return (
                                <div
                                    key={i}
                                    className={`relative overflow-hidden rounded-[2rem] cursor-pointer border transition-[flex] duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${isActive ? 'flex-[4] border-white/20' : 'flex-[1] border-white/10 hover:border-white/15'}`}
                                    onMouseEnter={() => setExpandedStep(i)}
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${item.bg}`} />
                                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white transition-opacity duration-500 ${isActive ? 'opacity-[0.06]' : 'opacity-[0.04]'}`}>
                                        <StepIcon size={200} strokeWidth={0.5} />
                                    </div>

                                    {/* Scene illustrations */}
                                    <AnimatePresence>
                                        {isActive && (
                                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.5 }} className="absolute inset-0 flex items-center justify-center pb-44">
                                                {i === 0 && (
                                                    <div className="relative">
                                                        <div className="w-[150px] h-[250px] rounded-[26px] border-2 border-white/20 bg-black/50 backdrop-blur p-3.5 relative">
                                                            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full bg-white/15" />
                                                            <div className="mt-6 space-y-2">
                                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="h-4 rounded bg-blue-500/30 w-3/4" />
                                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="h-2 rounded bg-blue-500/15 w-full" />
                                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="h-2 rounded bg-blue-500/15 w-5/6" />
                                                                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-3 rounded-lg bg-blue-500/20 border border-blue-500/30 px-3 py-2 text-center">
                                                                    <span className="text-blue-300 text-[8px] font-bold">Book Consultation</span>
                                                                </motion.div>
                                                            </div>
                                                        </div>
                                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7, type: "spring" }} className="absolute -top-2 -right-2 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-lg shadow-blue-500/30">
                                                            <TrendingUp size={14} />
                                                        </motion.div>
                                                    </div>
                                                )}
                                                {i === 1 && (
                                                    <div className="flex flex-col items-center gap-3">
                                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
                                                            <Zap size={52} className="text-violet-400" />
                                                        </motion.div>
                                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30">
                                                            <span className="text-green-400 text-lg font-black">0:05</span>
                                                        </motion.div>
                                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-white/40 text-[10px] text-center">Response time</motion.p>
                                                        <div className="flex gap-2">
                                                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }} className="px-3 py-1.5 rounded-lg bg-violet-500/20 border border-violet-500/30">
                                                                <div className="flex items-center gap-1.5">
                                                                    <Smartphone size={10} className="text-violet-300" />
                                                                    <span className="text-violet-300 text-[9px] font-bold">SMS</span>
                                                                </div>
                                                            </motion.div>
                                                            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }} className="px-3 py-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30">
                                                                <div className="flex items-center gap-1.5">
                                                                    <Send size={10} className="text-blue-300" />
                                                                    <span className="text-blue-300 text-[9px] font-bold">Email</span>
                                                                </div>
                                                            </motion.div>
                                                        </div>
                                                    </div>
                                                )}
                                                {i === 2 && (
                                                    <div className="flex flex-col items-center gap-3">
                                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
                                                            <GoogleGIcon size={48} />
                                                        </motion.div>
                                                        <div className="flex gap-1">
                                                            {[1, 2, 3, 4, 5].map(s => (
                                                                <motion.div key={s} initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.3 + s * 0.08, type: "spring" }}>
                                                                    <Star size={18} className="text-amber-400 fill-amber-400" style={{ filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.5))' }} />
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-white/40 text-[10px] text-center">Reviews on autopilot</motion.p>
                                                    </div>
                                                )}
                                                {i === 3 && (
                                                    <div className="flex flex-col items-center gap-2.5 w-[180px]">
                                                        {[
                                                            { label: 'Invoices', icon: FileText },
                                                            { label: 'Engagements', icon: Shield },
                                                            { label: 'Documents', icon: Users },
                                                            { label: 'Messages', icon: MessageSquare },
                                                        ].map((row, j) => (
                                                            <motion.div key={j} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + j * 0.12 }} className="w-full flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-2">
                                                                <row.icon size={12} className="text-cyan-400 flex-shrink-0" />
                                                                <span className="text-white/50 text-[9px] font-medium">{row.label}</span>
                                                                <CheckCircle size={10} className="text-green-400 ml-auto flex-shrink-0" />
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                                    {/* Collapsed label */}
                                    <div className={`absolute inset-0 flex flex-col items-center justify-end pb-8 transition-all duration-500 ${isActive ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                                        <div className="text-white/60 mb-4"><StepIcon size={20} /></div>
                                        <span className="text-white/50 text-[11px] font-bold tracking-[0.2em] uppercase" style={{ writingMode: 'vertical-rl' as const, textOrientation: 'mixed' as const }}>{item.title}</span>
                                    </div>

                                    {/* Expanded content */}
                                    <AnimatePresence>
                                        {isActive && (
                                            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} transition={{ duration: 0.5, delay: 0.15 }} className="absolute bottom-0 left-0 right-0 p-8">
                                                <div className="text-white/10 text-8xl font-black leading-none mb-2 select-none">{item.step}</div>
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="text-white/90"><StepIcon size={24} /></div>
                                                    <h3 className="text-2xl font-bold text-white">{item.title}</h3>
                                                </div>
                                                <p className="text-white/60 text-sm leading-relaxed max-w-md">{item.description}</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>

                    {/* Mobile: Accordion */}
                    <p className="md:hidden text-center text-[var(--text-main)] text-sm mb-4 font-bold tracking-wide">Tap to expand</p>
                    <div className="md:hidden space-y-3">
                        {expandedStepCards.map((item, i) => {
                            const isActive = expandedStep === i;
                            const StepIcon = StepIcons[i];
                            return (
                                <div key={i} onClick={() => setExpandedStep(isActive ? -1 : i)} className="relative overflow-hidden rounded-2xl cursor-pointer border border-white/10">
                                    <div className={`absolute inset-0 bg-gradient-to-br pointer-events-none ${item.bg}`} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                                    <div className="relative z-10 flex items-center gap-4 px-5 py-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                                            <StepIcon size={18} className="text-white/80" />
                                        </div>
                                        <div className="flex-1">
                                            <span className="text-white/30 text-[9px] font-black tracking-widest">STEP {item.step}</span>
                                            <h3 className="text-white text-sm font-bold">{item.title}</h3>
                                        </div>
                                        <motion.div animate={{ rotate: isActive ? 180 : 0 }} transition={{ duration: 0.3 }} className="text-white/30">
                                            <ArrowRight size={16} className="rotate-90" />
                                        </motion.div>
                                    </div>
                                    <AnimatePresence initial={false}>
                                        {isActive && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4 }} className="overflow-hidden">
                                                <div className="relative z-10 px-5 pb-5">
                                                    <p className="text-white/60 text-sm leading-relaxed">{item.description}</p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                </motion.section>

                {/* ── SECTION 5: FAQ ── */}
                <motion.section
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                    className="mb-24"
                >
                    <div className="text-center mb-12 md:mb-16">
                        <div className="inline-flex items-center gap-2 mb-4 md:mb-6 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                            <span className="text-blue-400 text-[9px] md:text-xs font-black tracking-[0.2em] uppercase">FAQ</span>
                        </div>
                        <h2 className="text-2xl md:text-5xl font-bold text-[var(--text-main)] leading-tight">
                            Questions? <span className="text-blue-500">Answered.</span>
                        </h2>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-3">
                        {faqItems.map((item, idx) => {
                            const isOpen = expandedFaq === idx;
                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="glass-card rounded-2xl border border-[var(--glass-border)] overflow-hidden"
                                >
                                    <button
                                        onClick={() => setExpandedFaq(isOpen ? null : idx)}
                                        className="w-full text-left px-6 py-5 flex items-center justify-between gap-4"
                                    >
                                        <span className="text-sm md:text-base font-bold text-[var(--text-main)]">{item.question}</span>
                                        <ChevronDown size={16} className={`flex-shrink-0 text-[var(--text-muted)] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="px-6 pb-5"
                                            >
                                                <p className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">{item.answer}</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.section>

                {/* ── SECTION 6: Final CTA ── */}
                <motion.section
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                    className="text-center relative"
                >
                    <div className="absolute inset-0 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
                    <div className="relative z-10">
                        <h2 className="text-2xl md:text-5xl lg:text-6xl font-bold text-[var(--text-main)] mb-6 leading-tight">
                            Build Your Vision.{' '}
                            <span className="text-blue-500">Automate Your Firm.</span>
                        </h2>
                        <p className="text-sm md:text-lg text-[var(--text-muted)] max-w-xl mx-auto mb-10 leading-relaxed">
                            Most firms bundle all four for a complete digital transformation. But if you need to start with just one — that works too. Let&apos;s talk about what makes sense for your firm.
                        </p>
                        <button
                            onClick={openBooking}
                            className="group inline-flex items-center gap-2 px-8 md:px-10 py-3 md:py-4 rounded-full bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20"
                        >
                            Book a Consultation
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </motion.section>

            </div>
        </div>
    );
};

export default Services;
