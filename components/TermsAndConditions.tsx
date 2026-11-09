import React from 'react';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import LegalPage, { LegalSection, Strong, legalLinkClass } from './legal/LegalPage';
import { ADVISORY_PRICE_DISPLAY, ADVISORY_REFUND_DAYS } from '../lib/advisory-config';
import { AGENCY_LAUNCH_DAYS, AGENCY_LAUNCH_DAYS_MAX, AGENCY_LAUNCH_DAYS_MIN } from '../lib/agency-offer';
import { ADDRESS_LINES, EMAIL, LEGAL_NAME, PHONE_DISPLAY, PHONE_E164 } from '../lib/site';

const TermsAndConditions: React.FC = () => (
    <LegalPage
        eyebrow="Partnership Terms"
        icon={FileText}
        title="Terms & Conditions"
        dateLine="Effective Date: November 9, 2026"
    >
        <LegalSection title="1. Scope of Service">
            <p>
                Nexli Automation LLC (&quot;Nexli&quot;) provides high-end website design, strategic client nurturing, and AI automation services specifically for CPAs and accounting firms. By accessing our services, you agree to these terms.
            </p>
        </LegalSection>

        <LegalSection title="2. Fees and Payment Model" variant="feature">
            <p className="text-[var(--text-main)] font-medium">
                We operate on a transparent performance-based and retainer model:
            </p>
            {/* Was a bare "All sales are final." above both products, which
                contradicted the 30-day refund on the guide in this same
                section. A card processor's underwriter reads that as two
                refund policies. It now covers only what it means to. */}
            <p className="text-[var(--text-main)] font-medium">
                Fees for the Digital Rainmaker System are non-refundable except as set out below. The Book of Business Accelerator carries a {ADVISORY_REFUND_DAYS}-day refund, described under Digital Products.
            </p>
            <ul className="list-disc pl-6 space-y-3">
                <li>
                    <Strong>Fees:</Strong> The Digital Rainmaker System is billed as a one-time setup fee plus a recurring monthly fee. The setup fee covers the design and build of the website, client portal, funnel and automations, is quoted to the client in writing before signature, and is non-refundable once project work has commenced. The monthly fee includes the advertising budget, which Nexli collects and places into the client&apos;s campaigns on the client&apos;s behalf; it is not billed separately and the client does not pay the advertising platforms directly. Monthly fees are non-refundable once charged.
                </li>
                <li>
                    <Strong>What the Fee Covers:</Strong> The build and ongoing operation of the client&apos;s website, client portal, funnel and automations, together with the management of the client&apos;s advertising campaigns, hosting, and continuous optimisation. Billing begins on signature; the build period forms part of the initial term.
                </li>
                <li>
                    <Strong>Initial Term:</Strong> The Digital Rainmaker System engagement has a minimum initial term of six (6) months, beginning on the date of the first payment. The client may give notice of cancellation at any point during the initial term, but cancellation does not take effect before the end of that six-month period, and the monthly fees falling due within it remain payable.
                </li>
                <li>
                    <Strong>After the Initial Term:</Strong> Once the six-month initial term has been completed, the engagement continues on a month-to-month basis with no further minimum commitment. From that point the client may cancel future monthly billing at any time with 30 days&apos; written notice to <strong>{EMAIL}</strong>. Cancellation takes effect at the end of the notice period and no partial-month refunds are issued.
                </li>
            </ul>
            <h3 className="text-xl font-bold text-[var(--text-main)] pt-4">Digital Products</h3>
            <p>
                The <Strong>Book of Business Accelerator</Strong> is a one-time purchase of {ADVISORY_PRICE_DISPLAY} USD. It is a digital product delivered immediately on purchase as a single PDF guide, sent by email to the address supplied at checkout. There is no subscription, no recurring charge, and nothing to cancel. The client receives their own copy of the file and may use it within their firm indefinitely; the client may not resell, redistribute, or publish the materials. Because the product is delivered instantly, the client is asked to waive the statutory withdrawal period where one would otherwise apply. Nexli nonetheless offers a full refund within {ADVISORY_REFUND_DAYS} days of purchase, for any reason, on request by reply to the purchase receipt or by email to <strong>{EMAIL}</strong>; refunds are issued to the original payment method and the client is not required to delete the files. The guide is a pricing and process framework for licensed practitioners; it is not tax, legal or accounting advice, and the client remains solely responsible for the fees they quote and the positions they take. Purchase of this product does not entitle the client to any Nexli service engagement. Eligibility for the Digital Rainmaker System is assessed separately and Nexli may decline to offer it.
            </p>
        </LegalSection>

        <LegalSection title="3. Delivery Policy" id="delivery">
            <p>
                Nexli does not sell or ship physical goods. The Book of Business Accelerator is delivered by email to the address supplied at checkout, immediately after payment, and usually arrives within a few minutes; if it has not arrived within an hour, contact us and we will resend it within one business day. For the Digital Rainmaker System, work begins at a kickoff call once the agreement is signed and the setup fee is paid, and most firms are live within {AGENCY_LAUNCH_DAYS_MIN} to {AGENCY_LAUNCH_DAYS} days of kickoff, {AGENCY_LAUNCH_DAYS_MAX} days at the outside, depending on how quickly the client supplies the assets, access and approvals requested. Ongoing services are delivered throughout each billing month. The full policy is on our{' '}
                <Link href="/delivery-policy" className={legalLinkClass}>Delivery Policy</Link> page.
            </p>
        </LegalSection>

        <LegalSection title="4. Refunds and Cancellations" id="refunds">
            <p>
                Refunds and cancellations are governed by section 2 above and set out in full, with how to request one, on our{' '}
                <Link href="/refund-policy" className={legalLinkClass}>Refund Policy</Link> page. In short: the Book of Business Accelerator may be refunded in full within {ADVISORY_REFUND_DAYS} days of purchase for any reason; Digital Rainmaker System fees are non-refundable once work has commenced or the monthly fee has been charged, subject to the initial term and notice provisions above. Duplicate or mistaken charges are always refunded in full.
            </p>
        </LegalSection>

        <LegalSection title="5. SMS Communications (A2P 10DLC)" variant="card">
            <p>
                If you opt-in to receive SMS notifications from Nexli through our web forms:
            </p>
            <ul className="list-disc pl-6 space-y-2">
                <li><strong>Age Requirement:</strong> You must be 18 years of age or older to consent to SMS communications.</li>
                <li>You agree to receive automated messages including appointment reminders, account alerts, and strategy session confirmations.</li>
                <li><strong>Message & Data Rates:</strong> Message and data rates may apply.</li>
                <li><strong>Frequency:</strong> Message frequency may vary based on your interaction with our systems.</li>
                <li><strong>Help:</strong> Text <span className="text-blue-500 font-bold">HELP</span> at any time for assistance, or contact us at <strong>{EMAIL}</strong>.</li>
                <li><strong>Opt-Out:</strong> Text <span className="text-blue-500 font-bold">STOP</span> to <strong>+1 321-241-2945</strong> to cancel. You will receive one final text confirming your request.</li>
                <li><strong>Carrier Disclaimer:</strong> Carriers are not liable for delayed or undelivered messages.</li>
            </ul>
            <p className="text-sm mt-4">
                For more information on how we handle your data, please review our{' '}
                <Link href="/privacy" className={legalLinkClass}>Privacy Policy</Link>.
            </p>
        </LegalSection>

        <LegalSection title="6. Intellectual Property">
            <p>
                Upon full payment of the setup fee, Nexli grants the client a license to use the custom-built web assets and automation workflows. Nexli retains title to all underlying proprietary AI frameworks and code libraries used in the assembly of the final product.
            </p>
            <h3 className="text-xl font-bold text-[var(--text-main)] pt-4">Hosted Services and License</h3>
            <p>
                For the hosted elements of the engagement, the client owns all content, brand assets (logos, colors, photography, and copy the client supplies), the client&apos;s domain name, and all client data stored in the portal. Nexli owns the client portal software, the website framework, templates, and all underlying code, and grants the client a non-exclusive, non-transferable license to use them for the duration of the active subscription term. Upon termination, Nexli will provide the client with an export of the client&apos;s website content and client data within 30 days of the termination date. The website and portal may be taken offline 30 days after termination. Nexli may reference the client&apos;s website in its portfolio unless the client opts out in writing.
            </p>
        </LegalSection>

        <LegalSection title="7. Limitation of Liability">
            <p>
                Nexli shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, or goodwill, arising out of your use of our services.
            </p>
        </LegalSection>

        <LegalSection title="8. Governing Law and Dispute Resolution">
            {/* TODO legal review */}
            <p>
                These Terms shall be governed by and construed in accordance with the laws of the State of Florida, without regard to its conflict-of-law principles. Any dispute, claim, or controversy arising out of or relating to these Terms or the services shall be resolved by binding arbitration administered by the American Arbitration Association (AAA) under its Commercial Arbitration Rules. The arbitration shall take place in Florida, and judgment on the award may be entered in any court of competent jurisdiction. Either party may seek injunctive relief in a court of competent jurisdiction to protect its intellectual property or confidential information.
            </p>
        </LegalSection>

        <LegalSection title="9. Contact">
            <p>Questions about these Terms, an order or a charge:</p>
            <address className="not-italic pl-6 space-y-1">
                <p><Strong>{LEGAL_NAME}</Strong></p>
                <p>{ADDRESS_LINES[0]}</p>
                <p>{ADDRESS_LINES[1]}</p>
                <p>Email: <a href={`mailto:${EMAIL}`} className={legalLinkClass}>{EMAIL}</a></p>
                <p>Phone: <a href={`tel:${PHONE_E164}`} className={legalLinkClass}>{PHONE_DISPLAY}</a></p>
            </address>
        </LegalSection>

        <section className="pt-8 mt-8 border-t border-[var(--glass-border)]">
            <p className="text-center text-sm">
                Related: <Link href="/privacy" className={legalLinkClass}>Privacy Policy</Link> ·{' '}
                <Link href="/refund-policy" className={legalLinkClass}>Refund Policy</Link> ·{' '}
                <Link href="/delivery-policy" className={legalLinkClass}>Delivery Policy</Link> ·{' '}
                <Link href="/contact" className={legalLinkClass}>Contact</Link>
            </p>
        </section>
    </LegalPage>
);

export default TermsAndConditions;
