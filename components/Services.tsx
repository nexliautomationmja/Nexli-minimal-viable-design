import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Palette, Layout, Cpu, CheckCircle2, Zap, MessageSquare } from 'lucide-react';
import { useTheme } from '../App';
import ResultsShowcase from './ResultsShowcase';
import { SparklesCore } from './Sparkles';
import { Vortex } from './Vortex';
import { ThreeDMarquee } from './ui/ThreeDMarquee';
import { NexliSparklesCard } from './ui/NexliSparklesCard';
import { VortexCard } from './ui/VortexCard';
import AIToolsShowcase from './ui/AIToolsShowcase';
import { BackgroundGradientAnimation } from './ui/BackgroundGradientAnimation';

const Services: React.FC = () => {
    const { theme } = useTheme();
    const [activeIndex, setActiveIndex] = useState(0);
    const [progress, setProgress] = useState(0);

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

    const services = [
        {
            id: 'branding',
            icon: <Palette className="w-6 h-6" />,
            title: "Brand Kit & Logo Design",
            label: "Identity",
            description: "Your brand is the first impression prospects get — make it count. We craft a complete visual identity system including logo design, color palette, typography, and brand guidelines.",
            benefits: [
                "Professional logo with variations",
                "Complete color & typography system",
                "Official brand guidelines document",
                "Ready-to-use digital assets"
            ]
        },
        {
            id: 'web-design',
            icon: <Layout className="w-6 h-6" />,
            title: "Web Design",
            label: "Presence",
            description: "Your website should work as hard as you do. We design and build premium, conversion-focused websites specifically for financial advisors — clean, fast, and high-performance.",
            benefits: [
                "Custom design tailored to your firm",
                "Mobile-responsive & lightning fast",
                "SEO-optimized structure",
                "Integrated booking systems"
            ]
        },
        {
            id: 'ai-automation',
            icon: <Cpu className="w-6 h-6" />,
            title: "AI Automations",
            label: "Intelligence",
            description: "Stop losing hours to repetitive tasks. We implement intelligent automations that handle appointment reminders, client onboarding, follow-ups, and re-engagement.",
            benefits: [
                "Automated reminders & onboarding",
                "Dormant client re-engagement",
                "24/7 AI chat assistant",
                "Zero-touch lead qualification"
            ]
        }
    ];

    // Auto-progression logic (ClickUp style progress bar)
    useEffect(() => {
        const duration = 10000; // 10 seconds per tab
        const interval = 100;
        const step = (interval / duration) * 100;

        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    setActiveIndex((current) => (current + 1) % services.length);
                    return 0;
                }
                return prev + step;
            });
        }, interval);

        return () => clearInterval(timer);
    }, [activeIndex, services.length]);

    const handleTabClick = (index: number) => {
        setActiveIndex(index);
        setProgress(0);
    };

    const heroContent = (
        <div className="relative z-10 max-w-5xl mx-auto text-center px-6 pt-24 md:pt-0">
            {/* Shimmer Badge */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="inline-block mb-6 md:mb-8"
            >
                <div className={`relative inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest overflow-hidden ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`}>
                    {/* Shimmer border effect */}
                    <span className="absolute inset-0 overflow-hidden rounded-full">
                        <span
                            className="absolute inset-[-100%] animate-[shimmer_3s_linear_infinite]"
                            style={{
                                background: theme === 'dark'
                                    ? 'conic-gradient(from 90deg at 50% 50%, #3b82f6 0%, transparent 50%, transparent 75%, #06b6d4 100%)'
                                    : 'conic-gradient(from 90deg at 50% 50%, #2563eb 0%, transparent 50%, transparent 75%, #0891b2 100%)'
                            }}
                        />
                    </span>
                    {/* Inner background */}
                    <span className={`absolute inset-[1.5px] rounded-full ${
                        theme === 'dark' ? 'bg-black' : 'bg-white'
                    }`} />
                    {/* Text */}
                    <span className="relative z-10">Our Services</span>
                </div>
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className={`text-3xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 md:mb-8 leading-[1.15] md:leading-[1.1] ${
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                }`}
            >
                Stop Chasing Clients.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
                    Start Attracting Them.
                </span>
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className={`text-base md:text-xl leading-relaxed max-w-2xl mx-auto mb-8 md:mb-10 ${
                    theme === 'dark' ? 'text-neutral-400' : 'text-slate-600'
                }`}
            >
                High-net-worth prospects are searching for an advisor right now. With the right digital presence, they'll find you, trust you, and book a call — before you ever pick up the phone.
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
            >
                <button
                    onClick={openCalPopup}
                    className="inline-flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-full text-base font-bold hover:bg-blue-500 hover:scale-105 transition-all shadow-xl shadow-blue-600/25 active:scale-95 group"
                >
                    Book a Consultation
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </motion.div>

            {/* Decorative line with glow */}
            <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="w-48 md:w-64 h-[2px] mx-auto mt-10 md:mt-12 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
                style={{ boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' }}
            />
        </div>
    );

    return (
        <div className="pb-20 overflow-hidden">
            {/* Hero Section - Sparkles for Dark, Vortex for Light */}
            {theme === 'dark' ? (
                <section className="relative min-h-[85vh] md:min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-black">
                    {/* Sparkles Background */}
                    <div className="absolute inset-0 w-full h-full">
                        <SparklesCore
                            id="services-sparkles"
                            background="transparent"
                            minSize={0.6}
                            maxSize={1.4}
                            particleCount={120}
                            particleColor="#FFFFFF"
                            speed={0.8}
                            className="w-full h-full"
                        />
                    </div>

                    {/* Gradient overlays for depth */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[var(--bg-main)] to-transparent pointer-events-none z-10" />

                    {heroContent}
                </section>
            ) : (
                <Vortex
                    backgroundColor="#ffffff"
                    baseHue={217}
                    particleCount={800}
                    rangeY={120}
                    baseRadius={1}
                    rangeRadius={2}
                    containerClassName="min-h-[85vh] md:min-h-[90vh] flex flex-col items-center justify-center"
                    className="flex flex-col items-center justify-center w-full"
                >
                    {/* Bottom fade for light mode */}
                    <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />
                    {heroContent}
                </Vortex>
            )}

            {/* Results Showcase - Sell the destination */}
            <ResultsShowcase />

            {/* Interactive Showcase Section (ClickUp Mimicry) */}
            <section className="px-6 relative">
                <div className="max-w-6xl mx-auto">
                    <div className={`relative rounded-[1.5rem] md:rounded-[3rem] border border-[var(--glass-border)] shadow-2xl overflow-hidden flex flex-col min-h-[550px] md:min-h-[650px] transition-colors duration-500 ${theme === 'dark' ? 'bg-[#050505]' : 'bg-white'}`}>

                        {/* Glowing Atmosphere */}
                        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] blur-[120px] pointer-events-none transition-opacity duration-500 ${theme === 'dark' ? 'bg-blue-500/5 opacity-100' : 'bg-blue-500/10 opacity-50'}`} />

                        {/* Display Area */}
                        <div className="flex-grow grid lg:grid-cols-2 gap-5 md:gap-12 p-5 md:p-16 items-center">

                            {/* Left Side: Content Reveal */}
                            <div className="relative z-10 order-2 lg:order-1">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeIndex}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        <div className="mb-4 md:mb-6 flex items-center gap-2 md:gap-3 text-blue-500">
                                            <div className="p-1.5 md:p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                                {services[activeIndex].icon}
                                            </div>
                                            <span className="font-bold tracking-widest uppercase text-[10px] md:text-xs">{services[activeIndex].label}</span>
                                        </div>
                                        <h2 className="text-2xl md:text-5xl font-bold mb-4 md:mb-6 tracking-tight leading-tight">
                                            {services[activeIndex].title}
                                        </h2>
                                        <p className="text-[var(--text-muted)] text-sm md:text-xl leading-relaxed mb-5 md:mb-8">
                                            {services[activeIndex].description}
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 md:gap-4">
                                            {services[activeIndex].benefits.map((benefit, i) => (
                                                <div key={i} className="flex items-start gap-2 md:gap-2.5 text-xs md:text-sm font-semibold">
                                                    <CheckCircle2 size={14} className="text-blue-500 shrink-0 mt-0.5 md:w-4 md:h-4" />
                                                    <span className="text-[var(--text-main)] opacity-90">{benefit}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Right Side: Animated Scene Frame */}
                            <div className="relative z-10 order-1 lg:order-2 h-full min-h-[220px] md:min-h-[300px] flex items-center justify-center">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeIndex}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.1 }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                        className="w-full h-full aspect-[4/3] md:aspect-auto md:h-[400px] rounded-xl md:rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-md relative overflow-hidden flex items-center justify-center shadow-inner"
                                    >
                                        {/* Branding Scene Content - Background Gradient Animation */}
                                        {activeIndex === 0 && (
                                            <BackgroundGradientAnimation
                                                gradientBackgroundStart="rgb(0, 17, 82)"
                                                gradientBackgroundEnd="rgb(2, 6, 23)"
                                                firstColor="59, 130, 246"
                                                secondColor="6, 182, 212"
                                                thirdColor="99, 102, 241"
                                                fourthColor="139, 92, 246"
                                                fifthColor="14, 165, 233"
                                                pointerColor="59, 130, 246"
                                                size="90%"
                                                blendingValue="hard-light"
                                                interactive={true}
                                                containerClassName="absolute inset-0 rounded-2xl"
                                            >
                                                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6 px-4 py-6 text-center">
                                                    {/* Top: Headline */}
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.8 }}
                                                        className="space-y-1"
                                                    >
                                                        <h3 className="text-lg md:text-xl font-bold text-white drop-shadow-lg">
                                                            Your Identity,{' '}
                                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                                                                Elevated.
                                                            </span>
                                                        </h3>
                                                    </motion.div>

                                                    {/* Middle: Typography Showcase */}
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.8, delay: 0.15 }}
                                                        className="w-full"
                                                    >
                                                        <p className="text-[10px] md:text-xs text-white/50 uppercase tracking-widest mb-2 font-semibold">
                                                            Typography
                                                        </p>
                                                        <div className="flex items-center justify-center gap-4 md:gap-6">
                                                            {[
                                                                { font: "'Plus Jakarta Sans', sans-serif", label: 'Plus Jakarta Sans', weight: 800 },
                                                                { font: "'Outfit', sans-serif", label: 'Outfit', weight: 700 },
                                                            ].map((typo, i) => (
                                                                <motion.div
                                                                    key={typo.label}
                                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    transition={{ duration: 0.4, delay: 0.25 + i * 0.1 }}
                                                                    className="flex flex-col items-center gap-1 group"
                                                                >
                                                                    <span
                                                                        style={{ fontFamily: typo.font, fontWeight: typo.weight }}
                                                                        className="text-xl md:text-2xl text-white tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-cyan-400 transition-all duration-300"
                                                                    >
                                                                        Nexli
                                                                    </span>
                                                                    <span className="text-[8px] md:text-[10px] text-white/40 font-medium">
                                                                        {typo.label}
                                                                    </span>
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    </motion.div>

                                                    {/* Bottom: Logo Showcase */}
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.8, delay: 0.3 }}
                                                        className="w-full"
                                                    >
                                                        <p className="text-[10px] md:text-xs text-white/50 uppercase tracking-widest mb-2 font-semibold">
                                                            Logo Variations
                                                        </p>
                                                        <div className="flex items-center justify-center gap-2 md:gap-3">
                                                            {[
                                                                { src: '/logos/nexli-icon-gradient.png', label: 'Gradient' },
                                                                { src: '/logos/nexli-icon-deepblue.png', label: 'Deep Blue' },
                                                                { src: '/logos/nexli-icon-dark.png', label: 'Dark' },
                                                                { src: '/logos/nexli-icon-blue.png', label: 'Blue' },
                                                                { src: '/logos/nexli-icon-white.png', label: 'White' },
                                                            ].map((logo, i) => (
                                                                <motion.div
                                                                    key={logo.label}
                                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    transition={{ duration: 0.4, delay: 0.4 + i * 0.08 }}
                                                                    className="flex flex-col items-center gap-1 group"
                                                                >
                                                                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300">
                                                                        <img
                                                                            src={logo.src}
                                                                            alt={`Nexli ${logo.label}`}
                                                                            className="w-5 h-5 md:w-6 md:h-6 object-contain"
                                                                        />
                                                                    </div>
                                                                    <span className="text-[7px] md:text-[9px] text-white/40 font-medium hidden md:block">
                                                                        {logo.label}
                                                                    </span>
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                </div>
                                            </BackgroundGradientAnimation>
                                        )}

                                        {/* Web Scene Content - 3D Marquee Showcase */}
                                        {activeIndex === 1 && (
                                            <div className="w-full h-full overflow-hidden rounded-2xl bg-gray-950/5 dark:bg-neutral-800">
                                                <ThreeDMarquee
                                                    images={[
                                                        <NexliSparklesCard key="nexli" />,
                                                        "https://assets.aceternity.com/cloudinary_bkp/3d-card.png",
                                                        "https://assets.aceternity.com/animated-modal.png",
                                                        "https://assets.aceternity.com/github-globe.png",
                                                        "https://assets.aceternity.com/glare-card.png",
                                                        "https://assets.aceternity.com/hero-highlight.png",
                                                        <VortexCard key="vortex2" />,
                                                        "https://assets.aceternity.com/spotlight-new.webp",
                                                        "https://assets.aceternity.com/tabs.png",
                                                        "https://assets.aceternity.com/vortex.png",
                                                        "https://assets.aceternity.com/wobble-card.png",
                                                        "https://assets.aceternity.com/world-map.webp",
                                                    ]}
                                                />
                                            </div>
                                        )}

                                        {/* AI Scene Content - AI Tools Showcase */}
                                        {activeIndex === 2 && (
                                            <AIToolsShowcase />
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Interaction Tabs (Footer of frame) */}
                        <div className={`border-t border-[var(--glass-border)] backdrop-blur-md grid grid-cols-3 transition-colors duration-500 ${theme === 'dark' ? 'bg-black/40' : 'bg-slate-50/50'}`}>
                            {services.map((service, index) => (
                                <button
                                    key={service.id}
                                    onClick={() => handleTabClick(index)}
                                    className={`relative px-3 py-4 md:p-8 transition-all border-r border-[var(--glass-border)] last:border-r-0 text-left group hover:bg-white/5 ${activeIndex === index ? (theme === 'dark' ? 'bg-white/[0.03]' : 'bg-blue-500/5') : ''}`}
                                >
                                    {/* Active Highlight Line & Progress */}
                                    <div className={`absolute top-0 left-0 h-[2px] w-full ${theme === 'dark' ? 'bg-white/10' : 'bg-blue-500/10'}`}>
                                        {activeIndex === index && (
                                            <motion.div
                                                className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                                initial={{ width: "0%" }}
                                                animate={{ width: `${progress}%` }}
                                                transition={{ ease: "linear", duration: 0.1 }}
                                            />
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <span className={`text-[9px] md:text-sm font-bold uppercase tracking-[0.15em] md:tracking-[0.2em] transition-colors ${activeIndex === index ? 'text-blue-500' : (theme === 'dark' ? 'text-neutral-500 group-hover:text-neutral-300' : 'text-slate-400 group-hover:text-slate-600')}`}>
                                            {service.label}
                                        </span>
                                        <span className={`text-[10px] md:text-sm font-semibold transition-colors leading-tight ${activeIndex === index ? (theme === 'dark' ? 'text-white' : 'text-slate-900') : (theme === 'dark' ? 'text-neutral-400 group-hover:text-neutral-200' : 'text-slate-500 group-hover:text-slate-700')}`}>
                                            {service.title}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Existing Closing Section */}
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
