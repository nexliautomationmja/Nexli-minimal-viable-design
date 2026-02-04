import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield,
    ArrowRight,
    MessageSquare,
    TrendingUp,
    CheckCircle,
    RotateCcw,
    Send,
    Mail,
    Smartphone,
    MousePointerClick,
    ThumbsUp,
    ThumbsDown,
    BarChart3,
    Zap,
    Star,
    RefreshCw
} from 'lucide-react';
import { useTheme } from '../App';

type DemoState = 'idle' | 'selected' | 'positive' | 'negative' | 'feedbackSent';

const SmartReviews: React.FC = () => {
    const { theme } = useTheme();

    // Star demo state
    const [hoveredStar, setHoveredStar] = useState<number>(0);
    const [selectedRating, setSelectedRating] = useState<number>(0);
    const [demoState, setDemoState] = useState<DemoState>('idle');
    const [feedbackText, setFeedbackText] = useState<string>('');
    const [feedbackSubmitting, setFeedbackSubmitting] = useState<boolean>(false);

    // Cal.com integration
    useEffect(() => {
        (function (C: any, A: string, L: string) {
            let p = function (a: any, ar: any) { a.q.push(ar); };
            let d = C.document;
            C.Cal = C.Cal || function () {
                let cal = C.Cal;
                let ar = arguments;
                if (!cal.loaded) {
                    cal.ns = {};
                    cal.q = cal.q || [];
                    d.head.appendChild(d.createElement("script")).src = A;
                    cal.loaded = true;
                }
                if (ar[0] === L) {
                    const api = function () { p(api, arguments); };
                    const namespace = ar[1];
                    api.q = api.q || [];
                    if (typeof namespace === "string") {
                        cal.ns[namespace] = cal.ns[namespace] || api;
                        p(cal.ns[namespace], ar);
                        p(cal, ["initNamespace", namespace]);
                    } else p(cal, ar);
                    return;
                }
                p(cal, ar);
            };
        })(window, "https://app.cal.com/embed/embed.js", "init");

        const Cal = (window as any).Cal;
        Cal("init", "nexli-demo", { origin: "https://app.cal.com" });
    }, []);

    const openCalPopup = () => {
        const Cal = (window as any).Cal;
        if (Cal && Cal.ns && Cal.ns["nexli-demo"]) {
            Cal.ns["nexli-demo"]("modal", {
                calLink: "nexli-automation-6fgn8j/nexli-demo",
                config: { "layout": "month_view", "theme": theme },
            });
        }
    };

    // Star click handler
    const handleStarClick = (rating: number) => {
        setSelectedRating(rating);
        setDemoState('selected');

        setTimeout(() => {
            if (rating >= 4) {
                setDemoState('positive');
            } else {
                setDemoState('negative');
            }
        }, 600);
    };

    const handleFeedbackSubmit = () => {
        setFeedbackSubmitting(true);
        setTimeout(() => {
            setDemoState('feedbackSent');
            setFeedbackSubmitting(false);
        }, 1200);
    };

    const resetDemo = () => {
        setHoveredStar(0);
        setSelectedRating(0);
        setDemoState('idle');
        setFeedbackText('');
        setFeedbackSubmitting(false);
    };

    // Inline star SVG component
    const StarIcon: React.FC<{ index: number; filled: boolean; hovered: boolean }> = ({ index, filled, hovered }) => (
        <motion.svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className="cursor-pointer w-10 h-10 md:w-12 md:h-12 touch-manipulation"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onMouseEnter={() => demoState === 'idle' && setHoveredStar(index)}
            onMouseLeave={() => demoState === 'idle' && setHoveredStar(0)}
            onTouchStart={(e) => {
                e.preventDefault();
                if (demoState === 'idle') handleStarClick(index);
            }}
            onClick={() => demoState === 'idle' && handleStarClick(index)}
        >
            <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"
                fill={filled || hovered ? '#fbbf24' : 'var(--glass-border)'}
                stroke={filled || hovered ? '#f59e0b' : 'var(--glass-border)'}
                strokeWidth="0.5"
                className="transition-colors duration-200"
            />
        </motion.svg>
    );

    const starLabels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

    return (
        <div className="min-h-screen bg-[var(--bg-main)] transition-colors duration-300 pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-6">

                {/* ── SECTION 1: Hero ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "circOut" }}
                    >
                        <div className="relative inline-flex items-center mb-6 rounded-full overflow-hidden p-[1.5px]">
                            {/* Rotating glow border */}
                            <span
                                className="absolute inset-[-100%] animate-[shimmer_8s_linear_infinite] opacity-80"
                                style={{
                                    background: 'conic-gradient(from 0deg at 50% 50%, #4285F4, #34A853, #FBBC05, #EA4335, #4285F4)'
                                }}
                            />
                            {/* Outer glow effect */}
                            <span
                                className="absolute inset-[-100%] animate-[shimmer_8s_linear_infinite] blur-md opacity-40"
                                style={{
                                    background: 'conic-gradient(from 0deg at 50% 50%, #4285F4, #34A853, #FBBC05, #EA4335, #4285F4)'
                                }}
                            />
                            {/* Inner pill content */}
                            <span className="relative z-10 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-main)]">
                                <svg width="14" height="14" viewBox="0 0 24 24" className="flex-shrink-0">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span className="text-[var(--text-main)] text-[10px] md:text-xs font-black tracking-[0.2em] uppercase">Google Reviews</span>
                            </span>
                        </div>

                        <h1 className="text-[26px] sm:text-4xl md:text-6xl font-black text-[var(--text-main)] mb-6 leading-tight tracking-tighter" style={{ fontFamily: "'Syne', sans-serif" }}>
                            A $10M Client Just Googled You.{' '}
                            <br className="hidden md:block" /><span className="text-blue-500">3 Stars.</span> They Moved On.
                        </h1>

                        {/* Mobile-only: animated Google Reviews visual between headline and paragraph */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, ease: "circOut" }}
                            className="flex lg:hidden items-center justify-center my-8 relative"
                        >
                            <div className="absolute inset-0 bg-blue-500/10 blur-[80px] rounded-full" />
                            <div className="relative z-10 flex flex-col items-center gap-3">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2, duration: 0.6 }}
                                    className="flex items-center gap-2"
                                >
                                    <svg width="36" height="36" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    <span className="text-xl font-bold text-[var(--text-main)]">Google Reviews</span>
                                </motion.div>
                                <div className="flex gap-2" style={{ perspective: '600px' }}>
                                    {[1, 2, 3, 4, 5].map((i) => (
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
                                                y: { delay: 0.8 + i * 0.15, duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut" },
                                                rotateX: { delay: 0.8 + i * 0.15, duration: 3.5 + i * 0.3, repeat: Infinity, ease: "easeInOut" },
                                                rotateY: { delay: 0.8 + i * 0.15, duration: 4 + i * 0.5, repeat: Infinity, ease: "easeInOut" },
                                                rotateZ: { delay: 0.8 + i * 0.15, duration: 5 + i * 0.4, repeat: Infinity, ease: "easeInOut" },
                                            }}
                                            style={{ transformStyle: 'preserve-3d' }}
                                        >
                                            <svg
                                                width="40"
                                                height="40"
                                                viewBox="0 0 24 24"
                                                style={{ filter: 'drop-shadow(0 4px 8px rgba(251, 191, 36, 0.3))' }}
                                            >
                                                <path
                                                    d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"
                                                    fill="#fbbf24"
                                                    stroke="#f59e0b"
                                                    strokeWidth="0.5"
                                                />
                                            </svg>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        <p className="text-sm sm:text-lg md:text-xl text-[var(--text-muted)] mb-8 max-w-xl leading-relaxed">
                            High-net-worth clients don't settle. Before they ever call your office, they've already checked your reviews. CPAs, advisors, and wealth managers with weak ratings don't make the shortlist — no matter how good they actually are. Smart Reviews puts your reputation on autopilot so your Google profile matches the elite service you deliver.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-5">
                            <button
                                onClick={() => document.getElementById('smart-review-demo')?.scrollIntoView({ behavior: 'smooth' })}
                                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-full text-sm font-bold hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-blue-600/20 group"
                            >
                                Try the Demo
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={openCalPopup}
                                className="flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 rounded-full text-sm font-bold text-[var(--text-main)] border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-md hover:border-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                Book Now
                            </button>
                        </div>
                    </motion.div>

                    {/* Right side decorative stars */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: "circOut" }}
                        className="relative hidden lg:flex items-center justify-center"
                    >
                        <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full" />
                        <div className="relative z-10 flex flex-col items-center gap-4">
                            {/* Google logo */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                                className="flex items-center gap-3"
                            >
                                <svg width="56" height="56" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span className="text-3xl font-bold text-[var(--text-main)]">Google Reviews</span>
                            </motion.div>
                            {/* Stars with 3D floating */}
                            <div className="flex gap-3" style={{ perspective: '600px' }}>
                                {[1, 2, 3, 4, 5].map((i) => (
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
                                            y: { delay: 0.8 + i * 0.15, duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut" },
                                            rotateX: { delay: 0.8 + i * 0.15, duration: 3.5 + i * 0.3, repeat: Infinity, ease: "easeInOut" },
                                            rotateY: { delay: 0.8 + i * 0.15, duration: 4 + i * 0.5, repeat: Infinity, ease: "easeInOut" },
                                            rotateZ: { delay: 0.8 + i * 0.15, duration: 5 + i * 0.4, repeat: Infinity, ease: "easeInOut" },
                                        }}
                                        style={{ transformStyle: 'preserve-3d' }}
                                    >
                                        <svg
                                            width="56"
                                            height="56"
                                            viewBox="0 0 24 24"
                                            style={{ filter: 'drop-shadow(0 4px 8px rgba(251, 191, 36, 0.3))' }}
                                        >
                                            <path
                                                d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"
                                                fill="#fbbf24"
                                                stroke="#f59e0b"
                                                strokeWidth="0.5"
                                            />
                                        </svg>
                                    </motion.div>
                                ))}
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
                            Reviews Make or Break Your <span className="text-blue-500">Growth</span>
                        </h2>
                        <p className="text-[var(--text-muted)] max-w-2xl mx-auto text-sm md:text-lg">
                            In a world where 93% of consumers say online reviews influence their decisions, silence from your happy clients is your biggest competitive disadvantage.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
                        {[
                            { stat: '93%', label: 'of consumers read online reviews before choosing a local business', icon: <TrendingUp size={20} className="text-blue-400" /> },
                            { stat: '72%', label: 'of customers will leave a review if simply asked — but most businesses never ask', icon: <MessageSquare size={20} className="text-blue-400" /> },
                            { stat: '1 in 3', label: 'negative reviews can cost you up to 22% of potential customers', icon: <ThumbsDown size={20} className="text-blue-400" /> },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15 }}
                                className="glass-card p-6 md:p-8 rounded-2xl md:rounded-3xl border border-[var(--glass-border)] text-center"
                            >
                                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                    {item.icon}
                                </div>
                                <div className="text-3xl md:text-4xl font-black text-blue-500 mb-2">{item.stat}</div>
                                <p className="text-[var(--text-muted)] text-xs md:text-sm font-medium leading-relaxed">{item.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* ── SECTION 3: Interactive Demo ── */}
                <motion.section
                    id="smart-review-demo"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="mb-24"
                >
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 mb-4 md:mb-6 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                            <MousePointerClick size={14} className="text-blue-400" />
                            <span className="text-blue-400 text-[9px] md:text-xs font-black tracking-[0.2em] uppercase">Try It Yourself</span>
                        </div>
                        <h2 className="text-2xl md:text-5xl font-bold text-[var(--text-main)] mb-4">
                            See the Smart Review Banner <span className="text-blue-500">In Action</span>
                        </h2>
                        <p className="text-[var(--text-muted)] max-w-2xl mx-auto text-sm md:text-lg">
                            This is exactly what your customers would see. Click a star rating to experience both paths.
                        </p>
                    </div>

                    {/* The Demo Card */}
                    <div className="max-w-2xl mx-auto">
                        <div className="glass-card p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-[var(--glass-border)] relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent pointer-events-none" />

                            <div className="relative z-10">
                                <AnimatePresence mode="wait">
                                    {/* STATE: idle — Star Selection */}
                                    {demoState === 'idle' && (
                                        <motion.div
                                            key="idle"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="text-center"
                                        >
                                            {/* Google branding */}
                                            <div className="flex items-center justify-center gap-3 mb-5">
                                                <svg width="40" height="40" viewBox="0 0 24 24">
                                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                                </svg>
                                                <span className="text-xl font-semibold text-[var(--text-muted)]">Google Reviews</span>
                                            </div>
                                            <h3 className="text-xl md:text-2xl font-bold text-[var(--text-main)] mb-2">
                                                How was your experience?
                                            </h3>
                                            <p className="text-[var(--text-muted)] text-sm mb-8">
                                                Tap a star to leave your Google review
                                            </p>
                                            <div className="flex justify-center gap-2 md:gap-3">
                                                {[1, 2, 3, 4, 5].map((index) => (
                                                    <StarIcon
                                                        key={index}
                                                        index={index}
                                                        filled={index <= selectedRating}
                                                        hovered={index <= hoveredStar}
                                                    />
                                                ))}
                                            </div>
                                            {hoveredStar > 0 && (
                                                <motion.p
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="mt-4 text-sm text-[var(--text-muted)]"
                                                >
                                                    {starLabels[hoveredStar]}
                                                </motion.p>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* STATE: selected — Spinner transition */}
                                    {demoState === 'selected' && (
                                        <motion.div
                                            key="selected"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="text-center py-8"
                                        >
                                            <div className="flex justify-center gap-1 mb-4">
                                                {[1, 2, 3, 4, 5].map((i) => (
                                                    <svg key={i} width="32" height="32" viewBox="0 0 24 24">
                                                        <path
                                                            d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"
                                                            fill={i <= selectedRating ? '#fbbf24' : 'var(--glass-border)'}
                                                        />
                                                    </svg>
                                                ))}
                                            </div>
                                            <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
                                        </motion.div>
                                    )}

                                    {/* STATE: positive (4-5 stars) — Google Redirect */}
                                    {demoState === 'positive' && (
                                        <motion.div
                                            key="positive"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="text-center py-4"
                                        >
                                            {/* Confetti particles */}
                                            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                                {Array.from({ length: 12 }).map((_, i) => (
                                                    <motion.div
                                                        key={i}
                                                        className="absolute w-2 h-2 rounded-full"
                                                        style={{
                                                            background: ['#fbbf24', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][i % 5],
                                                            left: `${20 + Math.random() * 60}%`,
                                                            top: '50%',
                                                        }}
                                                        initial={{ y: 0, opacity: 1, scale: 1 }}
                                                        animate={{
                                                            y: [0, -80 - Math.random() * 120],
                                                            x: [-30 + Math.random() * 60],
                                                            opacity: [1, 0],
                                                            scale: [1, 0.5],
                                                        }}
                                                        transition={{ duration: 1.5, delay: i * 0.05, ease: "easeOut" }}
                                                    />
                                                ))}
                                            </div>

                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                                className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center"
                                            >
                                                <CheckCircle size={32} className="text-green-500" />
                                            </motion.div>

                                            <h3 className="text-xl md:text-2xl font-bold text-[var(--text-main)] mb-2">
                                                Thank you!
                                            </h3>
                                            <p className="text-[var(--text-muted)] text-sm mb-6">
                                                Redirecting you to Google Reviews...
                                            </p>

                                            {/* Google branding pill */}
                                            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-white dark:bg-white/10 border border-[var(--glass-border)] shadow-lg">
                                                <svg width="20" height="20" viewBox="0 0 24 24">
                                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                                </svg>
                                                <span className="text-sm font-semibold text-gray-700 dark:text-white/80">Google Reviews</span>
                                            </div>

                                            <p className="mt-6 text-[10px] text-[var(--text-muted)] opacity-60 uppercase tracking-widest font-bold">
                                                This is a demo — no actual redirect
                                            </p>
                                        </motion.div>
                                    )}

                                    {/* STATE: negative (1-3 stars) — Feedback Form */}
                                    {demoState === 'negative' && (
                                        <motion.div
                                            key="negative"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="text-center"
                                        >
                                            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                                <MessageSquare size={24} className="text-blue-400" />
                                            </div>
                                            <h3 className="text-xl md:text-2xl font-bold text-[var(--text-main)] mb-2">
                                                We Value Your Feedback
                                            </h3>
                                            <p className="text-[var(--text-muted)] text-sm mb-6">
                                                Help us improve. Your feedback goes directly to our team — not to a public review. The best part? Your customer has no idea it's being routed internally. To them, it just feels like a normal review experience.
                                            </p>
                                            <textarea
                                                value={feedbackText}
                                                onChange={(e) => setFeedbackText(e.target.value)}
                                                placeholder="What could we do better?"
                                                rows={4}
                                                className="w-full bg-[var(--glass-border)] border border-[var(--glass-border)] rounded-2xl px-6 py-4 text-[var(--text-main)] focus:outline-none focus:border-blue-500 transition-all font-medium resize-none mb-4 text-sm md:text-base"
                                            />
                                            <button
                                                onClick={handleFeedbackSubmit}
                                                disabled={feedbackSubmitting}
                                                className={`w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] ${feedbackSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                                            >
                                                {feedbackSubmitting ? (
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <Send size={16} />
                                                )}
                                                {feedbackSubmitting ? 'Sending...' : 'Submit Feedback'}
                                            </button>
                                        </motion.div>
                                    )}

                                    {/* STATE: feedbackSent — Thank You */}
                                    {demoState === 'feedbackSent' && (
                                        <motion.div
                                            key="feedbackSent"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="text-center py-4"
                                        >
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: "spring", stiffness: 200 }}
                                                className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center"
                                            >
                                                <CheckCircle size={32} className="text-blue-500" />
                                            </motion.div>
                                            <h3 className="text-xl md:text-2xl font-bold text-[var(--text-main)] mb-2">
                                                Thank You for Your Feedback
                                            </h3>
                                            <p className="text-[var(--text-muted)] text-sm">
                                                Your response has been sent directly to the team. We appreciate your honesty and will use it to improve.
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Reset button */}
                                {demoState !== 'idle' && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="mt-6 text-center"
                                    >
                                        <button
                                            onClick={resetDemo}
                                            className="inline-flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-widest hover:text-blue-400 transition-colors bg-transparent border-none p-0"
                                        >
                                            <RotateCcw size={14} />
                                            Try Again
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* ── SECTION 4: How It Works ── */}
                <motion.section
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="mb-24"
                >
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 mb-4 md:mb-6 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                            <Zap size={14} className="text-blue-400" />
                            <span className="text-blue-400 text-[9px] md:text-xs font-black tracking-[0.2em] uppercase">How It Works</span>
                        </div>
                        <h2 className="text-2xl md:text-5xl font-bold text-[var(--text-main)] mb-4">
                            Four Steps to <span className="text-blue-500">5-Star Protection</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { step: '01', icon: <Smartphone size={24} className="text-blue-400" />, title: 'Automated Request', description: 'Your customer receives an automated review request via email or SMS after their service.' },
                            { step: '02', icon: <MousePointerClick size={24} className="text-blue-400" />, title: 'Click the Link', description: 'They click the smart review link and see the interactive star rating banner on your website.' },
                            { step: '03', icon: <ThumbsUp size={24} className="text-blue-400" />, title: 'Happy? Go to Google', description: '4-5 star ratings get redirected to your Google Reviews page to leave a public review.' },
                            { step: '04', icon: <MessageSquare size={24} className="text-blue-400" />, title: 'Unhappy? Private Feedback', description: '1-3 star ratings see a private feedback form. You hear the issue before Google does.' },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-card p-6 md:p-8 rounded-2xl md:rounded-3xl border border-[var(--glass-border)] relative group hover:border-blue-500/20 transition-all"
                            >
                                <div className="absolute top-4 right-4 text-4xl font-black text-[var(--text-main)] opacity-5 select-none">
                                    {item.step}
                                </div>
                                <div className="w-12 h-12 mb-4 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500/20 transition-all">
                                    {item.icon}
                                </div>
                                <h3 className="text-base md:text-lg font-bold text-[var(--text-main)] mb-2">{item.title}</h3>
                                <p className="text-[var(--text-muted)] text-xs md:text-sm leading-relaxed">{item.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* ── SECTION 5: Benefits ── */}
                <motion.section
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="mb-24"
                >
                    <div className="text-center mb-12">
                        <h2 className="text-2xl md:text-5xl font-bold text-[var(--text-main)] mb-4">
                            Why Smart Reviews <span className="text-blue-500">Work</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { icon: <Shield size={24} className="text-blue-400" />, title: 'Protect Your Google Rating', description: 'Negative experiences get routed to private feedback instead of public reviews. Your rating stays intact.' },
                            { icon: <RefreshCw size={24} className="text-blue-400" />, title: 'Turn Feedback Into Improvement', description: 'Every piece of critical feedback is an opportunity to fix issues and win back clients before they leave.' },
                            { icon: <Zap size={24} className="text-blue-400" />, title: 'Automate the Ask', description: "Stop relying on memory or sticky notes. Every client gets asked for a review automatically at the right time." },
                            { icon: <Star size={24} className="text-blue-400 fill-blue-400" />, title: 'More 5-Star Reviews', description: 'Happy clients who are asked leave reviews. It is that simple. Watch your star count climb.' },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-start gap-4 md:gap-5 p-5 md:p-8 glass-card rounded-2xl md:rounded-3xl border border-[var(--glass-border)] group hover:border-blue-500/20 transition-all"
                            >
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 flex-shrink-0 group-hover:bg-blue-500/20 transition-all">
                                    {item.icon}
                                </div>
                                <div>
                                    <h3 className="text-base md:text-lg font-bold text-[var(--text-main)] mb-2">{item.title}</h3>
                                    <p className="text-[var(--text-muted)] text-xs md:text-sm leading-relaxed">{item.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* ── SECTION 6: Final CTA ── */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <div className="max-w-4xl mx-auto p-6 md:p-20 rounded-[1.5rem] md:rounded-[3rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent pointer-events-none" />
                        <div className="relative z-10">
                            <h2 className="text-xl md:text-5xl font-bold text-[var(--text-main)] mb-4 md:mb-8 tracking-tight leading-tight">
                                Ready to Turn Happy Clients Into <br className="hidden md:block" /><span className="text-blue-500">5-Star Marketing Machines?</span>
                            </h2>
                            <p className="text-sm md:text-xl text-[var(--text-muted)] mb-6 md:mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                                Let us set up Smart Reviews for your business. We will show you exactly how it works and what kind of impact it can have on your Google presence.
                            </p>
                            <button
                                onClick={openCalPopup}
                                className="inline-flex items-center gap-2 md:gap-3 bg-blue-600 text-white px-6 md:px-10 py-3 md:py-5 rounded-full text-sm md:text-lg font-bold hover:bg-blue-500 hover:scale-105 transition-all shadow-xl shadow-blue-600/25 active:scale-95 group"
                            >
                                Book a Consultation
                                <ArrowRight size={16} className="md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </motion.section>

            </div>
        </div>
    );
};

export default SmartReviews;
