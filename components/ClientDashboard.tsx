'use client';
import React from 'react';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    FileText,
    Send,
    PenLine,
    MessageSquare,
    Upload,
    Users,
    Sparkles,
    ChevronRight,
} from 'lucide-react';
import { useBooking } from './QualificationProvider';

const fadeUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.7, ease: 'circOut' },
};

const stagger = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
};

// ── Platform Cards Data ─────────────────────────────────
const platformCards = [
    {
        icon: <Users size={24} />,
        title: 'Client Portal',
        description:
            'Your clients log in to one place — branded to your firm. They see their invoices, sign engagement letters, upload documents, and message you directly. No extra apps, no confusion.',
        color: 'blue',
    },
    {
        icon: <FileText size={24} />,
        title: 'Invoicing & Payments',
        description:
            'Send professional invoices in seconds. Track what\'s paid, what\'s overdue, and let clients pay online. No more chasing checks or wondering who owes what.',
        color: 'emerald',
    },
    {
        icon: <PenLine size={24} />,
        title: 'Engagement Letters',
        description:
            'Send, track, and collect digital signatures on engagement letters. Know who signed and who hasn\'t — instantly. No printing, scanning, or lost paperwork.',
        color: 'violet',
    },
    {
        icon: <MessageSquare size={24} />,
        title: 'Secure Messaging',
        description:
            'A direct line to your clients, built right into the portal. No more digging through email threads or wondering if they saw your message. You see who\'s read what.',
        color: 'amber',
    },
    {
        icon: <Upload size={24} />,
        title: 'Document Collection',
        description:
            'Clients upload W-2s, 1099s, and statements through your branded portal. Encrypted, organized by client, and ready when you need them. No email attachments ever again.',
        color: 'rose',
    },
];

const colorMap: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', glow: 'bg-blue-500/5' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', glow: 'bg-emerald-500/5' },
    violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400', glow: 'bg-violet-500/5' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', glow: 'bg-amber-500/5' },
    rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', glow: 'bg-rose-500/5' },
};

// ── How It Works Steps ──────────────────────────────────
const steps = [
    {
        number: '01',
        title: 'We Build It',
        description:
            'We design and deploy a custom-branded dashboard and client portal for your firm. Your logo, your colors, your domain — it looks and feels like yours because it is.',
    },
    {
        number: '02',
        title: 'You Invite Clients',
        description:
            'Clients receive a magic link to access their portal. No passwords to remember, no accounts to create. One click and they\'re in — zero friction.',
    },
    {
        number: '03',
        title: 'You Run Your Practice',
        description:
            'Send invoices, collect signatures, share documents, and message clients — all from one place. Focus on the work that matters while the platform handles the rest.',
    },
];

// ── Component ───────────────────────────────────────────
const ClientDashboard: React.FC = () => {
    const { openBooking } = useBooking();

    return (
        <div className="min-h-screen bg-[var(--bg-main)] transition-colors duration-300">
            {/* ── Hero ──────────────────────────────────────── */}
            <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
                {/* Background glow */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/8 rounded-full blur-[120px]" />
                </div>

                <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
                    <motion.div
                        {...fadeUp}
                        className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20"
                    >
                        <Sparkles className="text-blue-400" size={14} />
                        <span className="text-blue-400 text-[10px] md:text-xs font-black tracking-[0.2em] uppercase">
                            All-in-One Platform
                        </span>
                    </motion.div>

                    <motion.h1
                        {...fadeUp}
                        transition={{ delay: 0.1, duration: 0.7, ease: 'circOut' }}
                        className="text-4xl md:text-6xl lg:text-8xl font-bold text-[var(--text-main)] leading-[1.05] mb-6 md:mb-8"
                    >
                        Your Entire Practice.{' '}
                        <span className="text-blue-500">One Dashboard.</span>
                    </motion.h1>

                    <motion.p
                        {...fadeUp}
                        transition={{ delay: 0.2, duration: 0.7, ease: 'circOut' }}
                        className="text-base md:text-xl text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed mb-10"
                    >
                        Stop juggling six different tools to run your firm. Invoicing, engagement letters,
                        client messaging, document collection, and a branded client portal — all in one place
                        your clients actually enjoy using.
                    </motion.p>

                    <motion.div
                        {...fadeUp}
                        transition={{ delay: 0.3, duration: 0.7, ease: 'circOut' }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <button
                            onClick={openBooking}
                            className="group flex items-center gap-2 px-8 py-4 rounded-full bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
                        >
                            Book a Consultation
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <a
                            href="#platform"
                            className="flex items-center gap-2 px-8 py-4 rounded-full border border-[var(--glass-border)] text-[var(--text-main)] font-bold text-sm hover:border-blue-500/30 hover:bg-blue-500/5 transition-all"
                        >
                            See What&apos;s Inside
                            <ChevronRight size={16} />
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* ── The Problem (Brief) ──────────────────────── */}
            <section className="py-16 md:py-24">
                <div className="max-w-4xl mx-auto px-6">
                    <motion.div
                        {...fadeUp}
                        className="glass-card p-8 md:p-12 rounded-2xl md:rounded-[32px] border border-[var(--glass-border)] text-center"
                    >
                        <h2 className="text-2xl md:text-4xl font-bold text-[var(--text-main)] mb-4 md:mb-6 leading-tight">
                            Your Clients Deserve Better Than{' '}
                            <span className="text-blue-500">Scattered Tools</span>
                        </h2>
                        <p className="text-sm md:text-lg text-[var(--text-muted)] leading-relaxed max-w-2xl mx-auto">
                            Invoices in one app. Engagement letters in another. Documents over email. Messages lost
                            in threads. When your systems are scattered, things slip through the cracks — and your
                            clients notice. They don&apos;t see the great work you do. They see the disorganization around it.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ── Platform Overview ────────────────────────── */}
            <section className="py-16 md:py-32" id="platform">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12 md:mb-20">
                        <motion.div
                            {...fadeUp}
                            className="inline-flex items-center gap-2 mb-4 md:mb-6 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20"
                        >
                            <span className="text-blue-400 text-[10px] md:text-xs font-black tracking-[0.2em] uppercase">
                                What&apos;s Inside
                            </span>
                        </motion.div>
                        <motion.h2
                            {...fadeUp}
                            transition={{ delay: 0.1 }}
                            className="text-3xl md:text-5xl lg:text-7xl font-bold text-[var(--text-main)] leading-tight"
                        >
                            Everything Your Firm Needs.{' '}
                            <span className="text-blue-500">Nothing It Doesn&apos;t.</span>
                        </motion.h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                        {platformCards.map((card, idx) => {
                            const colors = colorMap[card.color];
                            return (
                                <motion.div
                                    key={card.title}
                                    {...stagger}
                                    transition={{ delay: idx * 0.1, duration: 0.6, ease: 'circOut' }}
                                    className={`group relative glass-card p-7 md:p-9 rounded-2xl md:rounded-3xl border border-[var(--glass-border)] hover:${colors.border} transition-all duration-300 ${idx >= 3 ? 'lg:col-span-1 md:col-span-1' : ''}`}
                                >
                                    {/* Hover glow */}
                                    <div className={`absolute inset-0 ${colors.glow} rounded-2xl md:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10`} />

                                    <div className={`inline-flex p-3 rounded-xl ${colors.bg} border ${colors.border} mb-5`}>
                                        <div className={colors.text}>
                                            {card.icon}
                                        </div>
                                    </div>

                                    <h3 className="text-lg md:text-xl font-bold text-[var(--text-main)] mb-3">
                                        {card.title}
                                    </h3>

                                    <p className="text-sm md:text-base text-[var(--text-muted)] leading-relaxed">
                                        {card.description}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── How It Works ─────────────────────────────── */}
            <section className="py-16 md:py-32">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center mb-12 md:mb-20">
                        <motion.div
                            {...fadeUp}
                            className="inline-flex items-center gap-2 mb-4 md:mb-6 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20"
                        >
                            <span className="text-blue-400 text-[10px] md:text-xs font-black tracking-[0.2em] uppercase">
                                How It Works
                            </span>
                        </motion.div>
                        <motion.h2
                            {...fadeUp}
                            transition={{ delay: 0.1 }}
                            className="text-3xl md:text-5xl lg:text-6xl font-bold text-[var(--text-main)] leading-tight"
                        >
                            Live in <span className="text-blue-500">Three Steps</span>
                        </motion.h2>
                    </div>

                    <div className="space-y-6 md:space-y-8">
                        {steps.map((step, idx) => (
                            <motion.div
                                key={step.number}
                                {...stagger}
                                transition={{ delay: idx * 0.15, duration: 0.6, ease: 'circOut' }}
                                className="glass-card p-6 md:p-10 rounded-2xl md:rounded-3xl border border-[var(--glass-border)] flex flex-col md:flex-row items-start gap-5 md:gap-8"
                            >
                                <div className="flex-shrink-0">
                                    <span className="text-5xl md:text-7xl font-black text-blue-500/15 select-none">
                                        {step.number}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-bold text-[var(--text-main)] mb-2 md:mb-3">
                                        {step.title}
                                    </h3>
                                    <p className="text-sm md:text-base text-[var(--text-muted)] leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Final CTA ────────────────────────────────── */}
            <section className="py-20 md:py-32">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <motion.div {...fadeUp} className="relative">
                        {/* Background glow */}
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px]" />
                        </div>

                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-[var(--text-main)] mb-6 leading-tight">
                                See What Your Firm{' '}
                                <span className="text-blue-500">Looks Like on Nexli</span>
                            </h2>
                            <p className="text-sm md:text-lg text-[var(--text-muted)] max-w-xl mx-auto mb-10 leading-relaxed">
                                One dashboard. One client portal. Everything your firm needs to look professional,
                                stay organized, and grow — without the overhead.
                            </p>
                            <button
                                onClick={openBooking}
                                className="group inline-flex items-center gap-2 px-10 py-4 rounded-full bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
                            >
                                Book a Consultation
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default ClientDashboard;
