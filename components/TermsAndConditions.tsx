import React from 'react';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import LegalPage, { LegalSection, Strong, legalLinkClass } from './legal/LegalPage';
import { ADVISORY_PRICE_DISPLAY, ADVISORY_REFUND_DAYS } from '../lib/advisory-config';
import {
    AD_BUDGET_TERMS,
    AGENCY_LAUNCH_DAYS,
    AGENCY_MIN_AD_BUDGET,
    AGENCY_PREPAY_SAVING,
    AGENCY_RETAINER_MONTHLY,
    AGENCY_RETAINER_PREPAY,
    AGENCY_RETAINER_TERM_MONTHS,
    PAYMENT_METHODS,
    PERFORMANCE_RULE,
    RENEWAL_TERMS,
    usd,
} from '../lib/agency-offer';
import { ADDRESS_LINES, EMAIL, LEGAL_NAME, PHONE_DISPLAY, PHONE_E164 } from '../lib/site';

// ---------------------------------------------------------------------------
// The Terms. /refund-policy, /delivery-policy and /pricing restate parts of
// it and must never say more or less than it does; every figure comes from
// lib/agency-offer so they cannot quote different numbers.
//
// The Digital Rainmaker System terms are THE RETAINER (lib/agency-offer.ts,
// Marcel, 2026-11-19): $10,000 a month from signing, no setup fee, a
// six-month term that renews for six months unless cancelled before it
// ends, or $50,000 to prepay the six months; 10% performance pay on agreed,
// attributable net revenue (greater-of, credited not added); the ad budget
// paid by the client directly to Meta; every charge by card, ACH or wire;
// nothing refundable; the client owns what is built (except the ad
// creative) and pays its own hosting.
//
// History: 2026-11-09 to 11-19 this page sold a $40,000 setup fee (it was
// $32,000 until 11-16), $9,997 a month with a $5,000 ad budget Nexli held
// and placed, an $82,000 annual plan and a first-month ad bonus. All of it
// is retired.
// ---------------------------------------------------------------------------

const TermsAndConditions: React.FC = () => (
    <LegalPage
        eyebrow="Partnership Terms"
        icon={FileText}
        title="Terms & Conditions"
        dateLine="Effective Date: November 19, 2026"
    >
        <LegalSection title="1. Scope of Service">
            <p>
                Nexli Automation LLC (&quot;Nexli&quot;) builds and runs the Digital Rainmaker System for CPA and accounting firms: a website, a branded client portal, a sales funnel, AI automations, and the paid advertising that drives them. Nexli also sells a digital guide, the Book of Business Accelerator. By using this website or buying from Nexli, you agree to these terms. A Digital Rainmaker System engagement is also made under a written agreement signed by both parties; these terms describe the same commitments, and if the two ever differ, the signed agreement governs.
            </p>
        </LegalSection>

        <LegalSection title="2. Fees and Payment" variant="feature">
            {/* Was a bare "All sales are final." above both products, which
                contradicted the 30-day refund on the guide in this same
                section. A card processor's underwriter reads that as two
                refund policies. It now covers only what it means to. */}
            <p className="text-[var(--text-main)] font-medium">
                The Digital Rainmaker System is sold under a signed agreement and billed by invoice: a monthly agency fee, or the six months paid up front, plus performance pay. There is no setup fee. All prices are in US dollars. Its fees are non-refundable, except for billing errors (section 4). The Book of Business Accelerator carries a {ADVISORY_REFUND_DAYS}-day refund, described under Digital Products.
            </p>
            <ul className="list-disc pl-6 space-y-3">
                <li>
                    <Strong>Monthly Agency Fee:</Strong> {usd(AGENCY_RETAINER_MONTHLY)} a month, the agency minimum. Billing begins at signing: the first month&apos;s fee is due when the agreement is signed, and each later month&apos;s fee is due monthly after that. It pays for the build (the website, client portal, sales funnel, AI automations, A2P 10DLC registration for business text messaging, the advertising account, invoicing, and the other tools the system needs) and for Nexli&apos;s upkeep and management of the whole system: maintaining the website, portal and automations, making changes to the funnels, ads and automations throughout the term, and running the ad campaigns. There is no separate setup fee. Monthly fees are non-refundable once charged.
                </li>
                <li>
                    <Strong>Six-Month Prepayment:</Strong> Instead of paying monthly, the client may pay the {AGENCY_RETAINER_TERM_MONTHS}-month term up front: {usd(AGENCY_RETAINER_PREPAY)}, due at signing, in place of {AGENCY_RETAINER_TERM_MONTHS} monthly fees of {usd(AGENCY_RETAINER_MONTHLY)} (a saving of {usd(AGENCY_PREPAY_SAVING)}). The prepayment is non-refundable, in whole and in part.
                </li>
                <li>
                    <Strong>Performance Pay:</Strong> {PERFORMANCE_RULE} Any performance invoice is issued as the signed agreement sets out, and is non-refundable once charged. &quot;Agreed, attributable net revenue&quot; has the meaning given to it in the signed agreement; it is not the client&apos;s total revenue.
                </li>
                <li>
                    <Strong>Advertising Budget:</Strong> {AD_BUDGET_TERMS} The client pays the advertising platform for it directly; Nexli does not collect, hold or place it, does not invoice it, and cannot refund it. It is at least {usd(AGENCY_MIN_AD_BUDGET)} a month while the engagement runs.
                </li>
                <li>
                    <Strong>How Each Charge Is Paid:</Strong> {PAYMENT_METHODS} Work begins once the first month&apos;s fee, or the six-month prepayment, has arrived in Nexli&apos;s account.
                </li>
                <li>
                    <Strong>One System, One Fee:</Strong> The fees are for the complete system. Parts of it cannot be removed, paused or priced separately, and fees are not reduced if the client chooses not to use part of it.
                </li>
                <li>
                    <Strong>Hosting:</Strong> Nexli&apos;s fees do not include hosting. The client pays the hosting provider directly.
                </li>
                <li>
                    <Strong>Initial Term:</Strong> {AGENCY_RETAINER_TERM_MONTHS} months, beginning at signing. The client may give notice of cancellation at any point during a term, but cancellation does not take effect before the end of that term, and the fees falling due within it, including any performance pay for its months, remain payable.
                </li>
                <li>
                    <Strong>Renewal:</Strong> {RENEWAL_TERMS} Notice of cancellation is given in writing to <strong>{EMAIL}</strong>. No partial-month or partial-term refunds are issued.
                </li>
            </ul>
            <h3 className="text-xl font-bold text-[var(--text-main)] pt-4">Digital Products</h3>
            <p>
                The <Strong>Book of Business Accelerator</Strong> is a one-time purchase of {ADVISORY_PRICE_DISPLAY} USD. It is a digital product delivered immediately on purchase as a single PDF guide, sent by email to the address supplied at checkout. There is no subscription, no recurring charge, and nothing to cancel. The client receives their own copy of the file and may use it within their firm indefinitely; the client may not resell, redistribute, or publish the materials. Because the product is delivered instantly, the client is asked to waive the statutory withdrawal period where one would otherwise apply. Nexli nonetheless offers a full refund within {ADVISORY_REFUND_DAYS} days of purchase, for any reason, on request by reply to the purchase receipt or by email to <strong>{EMAIL}</strong>; refunds are issued to the original payment method and the client is not required to delete the files. The guide is a pricing and process framework for licensed practitioners; it is not tax, legal or accounting advice, and the client remains solely responsible for the fees they quote and the positions they take. Purchase of this product does not entitle the client to any Nexli service engagement. Eligibility for the Digital Rainmaker System is assessed separately and Nexli may decline to offer it.
            </p>
        </LegalSection>

        <LegalSection title="3. Delivery Policy" id="delivery">
            <p>
                Nexli does not sell or ship physical goods. The Book of Business Accelerator is delivered by email to the address supplied at checkout, immediately after payment, and usually arrives within a few minutes; if it has not arrived within an hour, contact us and we will resend it within one business day. For the Digital Rainmaker System, work begins at a kickoff call once the agreement is signed and the first month&apos;s fee (or the {usd(AGENCY_RETAINER_PREPAY)} six-month prepayment) is paid, and the build takes about {AGENCY_LAUNCH_DAYS} days from kickoff. That timeline depends on the client supplying the assets, access and approvals requested, and on reviews Nexli does not control, such as the carriers&apos; review of the A2P 10DLC registration and the ad platforms&apos; review of the advertising account. Launch is the day the ads go live. Billing and the term begin at signing, not at launch: the build runs inside the first month. Upkeep and campaign management are delivered throughout each month after launch. The full policy is on our{' '}
                <Link href="/delivery-policy" className={legalLinkClass}>Delivery Policy</Link> page.
            </p>
        </LegalSection>

        <LegalSection title="4. Refunds and Cancellations" id="refunds">
            <p>
                Refunds and cancellations are governed by section 2 above and set out in full, with how to request one, on our{' '}
                <Link href="/refund-policy" className={legalLinkClass}>Refund Policy</Link> page. In short: the Book of Business Accelerator may be refunded in full within {ADVISORY_REFUND_DAYS} days of purchase for any reason. Digital Rainmaker System fees are non-refundable: the {usd(AGENCY_RETAINER_MONTHLY)} monthly agency fee once charged, the {usd(AGENCY_RETAINER_PREPAY)} six-month prepayment, and any performance pay invoice. The advertising budget is paid by the client directly to the advertising platform and never passes through Nexli, so it is not Nexli&apos;s to refund. Cancellation follows the terms in section 2: it takes effect at the end of the current term. Duplicate or mistaken charges are always refunded in full.
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

        <LegalSection title="6. Ownership and Intellectual Property">
            {/* Was a licence: "Nexli owns the client portal software, the
                website framework... grants the client a licence for the
                duration of the active subscription", and the site could be
                taken offline 30 days after termination. Marcel, 2026-11-09:
                the client owns the website, the build and the portal, and
                pays its own hosting; the monthly is upkeep, not rent. */}
            <p>
                The client owns what Nexli builds for them: the website, the client portal, the sales funnel and the automations, together with the client&apos;s content, brand assets (logos, colors, photography and copy), domain name, advertising account, and all client data. Nexli&apos;s fees pay for building them and for Nexli&apos;s upkeep and management of them, not for the right to use them.
            </p>
            {/* Marcel, 2026-11-09: Nexli keeps the ad creative. It makes a
                great deal of it inside each ad account, and sorting it out
                to hand over per client is not workable. Everything else
                stays the client's. Keep in step with /delivery-policy,
                /pricing, lib/booking-faq and ENGAGEMENT_TERMS in lib/site. */}
            <p>
                <Strong>Ad Creative:</Strong> The ad creative Nexli produces for the client&apos;s campaigns (the videos and images) remains Nexli&apos;s property, along with the tools Nexli uses to make it. The client keeps its advertising account, including its history, audiences and data.
            </p>
            <p>
                When the engagement ends, Nexli&apos;s upkeep and management stop. The client keeps everything that was built except the ad creative; Nexli hands over any account access it holds for the client and removes its own. Nexli keeps its general know-how, methods and templates that are not specific to the client, and may reuse them in other work. Nexli may reference the client&apos;s website in its portfolio unless the client opts out in writing.
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
                <Link href="/pricing" className={legalLinkClass}>Pricing</Link> ·{' '}
                <Link href="/contact" className={legalLinkClass}>Contact</Link>
            </p>
        </section>
    </LegalPage>
);

export default TermsAndConditions;
