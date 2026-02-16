import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Globe, Cpu, Star, CheckCircle, Zap, Clock, Bot, Calendar, Send, TrendingUp, FileText, Shield } from 'lucide-react';
import { useTheme } from '../App';
import { SparklesCore } from './Sparkles';
import { Timeline } from './ui/Timeline';
import { WeatherFx } from './ui/WeatherFx';

const Services: React.FC = () => {
    const { theme } = useTheme();

    // Load Cal.com embed script
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

    // Function to open Cal.com popup
    const openCalPopup = () => {
        const Cal = (window as any).Cal;
        if (Cal && Cal.ns && Cal.ns["nexli-demo"]) {
            Cal.ns["nexli-demo"]("modal", {
                calLink: "nexli-automation-6fgn8j/nexli-demo",
                config: { "layout": "month_view", "theme": theme },
            });
        }
    };

    // Google G with animated stars component for Step 3
    const GoogleReviewAnimation = () => {
        return (
            <div className="flex flex-col items-center justify-center gap-2 md:gap-4 py-4 md:py-8">
                <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                >
                    <svg className="w-10 h-10 md:w-16 md:h-16" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                </motion.div>
                <div className="flex gap-1 md:gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <motion.div
                            key={s}
                            initial={{ scale: 0, rotate: -30 }}
                            whileInView={{ scale: 1, rotate: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 + s * 0.1, type: "spring", stiffness: 200 }}
                        >
                            <Star
                                className="w-5 h-5 md:w-7 md:h-7 text-yellow-400 fill-yellow-400"
                                style={{ filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.6))' }}
                            />
                        </motion.div>
                    ))}
                </div>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.9 }}
                    className={`text-xs md:text-sm font-semibold ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}
                >
                    5-Star Reviews on Autopilot
                </motion.p>
            </div>
        );
    };

    // Timeline data for Digital Rainmaker System
    const timelineData = [
        {
            title: "Step 1",
            content: (
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                            <Globe className="w-6 h-6 text-blue-500" />
                        </div>
                        <h4 className={`text-xl md:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                            A Premium Website
                        </h4>
                    </div>
                    <p className={`mb-6 text-sm md:text-base leading-relaxed ${theme === 'dark' ? 'text-neutral-300' : 'text-slate-600'}`}>
                        Designed specifically for the financial services trust threshold (not a template, not a generic small business site). Your website should work as hard as you do.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                        {[
                            "Custom design tailored to your firm",
                            "Mobile-responsive & lightning fast",
                            "SEO-optimized structure",
                            "Integrated booking systems",
                            "Conversion-focused layouts",
                            "Trust signals & social proof"
                        ].map((benefit, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                                <CheckCircle size={16} className="text-blue-500 shrink-0 mt-0.5" />
                                <span className={theme === 'dark' ? 'text-neutral-300' : 'text-slate-600'}>{benefit}</span>
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className={`rounded-xl p-4 border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}
                        >
                            <TrendingUp className="w-8 h-8 text-blue-500 mb-2" />
                            <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-white/70' : 'text-slate-500'}`}>
                                Attract high-value clients who trust you before the first call
                            </p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className={`rounded-xl p-4 border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}
                        >
                            <Zap className="w-8 h-8 text-cyan-500 mb-2" />
                            <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-white/70' : 'text-slate-500'}`}>
                                Stand out from competitors with outdated sites
                            </p>
                        </motion.div>
                    </div>
                </div>
            ),
        },
        {
            title: "Step 2",
            content: (
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                            <Cpu className="w-6 h-6 text-cyan-500" />
                        </div>
                        <h4 className={`text-xl md:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                            An AI Automation Layer
                        </h4>
                    </div>
                    <p className={`mb-6 text-sm md:text-base leading-relaxed ${theme === 'dark' ? 'text-neutral-300' : 'text-slate-600'}`}>
                        That captures leads 24/7, follows up automatically, nurtures prospects through sequences, and books appointments to your calendar without your staff lifting a finger.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                        {[
                            "24/7 lead capture & response",
                            "Automated follow-up sequences",
                            "Prospect nurturing campaigns",
                            "Automated appointment booking",
                            "AI chat assistant for your site",
                            "Zero-touch lead qualification",
                            "Secure client document collection"
                        ].map((benefit, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                                <CheckCircle size={16} className="text-cyan-500 shrink-0 mt-0.5" />
                                <span className={theme === 'dark' ? 'text-neutral-300' : 'text-slate-600'}>{benefit}</span>
                            </div>
                        ))}
                    </div>
                    <div className={`rounded-2xl p-6 border ${theme === 'dark' ? 'bg-gradient-to-br from-cyan-950/50 to-blue-950/50 border-white/10' : 'bg-gradient-to-br from-cyan-50 to-blue-50 border-slate-200'}`}>
                        <div className="flex flex-wrap gap-4 justify-center">
                            {[
                                { icon: Clock, label: "24/7 Response" },
                                { icon: Bot, label: "AI Assistant" },
                                { icon: Send, label: "Auto Follow-up" },
                                { icon: Calendar, label: "Smart Booking" },
                                { icon: FileText, label: "Doc Vault" },
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex flex-col items-center gap-2"
                                >
                                    <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-white/10' : 'bg-white shadow-sm'}`}>
                                        <item.icon className="w-6 h-6 text-cyan-500" />
                                    </div>
                                    <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>
                                        {item.label}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Document Portal callout */}
                    <div className={`rounded-2xl p-5 mt-6 border-2 border-dashed ${theme === 'dark' ? 'border-cyan-500/30 bg-cyan-500/5' : 'border-cyan-500/40 bg-cyan-50'}`}>
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-cyan-500/20 shrink-0">
                                <Shield className="w-5 h-5 text-cyan-500" />
                            </div>
                            <div>
                                <p className={`font-bold mb-1 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>
                                    Secure Document Collection
                                </p>
                                <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-neutral-300' : 'text-slate-600'}`}>
                                    Stop emailing W-2s. Collect client documents through your firm's own branded portal with AES-256 encryption and per-firm isolated storage.
                                </p>
                                <button
                                    onClick={() => {
                                        window.history.pushState({}, '', '/document-portal');
                                        window.dispatchEvent(new PopStateEvent('popstate'));
                                    }}
                                    className="inline-flex items-center gap-1.5 text-cyan-500 text-sm font-bold hover:text-cyan-400 transition-colors bg-transparent border-none p-0 cursor-pointer"
                                >
                                    See the Demo
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: "Step 3",
            content: (
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                            <Star className="w-6 h-6 text-yellow-500" />
                        </div>
                        <h4 className={`text-xl md:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                            A Google Review Amplification Engine
                        </h4>
                    </div>
                    <p className={`mb-6 text-sm md:text-base leading-relaxed ${theme === 'dark' ? 'text-neutral-300' : 'text-slate-600'}`}>
                        That automatically requests and routes Google reviews from satisfied clients, turning your happiest tax season clients into a compounding trust asset that drives new leads year-round.
                    </p>

                    {/* The Secret Weapon callout */}
                    <div className={`rounded-2xl p-5 mb-6 border-2 border-dashed ${theme === 'dark' ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-yellow-500/40 bg-yellow-50'}`}>
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-yellow-500/20">
                                <Zap className="w-5 h-5 text-yellow-500" />
                            </div>
                            <div>
                                <p className={`font-bold mb-1 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
                                    Your Secret Weapon
                                </p>
                                <p className={`text-sm ${theme === 'dark' ? 'text-neutral-300' : 'text-slate-600'}`}>
                                    Nobody in the CPA web design world is talking about systematically engineering Google reviews as a lead generation mechanism. Most CPAs have 4 to 12 reviews sitting on Google. The firms dominating local search have 80 or more.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                        {[
                            "Automated review requests via SMS & email",
                            "Triggers at the perfect moment",
                            "Happy clients routed to Google",
                            "Unhappy feedback stays private",
                            "Protect your Google rating",
                            "Compound your trust signals"
                        ].map((benefit, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                                <CheckCircle size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                                <span className={theme === 'dark' ? 'text-neutral-300' : 'text-slate-600'}>{benefit}</span>
                            </div>
                        ))}
                    </div>

                    {/* Google G with animated stars */}
                    <div className={`rounded-2xl border overflow-hidden ${theme === 'dark' ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-white/10' : 'bg-gradient-to-br from-slate-100 to-white border-slate-200'}`}>
                        <GoogleReviewAnimation />
                        <div className={`px-4 pb-4 md:px-6 md:pb-6 flex items-center justify-center`}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 1, type: "spring", stiffness: 200 }}
                                className="relative inline-flex items-center rounded-full overflow-hidden p-[1px] md:p-[1.5px]"
                            >
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
                                <span className="relative z-10 inline-flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-5 md:py-2.5 rounded-full bg-[var(--bg-main)]">
                                    <svg className="w-3.5 h-3.5 md:w-[18px] md:h-[18px] flex-shrink-0" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    <span className="text-[var(--text-main)] text-[10px] md:text-sm font-black tracking-[0.1em] md:tracking-[0.15em] uppercase">Google Reviews</span>
                                </span>
                            </motion.div>
                        </div>
                    </div>
                </div>
            ),
        },
    ];

    // No longer using heroContent - hero is now inline with rain effect

    return (
        <div className="pb-20 overflow-hidden">
            {/* Hero Section - Always Dark with Rain */}
            <section className="relative min-h-[85vh] md:min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-black">
                {/* Rain Effect */}
                <WeatherFx
                    height={60}
                    type="rain"
                    intensity={200}
                    colors={["brand-solid-light"]}
                    speed={2}
                />

                {/* Sparkles Background */}
                <div className="absolute inset-0 w-full h-full">
                    <SparklesCore
                        id="services-sparkles"
                        background="transparent"
                        minSize={0.4}
                        maxSize={1}
                        particleCount={80}
                        particleColor="#FFFFFF"
                        speed={0.5}
                        className="w-full h-full"
                    />
                </div>

                {/* Gradient overlays for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50 pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[var(--bg-main)] to-transparent pointer-events-none z-10" />

                {/* Hero Content */}
                <div className="relative z-10 max-w-5xl mx-auto text-center px-6 pt-24 md:pt-0">
                    {/* Animated Title - The Digital Rainmaker System */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="relative z-10 text-3xl md:text-6xl lg:text-7xl font-bold mb-6 md:mb-8 max-w-4xl mx-auto text-white leading-[1.15] md:leading-[1.1]"
                    >
                        {"The Digital Rainmaker System".split(" ").map((word, index) => (
                            <motion.span
                                key={index}
                                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                transition={{
                                    duration: 0.5,
                                    delay: 0.3 + index * 0.1,
                                    ease: "easeOut"
                                }}
                                className={`inline-block mr-3 md:mr-4 ${
                                    word === "Rainmaker"
                                        ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500"
                                        : ""
                                }`}
                            >
                                {word}
                            </motion.span>
                        ))}
                        <motion.span
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.8, type: "spring", stiffness: 200 }}
                            className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500"
                        >
                            &trade;
                        </motion.span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.9 }}
                        className="relative z-10 text-base md:text-xl max-w-2xl mx-auto mb-8 md:mb-10 text-neutral-300 leading-relaxed"
                    >
                        Your firm's 24/7 client acquisition machine. A premium website, AI automation, and Google review engine — working together to attract high-value clients while you sleep.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 1 }}
                    >
                        <button
                            onClick={openCalPopup}
                            className="inline-flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-full text-base font-bold hover:bg-blue-500 hover:scale-105 transition-all shadow-xl shadow-blue-600/25 active:scale-95 group"
                        >
                            See How It Works
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>

                    {/* Decorative line with glow */}
                    <motion.div
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        transition={{ duration: 1, delay: 1.2 }}
                        className="w-48 md:w-64 h-[2px] mx-auto mt-10 md:mt-12 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
                        style={{ boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' }}
                    />
                </div>
            </section>

            {/* Rain Banner Transition */}
            <section className="px-4 md:px-10 -mt-20 relative z-20">
                <div className="relative max-w-7xl mx-auto py-16 md:py-24 px-4 md:px-8 lg:px-10 bg-black rounded-3xl overflow-hidden">
                    {/* Rain Effect */}
                    <WeatherFx
                        height={20}
                        type="rain"
                        intensity={150}
                        colors={["brand-solid-light"]}
                        speed={2}
                    />

                    <div className="relative z-10 text-center">
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-xs md:text-sm font-black tracking-[0.2em] uppercase text-blue-400 mb-3"
                        >
                            3-Step System
                        </motion.p>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-2xl md:text-4xl font-bold text-white max-w-2xl mx-auto"
                        >
                            Here's How It Works
                        </motion.h2>
                    </div>
                </div>
            </section>

            {/* Digital Rainmaker System Timeline */}
            <section className={`${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
                <Timeline data={timelineData} />
            </section>

            {/* Closing CTA Section */}
            <section className="px-4 md:px-6 mt-16 md:mt-32 text-center">
                <div className="max-w-4xl mx-auto p-6 md:p-20 rounded-[1.5rem] md:rounded-[3rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent pointer-events-none" />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-xl md:text-5xl font-bold mb-4 md:mb-8 tracking-tight leading-tight">
                            Build Your Vision. <br className="hidden md:block" /> <span className="text-blue-500">Automate Your Firm.</span>
                        </h2>
                        <p className="text-sm md:text-xl text-[var(--text-muted)] mb-6 md:mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                            Most firms bundle all three for a complete digital transformation. But if you need to start with just one — that works too. Let's talk about what makes sense for your firm.
                        </p>

                        <button
                            onClick={openCalPopup}
                            className="inline-flex items-center gap-2 md:gap-3 bg-blue-600 text-white px-6 md:px-10 py-3 md:py-5 rounded-full text-sm md:text-lg font-bold hover:bg-blue-500 hover:scale-105 transition-all shadow-xl shadow-blue-600/25 active:scale-95 group"
                        >
                            Book a Consultation
                            <ArrowRight size={16} className="md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Services;
