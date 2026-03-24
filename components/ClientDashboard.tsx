'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight,
    FileText,
    PenLine,
    MessageSquare,
    Upload,
    Users,
    LayoutDashboard,
    ChevronDown,
    CheckCircle,
    BarChart3,
    Shuffle,
    Eye,
    EyeOff,
    AlertTriangle,
    Inbox,
    Clock,
    Send,
    CreditCard,
    Shield,
    Zap,
    Link,
    FolderOpen,
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useBooking } from './QualificationProvider';

// ── Sub-icon set for hero ───────────────────────────────
const heroIcons = [Users, FileText, PenLine, MessageSquare, Upload];

// ── Problem Stats Data ──────────────────────────────────
const problemStats = [
    {
        id: 'scatter',
        icon: <Shuffle className="w-5 h-5 md:w-6 md:h-6" />,
        stat: 'The Scatter',
        label: 'Tool Overload',
        title: 'Your Firm Runs on 6+ Disconnected Tools',
        description: "QuickBooks for invoicing. Dropbox for documents. Email for engagement letters. DocuSign for signatures. A separate app for messaging. You're paying for six tools, switching between six logins, and none of them talk to each other.",
        benefits: [
            'Clients confused by multiple platforms',
            'No single source of truth for client data',
            'Hours wasted switching between apps',
            'Data silos create costly errors',
        ],
    },
    {
        id: 'chase',
        icon: <Inbox className="w-5 h-5 md:w-6 md:h-6" />,
        stat: 'The Chase',
        label: 'Client Friction',
        title: '67% of Clients Won\'t Return If the Experience Is Frustrating',
        description: "Your clients dread tax season because working with you means downloading apps, creating accounts, remembering passwords, and hunting for email attachments. The harder you are to work with, the easier it is for them to leave.",
        benefits: [
            'Clients expect modern self-service portals',
            'Paper engagement letters get lost',
            'Document requests buried in email threads',
            'Payment friction delays your revenue',
        ],
    },
    {
        id: 'blind',
        icon: <EyeOff className="w-5 h-5 md:w-6 md:h-6" />,
        stat: 'The Blind Spot',
        label: 'No Visibility',
        title: 'You Don\'t Know What\'s Missing Until It\'s Too Late',
        description: "Right now, you have no single view of who signed their engagement letter, who paid their invoice, who uploaded documents, and who hasn't responded. You're flying blind — and things slip through the cracks every single week.",
        benefits: [
            'No real-time client status overview',
            'Missing documents delay tax filing',
            'Unsigned letters create liability risk',
            'Unpaid invoices go unnoticed for weeks',
        ],
    },
];

// ── Platform Cards Data ─────────────────────────────────
const platformCards = [
    {
        icon: <Users className="w-4 h-4 md:w-5 md:h-5" />,
        title: 'Client Portal',
        description:
            'Your clients log in to one place — branded to your firm. They see their invoices, sign engagement letters, upload documents, and message you directly. No extra apps, no confusion.',
        color: 'cyan',
    },
    {
        icon: <FileText className="w-4 h-4 md:w-5 md:h-5" />,
        title: 'Invoicing & Payments',
        description:
            'Send professional invoices in seconds. Track what\'s paid, what\'s overdue, and let clients pay online. No more chasing checks or wondering who owes what.',
        color: 'teal',
    },
    {
        icon: <PenLine className="w-4 h-4 md:w-5 md:h-5" />,
        title: 'Engagement Letters',
        description:
            'Send, track, and collect digital signatures on engagement letters. Know who signed and who hasn\'t — instantly. No printing, scanning, or lost paperwork.',
        color: 'sky',
    },
    {
        icon: <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />,
        title: 'Secure Messaging',
        description:
            'A direct line to your clients, built right into the portal. No more digging through email threads or wondering if they saw your message. You see who\'s read what.',
        color: 'blue',
    },
    {
        icon: <Upload className="w-4 h-4 md:w-5 md:h-5" />,
        title: 'Document Collection',
        description:
            'Clients upload W-2s, 1099s, and statements through your branded portal. Encrypted, organized by client, and ready when you need them. No email attachments ever again.',
        color: 'indigo',
    },
    {
        icon: <Shield className="w-4 h-4 md:w-5 md:h-5" />,
        title: 'Quantum-Resistant Security',
        description:
            'Every file, message, and document is protected with AES-256 encryption — a standard classified as quantum-resistant. Your clients\' data stays secure today and against tomorrow\'s threats.',
        color: 'violet',
    },
];

const colorMap: Record<string, { iconDark: string; iconLight: string; text: string }> = {
    cyan: { iconDark: 'bg-cyan-500/10 border-cyan-500/20', iconLight: 'bg-cyan-50 border-cyan-200', text: 'text-cyan-400' },
    teal: { iconDark: 'bg-teal-500/10 border-teal-500/20', iconLight: 'bg-teal-50 border-teal-200', text: 'text-teal-400' },
    sky: { iconDark: 'bg-sky-500/10 border-sky-500/20', iconLight: 'bg-sky-50 border-sky-200', text: 'text-sky-400' },
    blue: { iconDark: 'bg-blue-500/10 border-blue-500/20', iconLight: 'bg-blue-50 border-blue-200', text: 'text-blue-400' },
    indigo: { iconDark: 'bg-indigo-500/10 border-indigo-500/20', iconLight: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-400' },
    violet: { iconDark: 'bg-violet-500/10 border-violet-500/20', iconLight: 'bg-violet-50 border-violet-200', text: 'text-violet-400' },
};

// ── How It Works — Expanding Step Cards ─────────────────
const expandedStepCards = [
    { step: '01', title: 'We Build Your Dashboard', description: 'We design and deploy a custom-branded dashboard and client portal for your firm. Your logo, your colors, your domain — it looks and feels like yours because it is.', bg: 'from-cyan-950 via-teal-900 to-sky-900' },
    { step: '02', title: 'Clients Get Portal Access', description: 'Clients receive a secure magic link via email or SMS. One click and they\'re in their portal — no passwords to remember, no accounts to create. Zero friction.', bg: 'from-teal-950 via-cyan-900 to-blue-900' },
    { step: '03', title: 'Everything in One Place', description: 'Invoices, engagement letters, documents, and messages — all organized by client in one unified view. One platform replaces six scattered tools.', bg: 'from-sky-950 via-blue-900 to-cyan-900' },
    { step: '04', title: 'You Run Your Practice', description: 'Focus on advisory work while the dashboard handles client management. Track who\'s signed, who\'s paid, and who\'s uploaded — chase nothing.', bg: 'from-blue-950 via-indigo-900 to-cyan-900' },
];
const ExpandedStepIcons = [LayoutDashboard, Link, FolderOpen, Zap];

// ── FAQ ─────────────────────────────────────────────────
const faqItems = [
    {
        question: 'Is this a template or is it custom to my firm?',
        answer: 'Fully custom. Your logo, your colors, your domain. Clients see your brand — not ours. Every dashboard is deployed as a standalone instance for your firm.',
    },
    {
        question: 'Do my clients need to create an account?',
        answer: 'No. Clients access their portal through a secure magic link sent via email or SMS. One click and they\'re in — no passwords, no account creation, no friction.',
    },
    {
        question: 'Can I send invoices and collect payments through this?',
        answer: 'Yes. Create professional invoices, send them to clients, and track payment status in real-time. Clients can pay online directly from the portal. You\'ll know the moment it\'s paid.',
    },
    {
        question: 'How long does setup take?',
        answer: 'We handle everything. Your dashboard and client portal are typically live within 5–7 business days of onboarding. You don\'t need any technical knowledge — we build, deploy, and train you on it.',
    },
];

// ── Component ───────────────────────────────────────────
const ClientDashboard: React.FC = () => {
    const { theme } = useTheme();
    const { openBooking } = useBooking();
    const [expandedStep, setExpandedStep] = useState<number>(0);
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
    const [activeStatIndex, setActiveStatIndex] = useState(0);
    const [statProgress, setStatProgress] = useState(0);

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
            const displayArea = document.getElementById('dashboard-stat-display');
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
                        transition={{ duration: 0.8, ease: "circOut" }}
                    >
                        {/* Rotating gradient badge */}
                        <div className="relative inline-flex items-center mb-6 rounded-full overflow-hidden p-[1.5px]">
                            <span
                                className="absolute inset-[-100%] animate-[shimmer_8s_linear_infinite] opacity-80"
                                style={{
                                    background: 'conic-gradient(from 0deg at 50% 50%, #06B6D4, #0891B2, #0E7490, #22D3EE, #06B6D4)'
                                }}
                            />
                            <span
                                className="absolute inset-[-100%] animate-[shimmer_8s_linear_infinite] blur-md opacity-40"
                                style={{
                                    background: 'conic-gradient(from 0deg at 50% 50%, #06B6D4, #0891B2, #0E7490, #22D3EE, #06B6D4)'
                                }}
                            />
                            <span className="relative z-10 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-main)]">
                                <LayoutDashboard size={14} className="text-cyan-400" />
                                <span className="text-[var(--text-main)] text-[10px] md:text-xs font-black tracking-[0.2em] uppercase">Client Dashboard</span>
                            </span>
                        </div>

                        <h1 className="text-[26px] sm:text-4xl md:text-6xl font-black text-[var(--text-main)] mb-6 leading-tight tracking-tighter" style={{ fontFamily: "'Syne', sans-serif" }}>
                            Your Entire Practice.{' '}
                            <br className="hidden md:block" /><span className="text-cyan-500">One Dashboard.</span>
                        </h1>

                        {/* Mobile-only animated visual */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, ease: "circOut" }}
                            className="flex lg:hidden items-center justify-center my-8 relative"
                        >
                            <div className="absolute inset-0 bg-cyan-500/10 blur-[80px] rounded-full" />
                            <div className="relative z-10 flex flex-col items-center gap-3">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                                >
                                    <LayoutDashboard size={48} className="text-cyan-400" style={{ filter: 'drop-shadow(0 0 20px rgba(6, 182, 212, 0.4))' }} />
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
                                                y: { delay: 0.8 + i * 0.15, duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut" },
                                                rotateX: { delay: 0.8 + i * 0.15, duration: 3.5 + i * 0.3, repeat: Infinity, ease: "easeInOut" },
                                                rotateY: { delay: 0.8 + i * 0.15, duration: 4 + i * 0.5, repeat: Infinity, ease: "easeInOut" },
                                            }}
                                            style={{ transformStyle: 'preserve-3d' }}
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center" style={{ filter: 'drop-shadow(0 4px 8px rgba(6, 182, 212, 0.3))' }}>
                                                <Icon size={20} className="text-cyan-400" />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        <p className="text-sm sm:text-lg md:text-xl text-[var(--text-muted)] mb-8 max-w-xl leading-relaxed">
                            Stop juggling six different tools to run your firm. Invoicing, engagement letters, client messaging, document collection, and a branded client portal — all in one place your clients actually enjoy using.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-5">
                            <button
                                onClick={openBooking}
                                className="flex items-center justify-center gap-2 bg-cyan-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-full text-sm font-bold hover:bg-cyan-500 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-cyan-600/20 group"
                            >
                                Book a Consultation
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => document.getElementById('platform-overview')?.scrollIntoView({ behavior: 'smooth' })}
                                className="flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 rounded-full text-sm font-bold text-[var(--text-main)] border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-md hover:border-cyan-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                See What&apos;s Inside
                            </button>
                        </div>
                    </motion.div>

                    {/* Right side decorative icons — desktop only */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: "circOut" }}
                        className="relative hidden lg:flex items-center justify-center"
                    >
                        <div className="absolute inset-0 bg-cyan-500/10 blur-[100px] rounded-full" />
                        <div className="relative z-10 flex flex-col items-center gap-4">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                                className="flex items-center gap-3"
                            >
                                <LayoutDashboard size={48} className="text-cyan-400" />
                                <span className="text-3xl font-bold text-[var(--text-main)]">Client Dashboard</span>
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
                                            y: { delay: 0.8 + i * 0.15, duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut" },
                                            rotateX: { delay: 0.8 + i * 0.15, duration: 3.5 + i * 0.3, repeat: Infinity, ease: "easeInOut" },
                                            rotateY: { delay: 0.8 + i * 0.15, duration: 4 + i * 0.5, repeat: Infinity, ease: "easeInOut" },
                                            rotateZ: { delay: 0.8 + i * 0.15, duration: 5 + i * 0.4, repeat: Infinity, ease: "easeInOut" },
                                        }}
                                        style={{ transformStyle: 'preserve-3d' }}
                                    >
                                        <div
                                            className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center"
                                            style={{ filter: 'drop-shadow(0 4px 8px rgba(6, 182, 212, 0.3))' }}
                                        >
                                            <Icon size={28} className="text-cyan-400" />
                                        </div>
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
                        <div className="inline-flex items-center gap-2 mb-4 md:mb-6 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                            <BarChart3 size={14} className="text-cyan-400" />
                            <span className="text-cyan-400 text-[9px] md:text-xs font-black tracking-[0.2em] uppercase">The Problem</span>
                        </div>
                        <h2 className="text-2xl md:text-5xl font-bold text-[var(--text-main)] mb-4 md:mb-6">
                            Scattered Tools = <span className="text-cyan-500">Scattered Practice</span>
                        </h2>
                        <p className="text-[var(--text-muted)] max-w-2xl mx-auto text-sm md:text-lg">
                            Modern CPA firms are drowning in disconnected software. Here&apos;s how it&apos;s costing you clients, revenue, and sanity.
                        </p>
                    </div>

                    <div className="max-w-6xl mx-auto">
                        <div className={`relative rounded-[1.5rem] md:rounded-[3rem] border border-[var(--glass-border)] shadow-2xl overflow-hidden flex flex-col md:min-h-[600px] transition-colors duration-500 ${theme === 'dark' ? 'bg-[#050505]' : 'bg-white'}`}>

                            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] blur-[120px] pointer-events-none transition-opacity duration-500 ${theme === 'dark' ? 'bg-cyan-500/5 opacity-100' : 'bg-cyan-500/10 opacity-50'}`} />

                            <div id="dashboard-stat-display" className="flex-grow grid lg:grid-cols-2 gap-5 md:gap-12 p-5 md:p-16 items-center">
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
                                            <div className="mb-4 md:mb-6 flex items-center gap-2 md:gap-3 text-cyan-500">
                                                <div className="p-1.5 md:p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
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
                                                        <CheckCircle size={14} className="text-cyan-500 shrink-0 mt-0.5 md:w-4 md:h-4" />
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
                                            {/* Scene 1: The Scatter — floating app icons */}
                                            {activeStatIndex === 0 && (
                                                <div className="w-full h-full flex items-center justify-center p-4 md:p-8">
                                                    <div className="relative w-full max-w-[280px]">
                                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-4">
                                                            <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Your current tech stack</span>
                                                        </motion.div>
                                                        <div className="grid grid-cols-3 gap-2.5">
                                                            {[
                                                                { name: 'Invoicing', icon: CreditCard, color: 'cyan' },
                                                                { name: 'Documents', icon: Upload, color: 'teal' },
                                                                { name: 'Signatures', icon: PenLine, color: 'sky' },
                                                                { name: 'Messaging', icon: MessageSquare, color: 'blue' },
                                                                { name: 'Portal', icon: Users, color: 'indigo' },
                                                                { name: 'Files', icon: FileText, color: 'violet' },
                                                            ].map((app, i) => (
                                                                <motion.div
                                                                    key={i}
                                                                    initial={{ opacity: 0, scale: 0, rotate: -10 }}
                                                                    animate={{ opacity: 1, scale: 1, rotate: 0, y: [0, -3, 0] }}
                                                                    transition={{
                                                                        opacity: { delay: 0.1 + i * 0.1, duration: 0.4 },
                                                                        scale: { delay: 0.1 + i * 0.1, duration: 0.4, type: "spring" },
                                                                        y: { delay: 0.6 + i * 0.15, duration: 2 + i * 0.3, repeat: Infinity, ease: "easeInOut" },
                                                                    }}
                                                                    className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-white/5 border border-white/10"
                                                                >
                                                                    <app.icon size={16} className="text-white/40" />
                                                                    <span className="text-white/30 text-[8px] font-bold">{app.name}</span>
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="flex items-center justify-center gap-2 mt-4 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 mx-auto w-fit">
                                                            <AlertTriangle size={10} className="text-red-400" />
                                                            <span className="text-red-400 text-[9px] font-bold">6 tools. 6 logins. Zero integration.</span>
                                                        </motion.div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Scene 2: The Chase — frustrated client journey */}
                                            {activeStatIndex === 1 && (
                                                <div className="w-full h-full flex items-center justify-center p-4 md:p-8">
                                                    <div className="w-full max-w-[260px] space-y-3">
                                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-3">
                                                            <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Client experience today</span>
                                                        </motion.div>
                                                        {[
                                                            { step: '1', action: 'Check email for invoice link', status: 'frustrated', icon: FileText },
                                                            { step: '2', action: 'Download app for documents', status: 'frustrated', icon: Upload },
                                                            { step: '3', action: 'Print & sign engagement letter', status: 'frustrated', icon: PenLine },
                                                            { step: '4', action: 'Search inbox for your message', status: 'frustrated', icon: MessageSquare },
                                                        ].map((item, i) => (
                                                            <motion.div key={i} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.15 }} className="flex items-center gap-3">
                                                                <div className="w-6 h-6 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0">
                                                                    <span className="text-red-400 text-[9px] font-bold">{item.step}</span>
                                                                </div>
                                                                <div className="flex-1 flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-2">
                                                                    <item.icon size={10} className="text-white/30 flex-shrink-0" />
                                                                    <span className="text-white/50 text-[9px]">{item.action}</span>
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-center pt-2">
                                                            <span className="text-white/30 text-[9px]">67% won&apos;t come back next year</span>
                                                        </motion.div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Scene 3: The Blind Spot — status board with unknowns */}
                                            {activeStatIndex === 2 && (
                                                <div className="w-full h-full flex items-center justify-center p-4 md:p-8">
                                                    <div className="w-full max-w-[260px] space-y-2.5">
                                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-3">
                                                            <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Client status: Unknown</span>
                                                        </motion.div>
                                                        {[
                                                            { client: 'Johnson LLC', item: 'Engagement Letter', status: '???' },
                                                            { client: 'Sarah M.', item: 'Invoice #1042', status: '???' },
                                                            { client: 'Peak Holdings', item: 'W-2 Upload', status: '???' },
                                                            { client: 'David R.', item: 'Portal Message', status: '???' },
                                                        ].map((row, i) => (
                                                            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.12 }} className="flex items-center justify-between rounded-lg bg-white/5 border border-white/10 px-3 py-2.5">
                                                                <div>
                                                                    <span className="text-white/60 text-[10px] font-bold block">{row.client}</span>
                                                                    <span className="text-white/30 text-[8px]">{row.item}</span>
                                                                </div>
                                                                <motion.div
                                                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                                                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                                                                    className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30"
                                                                >
                                                                    <span className="text-amber-400 text-[9px] font-bold">{row.status}</span>
                                                                </motion.div>
                                                            </motion.div>
                                                        ))}
                                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="flex items-center justify-center gap-2 mt-3 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                                                            <EyeOff size={10} className="text-amber-400" />
                                                            <span className="text-amber-400 text-[9px] font-bold">No visibility. No control.</span>
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
                                            className={`flex-1 min-w-[120px] flex flex-col items-center gap-1.5 md:gap-2 px-3 md:px-6 py-3 md:py-5 text-center transition-all relative ${activeStatIndex === i ? 'text-cyan-400' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                                        >
                                            <div className="flex items-center gap-1.5 md:gap-2">
                                                <span className="[&>svg]:w-3.5 [&>svg]:h-3.5 md:[&>svg]:w-4 md:[&>svg]:h-4">{stat.icon}</span>
                                                <span className="text-[10px] md:text-sm font-bold whitespace-nowrap">{stat.stat}</span>
                                            </div>
                                            {/* Progress bar */}
                                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-transparent">
                                                {activeStatIndex === i && (
                                                    <motion.div
                                                        className="h-full bg-cyan-500 rounded-full"
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

                {/* ── SECTION 3: Platform Overview ── */}
                <motion.section
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                    className="mb-24"
                    id="platform-overview"
                >
                    <div className="text-center mb-12 md:mb-16">
                        <div className="inline-flex items-center gap-2 mb-4 md:mb-6 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                            <LayoutDashboard size={14} className="text-cyan-400" />
                            <span className="text-cyan-400 text-[9px] md:text-xs font-black tracking-[0.2em] uppercase">What&apos;s Inside</span>
                        </div>
                        <h2 className="text-2xl md:text-5xl lg:text-6xl font-bold text-[var(--text-main)] leading-tight">
                            Everything Your Firm Needs.{' '}
                            <span className="text-cyan-500">Nothing It Doesn&apos;t.</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {platformCards.map((card, idx) => {
                            const colors = colorMap[card.color];
                            const isDark = theme === 'dark';
                            return (
                                <motion.div
                                    key={card.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1, duration: 0.6, ease: 'circOut' }}
                                    className="glass-card p-6 md:p-8 rounded-2xl md:rounded-3xl border border-[var(--glass-border)] hover:border-cyan-500/20 transition-all duration-300"
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
                        <div className="inline-flex items-center gap-2 mb-4 md:mb-6 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                            <Zap size={14} className="text-cyan-400" />
                            <span className="text-cyan-400 text-[9px] md:text-xs font-black tracking-[0.2em] uppercase">How It Works</span>
                        </div>
                        <h2 className="text-2xl md:text-5xl font-bold text-[var(--text-main)] mb-4">
                            Live in <span className="text-cyan-500">Four Steps</span>
                        </h2>
                    </div>

                    {/* Desktop: Expanding Cards */}
                    <div className="hidden md:flex gap-3 h-[520px] max-w-6xl mx-auto">
                        {expandedStepCards.map((item, i) => {
                            const isActive = expandedStep === i;
                            const StepIcon = ExpandedStepIcons[i];
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
                                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="h-3 rounded bg-cyan-500/30 w-3/4" />
                                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="h-3 rounded bg-cyan-500/20 w-full" />
                                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-3 rounded-lg bg-white/5 border border-white/10 p-2 space-y-1.5">
                                                                    {['Clients', 'Invoices', 'Documents'].map((label, j) => (
                                                                        <motion.div key={j} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 + j * 0.1 }} className="flex items-center gap-1.5">
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                                                            <span className="text-white/40 text-[7px]">{label}</span>
                                                                        </motion.div>
                                                                    ))}
                                                                </motion.div>
                                                            </div>
                                                        </div>
                                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8, type: "spring" }} className="absolute -top-2 -right-2 w-7 h-7 bg-cyan-500 rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-lg shadow-cyan-500/30">
                                                            <CheckCircle size={14} />
                                                        </motion.div>
                                                    </div>
                                                )}
                                                {i === 1 && (
                                                    <div className="flex flex-col items-center gap-3">
                                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
                                                            <Link size={52} className="text-cyan-400" />
                                                        </motion.div>
                                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30">
                                                            <span className="text-green-400 text-xs font-bold">Magic Link Sent</span>
                                                        </motion.div>
                                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-white/40 text-[10px] text-center">No passwords. No sign-up.</motion.p>
                                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="px-3 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
                                                            <div className="flex items-center gap-1.5">
                                                                <Shield size={10} className="text-cyan-300" />
                                                                <span className="text-cyan-300 text-[9px] font-bold">Secure & Encrypted</span>
                                                            </div>
                                                        </motion.div>
                                                    </div>
                                                )}
                                                {i === 2 && (
                                                    <div className="flex flex-col items-center gap-2.5 w-[200px]">
                                                        {[
                                                            { label: 'Invoices', icon: CreditCard, color: 'cyan' },
                                                            { label: 'Engagement Letters', icon: PenLine, color: 'teal' },
                                                            { label: 'Documents', icon: Upload, color: 'sky' },
                                                            { label: 'Messages', icon: MessageSquare, color: 'blue' },
                                                        ].map((row, j) => (
                                                            <motion.div key={j} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + j * 0.12 }} className="w-full flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-2">
                                                                <row.icon size={12} className="text-cyan-400 flex-shrink-0" />
                                                                <span className="text-white/50 text-[9px] font-medium">{row.label}</span>
                                                                <CheckCircle size={10} className="text-green-400 ml-auto flex-shrink-0" />
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                )}
                                                {i === 3 && (
                                                    <div className="flex flex-col items-center gap-4">
                                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
                                                            <Zap size={52} className="text-cyan-400" />
                                                        </motion.div>
                                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30">
                                                            <CheckCircle size={14} className="text-green-400" />
                                                            <span className="text-green-400 text-[11px] font-bold">Practice Running</span>
                                                        </motion.div>
                                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-white/40 text-[10px] text-center max-w-[180px]">Track everything. Chase nothing. Focus on what matters.</motion.p>
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
                            const StepIcon = ExpandedStepIcons[i];
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
                        <div className="inline-flex items-center gap-2 mb-4 md:mb-6 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                            <span className="text-cyan-400 text-[9px] md:text-xs font-black tracking-[0.2em] uppercase">FAQ</span>
                        </div>
                        <h2 className="text-2xl md:text-5xl font-bold text-[var(--text-main)] leading-tight">
                            Questions? <span className="text-cyan-500">Answered.</span>
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
                    <div className="absolute inset-0 bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none" />
                    <div className="relative z-10">
                        <h2 className="text-2xl md:text-5xl lg:text-6xl font-bold text-[var(--text-main)] mb-6 leading-tight">
                            See What Your Firm{' '}
                            <span className="text-cyan-500">Looks Like on Nexli</span>
                        </h2>
                        <p className="text-sm md:text-lg text-[var(--text-muted)] max-w-xl mx-auto mb-10 leading-relaxed">
                            One dashboard. One client portal. Everything your firm needs to look professional,
                            stay organized, and grow — without the overhead.
                        </p>
                        <button
                            onClick={openBooking}
                            className="group inline-flex items-center gap-2 px-8 md:px-10 py-3 md:py-4 rounded-full bg-cyan-600 text-white font-bold text-sm hover:bg-cyan-500 transition-all shadow-xl shadow-cyan-600/20"
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

export default ClientDashboard;
