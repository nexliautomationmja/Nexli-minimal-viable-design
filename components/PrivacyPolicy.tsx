import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft } from 'lucide-react';

interface PrivacyPolicyProps {
    onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
    return (
        <section className="min-h-screen py-32 bg-[var(--bg-main)] transition-colors duration-300">
            <div className="max-w-4xl mx-auto px-6">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-blue-500 font-bold mb-12 hover:gap-3 transition-all uppercase tracking-widest text-xs"
                >
                    <ArrowLeft size={16} />
                    Back to Home
                </button>

                <div className="mb-16">
                    <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                        <Shield className="text-blue-400" size={16} />
                        <span className="text-blue-400 text-xs font-black tracking-[0.2em] uppercase">Security First</span>
                    </div>
                    <h1 className="text-[var(--text-main)] text-5xl md:text-7xl font-bold mb-8">Privacy Policy</h1>
                    <p className="text-[var(--text-muted)] text-xl leading-relaxed">
                        Last Updated: January 18, 2026
                    </p>
                </div>

                <div className="space-y-12 text-[var(--text-muted)] leading-relaxed text-lg">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[var(--text-main)]">1. Introduction</h2>
                        <p>
                            At Nexli Automation LLC ("Nexli"), we respect your privacy and are committed to protecting it through our compliance with this policy. This policy describes the types of information we may collect from you or that you may provide when you visit Nexli (our "Website") and our practices for collecting, using, maintaining, protecting, and disclosing that information.
                        </p>
                    </section>

                    <section className="space-y-4 p-8 glass-card rounded-3xl border border-blue-500/20 bg-blue-500/5">
                        <h2 className="text-2xl font-bold text-blue-500">2. A2P 10DLC Compliance & SMS Privacy</h2>
                        <p className="font-medium text-[var(--text-main)]">
                            This section is specifically tailored to meet Federal and Carrier requirements for SMS communications (A2P 10DLC).
                        </p>
                        <ul className="list-disc pl-6 space-y-3">
                            <li className="text-[var(--text-main)] font-semibold italic">
                                No mobile information will be shared with third parties/affiliates for marketing/promotional purposes.
                            </li>
                            <li>
                                All the above categories exclude text messaging originator opt-in data and consent; this information will not be shared with any third parties.
                            </li>
                            <li>
                                If you opt-in to receive SMS from Nexli, you will only receive messages regarding the specific services or information you requested (e.g., appointment reminders, support responses).
                            </li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[var(--text-main)]">3. Information We Collect</h2>
                        <p>
                            We collect several types of information from and about users of our Website, including:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Directly:</strong> Name, work email address, firm name, and phone number when you fill out our "Impact Audit" or "Contact" forms.</li>
                            <li><strong>Automatically:</strong> Usage details, IP addresses, and information collected through cookies and other tracking technologies.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[var(--text-main)]">4. How We Use Your Information</h2>
                        <p>
                            We use information that we collect about you or that you provide to us, including any personal information:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>To present our Website and its contents to you.</li>
                            <li>To provide you with information, products, or services that you request from us.</li>
                            <li>To notify you about changes to our Website or any products or services we offer or provide through it.</li>
                            <li>To allow you to participate in interactive features on our Website.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[var(--text-main)]">5. Data Security</h2>
                        <p>
                            We have implemented measures designed to secure your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure. The safety and security of your information also depends on you.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[var(--text-main)]">6. Contact Information</h2>
                        <p>
                            To ask questions or comment about this privacy policy and our privacy practices, contact us at:
                        </p>
                        <div className="pl-6 space-y-1">
                            <p><strong className="text-[var(--text-main)]">Nexli Automation LLC</strong></p>
                            <p>480 N Orlando Ave STE 236</p>
                            <p>Winter Park, FL 32789</p>
                            <p>Email: <strong className="text-[var(--text-main)]">mail@nexli.net</strong></p>
                        </div>
                    </section>
                </div>
            </div>
        </section>
    );
};

export default PrivacyPolicy;
