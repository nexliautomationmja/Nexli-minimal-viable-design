'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FileText, ArrowLeft } from 'lucide-react';

const TermsAndConditions: React.FC = () => {
    const router = useRouter();
    return (
        <section className="min-h-screen py-32 bg-[var(--bg-main)] transition-colors duration-300">
            <div className="max-w-4xl mx-auto px-6">
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2 text-blue-500 font-bold mb-12 hover:gap-3 transition-all uppercase tracking-widest text-xs"
                >
                    <ArrowLeft size={16} />
                    Back to Home
                </button>

                <div className="mb-16">
                    <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                        <FileText className="text-blue-400" size={16} />
                        <span className="text-blue-400 text-xs font-black tracking-[0.2em] uppercase">Partnership Terms</span>
                    </div>
                    <h1 className="text-[var(--text-main)] text-5xl md:text-7xl font-bold mb-8">Terms & Conditions</h1>
                    <p className="text-[var(--text-muted)] text-xl leading-relaxed">
                        Effective Date: September 26, 2026
                    </p>
                </div>

                <div className="space-y-12 text-[var(--text-muted)] leading-relaxed text-lg">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[var(--text-main)]">1. Scope of Service</h2>
                        <p>
                            Nexli Automation LLC ("Nexli") provides high-end website design, strategic client nurturing, and AI automation services specifically for CPAs and accounting firms. By accessing our services, you agree to these terms.
                        </p>
                    </section>

                    <section className="space-y-4 p-8 glass-card rounded-3xl border border-blue-500/20 bg-blue-500/5">
                        <h2 className="text-2xl font-bold text-blue-500">2. Fees and Payment Model</h2>
                        <p className="text-[var(--text-main)] font-medium">
                            We operate on a transparent performance-based and retainer model:
                        </p>
                        <p className="text-[var(--text-main)] font-medium">
                            All sales are final.
                        </p>
                        <ul className="list-disc pl-6 space-y-3">
                            <li>
                                <strong className="text-[var(--text-main)]">Fees:</strong> The Digital Rainmaker System is billed as a one-time setup fee plus a recurring monthly fee. The setup fee covers the design and build of the website, client portal, funnel and automations, is quoted to the client in writing before signature, and is non-refundable once project work has commenced. The monthly fee includes the advertising budget, which Nexli collects and places into the client&apos;s campaigns on the client&apos;s behalf; it is not billed separately and the client does not pay the advertising platforms directly. Monthly fees are non-refundable once charged.
                            </li>
                            <li>
                                <strong className="text-[var(--text-main)]">What the Fee Covers:</strong> The build and ongoing operation of the client&apos;s website, client portal, funnel and automations, together with the management of the client&apos;s advertising campaigns, hosting, and continuous optimisation. Billing begins on signature; the build period forms part of the initial term.
                            </li>
                            <li>
                                <strong className="text-[var(--text-main)]">Initial Term:</strong> The Digital Rainmaker System engagement has a minimum initial term of six (6) months, beginning on the date of the first payment. The client may give notice of cancellation at any point during the initial term, but cancellation does not take effect before the end of that six-month period, and the monthly fees falling due within it remain payable.
                            </li>
                            <li>
                                <strong className="text-[var(--text-main)]">After the Initial Term:</strong> Once the six-month initial term has been completed, the engagement continues on a month-to-month basis with no further minimum commitment. From that point the client may cancel future monthly billing at any time with 30 days&apos; written notice to <strong>mail@nexli.net</strong>. Cancellation takes effect at the end of the notice period and no partial-month refunds are issued.
                            </li>
                        </ul>
                        <h3 className="text-xl font-bold text-[var(--text-main)] pt-4">Digital Products</h3>
                        <p>
                            The <strong className="text-[var(--text-main)]">Book of Business Accelerator</strong> is a one-time purchase of $97 USD. It is a digital product delivered immediately on purchase as a single PDF guide, sent by email to the address supplied at checkout. There is no subscription, no recurring charge, and nothing to cancel. The client receives their own copy of the file and may use it within their firm indefinitely; the client may not resell, redistribute, or publish the materials. Because the product is delivered instantly, the client is asked to waive the statutory withdrawal period where one would otherwise apply. Nexli nonetheless offers a full refund within 30 days of purchase, for any reason, on request by reply to the purchase receipt or by email to <strong>mail@nexli.net</strong>; refunds are issued to the original payment method and the client is not required to delete the files. The guide is a pricing and process framework for licensed practitioners; it is not tax, legal or accounting advice, and the client remains solely responsible for the fees they quote and the positions they take. Purchase of this product does not entitle the client to any Nexli service engagement. Eligibility for the Digital Rainmaker System is assessed separately and Nexli may decline to offer it.
                        </p>
                    </section>

                    <section className="space-y-4 p-8 glass-card rounded-3xl border border-blue-500/10">
                        <h2 className="text-2xl font-bold text-[var(--text-main)]">3. SMS Communications (A2P 10DLC)</h2>
                        <p>
                            If you opt-in to receive SMS notifications from Nexli through our web forms:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Age Requirement:</strong> You must be 18 years of age or older to consent to SMS communications.</li>
                            <li>You agree to receive automated messages including appointment reminders, account alerts, and strategy session confirmations.</li>
                            <li><strong>Message & Data Rates:</strong> Message and data rates may apply.</li>
                            <li><strong>Frequency:</strong> Message frequency may vary based on your interaction with our systems.</li>
                            <li><strong>Help:</strong> Text <span className="text-blue-500 font-bold">HELP</span> at any time for assistance, or contact us at <strong>mail@nexli.net</strong>.</li>
                            <li><strong>Opt-Out:</strong> Text <span className="text-blue-500 font-bold">STOP</span> to <strong>+1 321-241-2945</strong> to cancel. You will receive one final text confirming your request.</li>
                            <li><strong>Carrier Disclaimer:</strong> Carriers are not liable for delayed or undelivered messages.</li>
                        </ul>
                        <p className="text-sm mt-4">
                            For more information on how we handle your data, please review our{' '}
                            <button
                                onClick={() => router.push('/privacy')}
                                className="text-blue-500 underline hover:text-blue-400 transition-colors bg-transparent border-none p-0 cursor-pointer text-sm"
                            >
                                Privacy Policy
                            </button>.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[var(--text-main)]">4. Intellectual Property</h2>
                        <p>
                            Upon full payment of the setup fee, Nexli grants the client a license to use the custom-built web assets and automation workflows. Nexli retains title to all underlying proprietary AI frameworks and code libraries used in the assembly of the final product.
                        </p>
                        <h3 className="text-xl font-bold text-[var(--text-main)] pt-4">Hosted Services and License</h3>
                        <p>
                            For the hosted elements of the engagement, the client owns all content, brand assets (logos, colors, photography, and copy the client supplies), the client's domain name, and all client data stored in the portal. Nexli owns the client portal software, the website framework, templates, and all underlying code, and grants the client a non-exclusive, non-transferable license to use them for the duration of the active subscription term. Upon termination, Nexli will provide the client with an export of the client's website content and client data within 30 days of the termination date. The website and portal may be taken offline 30 days after termination. Nexli may reference the client's website in its portfolio unless the client opts out in writing.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[var(--text-main)]">5. Limitation of Liability</h2>
                        <p>
                            Nexli shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, or goodwill, arising out of your use of our services.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[var(--text-main)]">6. Governing Law and Dispute Resolution</h2>
                        {/* TODO legal review */}
                        <p>
                            These Terms shall be governed by and construed in accordance with the laws of the State of Florida, without regard to its conflict-of-law principles. Any dispute, claim, or controversy arising out of or relating to these Terms or the services shall be resolved by binding arbitration administered by the American Arbitration Association (AAA) under its Commercial Arbitration Rules. The arbitration shall take place in Florida, and judgment on the award may be entered in any court of competent jurisdiction. Either party may seek injunctive relief in a court of competent jurisdiction to protect its intellectual property or confidential information.
                        </p>
                    </section>

                    {/* Related Links */}
                    <section className="pt-8 mt-8 border-t border-[var(--glass-border)]">
                        <p className="text-center text-[var(--text-muted)] text-sm">
                            For information about how we collect and use your data, please review our{' '}
                            <button
                                onClick={() => router.push('/privacy')}
                                className="text-blue-500 underline hover:text-blue-400 transition-colors bg-transparent border-none p-0 cursor-pointer font-bold"
                            >
                                Privacy Policy
                            </button>.
                        </p>
                    </section>
                </div>
            </div>
        </section>
    );
};

export default TermsAndConditions;
