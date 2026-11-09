// ---------------------------------------------------------------------------
// The privacy policy.
//
// A card processor's underwriters check this against what the site actually
// does, so it has to name what is really running. The previous version said
// "We do not use third-party advertising cookies" on a site with the Meta
// Pixel on every page, and named only Vercel Analytics. If a tracker, form
// field or vendor is added to the site, add it here too: app/layout.tsx
// (scripts), lib/attribution.ts (cookies), lib/meta-capi.ts (server events)
// and next.config.ts's Content-Security-Policy are the places to check.
//
// SECTION 2 IS CARRIER COMPLIANCE TEXT FOR A2P 10DLC. Keep it word for word.
// ---------------------------------------------------------------------------

import React from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import LegalPage, { LegalSection, Strong, legalLinkClass } from './legal/LegalPage';
import { ADDRESS_LINES, EMAIL, LEGAL_NAME, PHONE_DISPLAY, PHONE_E164 } from '../lib/site';

const Email = () => (
    <a href={`mailto:${EMAIL}`} className={legalLinkClass}>{EMAIL}</a>
);

const PrivacyPolicy: React.FC = () => (
    <LegalPage
        eyebrow="Security First"
        icon={Shield}
        title="Privacy Policy"
        dateLine="Last Updated: November 9, 2026"
    >
        <LegalSection title="1. Introduction">
            <p>
                At Nexli Automation LLC (&quot;Nexli&quot;), we respect your privacy and are committed to protecting it through our compliance with this policy. This policy describes the types of information we may collect from you or that you may provide when you visit Nexli (our &quot;Website&quot;) or buy from us, and our practices for collecting, using, maintaining, protecting, and disclosing that information.
            </p>
        </LegalSection>

        <LegalSection title="2. A2P 10DLC Compliance & SMS Privacy" variant="feature">
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
        </LegalSection>

        <LegalSection title="3. Information We Collect">
            <p>We collect several types of information from and about users of our Website:</p>
            <ul className="list-disc pl-6 space-y-3">
                <li>
                    <Strong>Information you give us:</Strong> your name, work email address, mobile phone number, firm name and website when you fill out a form, book a call or opt in to a guide; your answers to our qualifying questions (such as your location, your role, your firm&apos;s revenue and your budget); your SMS and email consent choices; and anything you write to us, including conversations with Candor, the AI assistant on our Website.
                </li>
                <li>
                    <Strong>Purchase information:</Strong> when you pay by card, our payment processor collects your card details, name, email address and billing information. We receive confirmation of the payment, such as the amount, the date and a transaction reference. We never receive your full card number. When you pay by ACH bank transfer or wire transfer (as the Digital Rainmaker System setup fee and annual plan payment are paid), the payment comes from your bank to ours, and we receive the sending account holder&apos;s name and bank details with it.
                </li>
                <li>
                    <Strong>Information collected automatically:</Strong> your IP address, browser and device type, the pages you view and how long you spend on them, the page that referred you, how much of our videos you watch, and, if you arrived from an ad, the ad-click identifier and campaign (UTM) tags attached to the link.
                </li>
            </ul>
        </LegalSection>

        <LegalSection title="4. How We Use Your Information">
            <p>We use the information we collect:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>To present our Website and its contents to you.</li>
                <li>To process your purchases, deliver what you bought, and handle refunds and support requests.</li>
                <li>To assess whether our services fit your firm, schedule calls, and follow up on them.</li>
                <li>To send you the information you requested, and SMS or email messages you have consented to. You can opt out at any time.</li>
                <li>To measure which ads and pages bring visitors and customers, so we can improve our advertising and our Website.</li>
                <li>To prevent fraud, keep our systems secure, and meet our legal, tax and accounting obligations.</li>
            </ul>
        </LegalSection>

        <LegalSection title="5. Cookies & Tracking Technologies" variant="card">
            <p>
                Our Website uses cookies and similar technologies. This is what runs and why:
            </p>
            <ul className="list-disc pl-6 space-y-3">
                <li>
                    <Strong>Meta Pixel and Conversions API (advertising):</Strong> the Meta Pixel runs on our Website and sets Meta&apos;s <code>_fbp</code> and <code>_fbc</code> cookies so Meta can tell us which ads led to visits, sign-ups and purchases, and show our ads to relevant audiences. When you submit a form, book a call or buy, and as a sales conversation progresses, we also send that event to Meta directly from our servers, with your email address, phone number and name in hashed (scrambled) form, along with your IP address and browser type.
                </li>
                <li>
                    <Strong>Attribution cookie:</Strong> our own cookie, <code>_nexli_attr</code>, remembers the ad or campaign you arrived from for 30 days, so a later sign-up or purchase can be credited to it. A copy is kept in your browser&apos;s local storage.
                </li>
                <li>
                    <Strong>Analytics:</Strong> Vercel Analytics and Vercel Speed Insights record page views and performance. Our own analytics script, served from portal.nexli.net, records the pages you view, the referring page, your browser type and country, and a visitor identifier derived from your browser type, screen size and time zone, so we can count unique visitors.
                </li>
                <li>
                    <Strong>Essential and preference storage:</Strong> a signed session cookie that keeps your place in our sign-up steps, your light or dark theme choice, and, if you use Candor, your conversation, stored in your browser so you can pick it up again.
                </li>
            </ul>
            <p>
                You can block or delete cookies in your browser settings at any time; parts of the sign-up steps may not work without them. You can control the ads Meta shows you in your{' '}
                <a href="https://www.facebook.com/adpreferences" target="_blank" rel="noopener noreferrer" className={legalLinkClass}>Meta ad preferences</a>.
            </p>
        </LegalSection>

        <LegalSection title="6. Who We Share Your Information With">
            <p>
                We do <Strong>not</Strong> sell your personal information. We share it only with the service providers that run parts of our business for us, under contract and only for the purposes in this policy:
            </p>
            <ul className="list-disc pl-6 space-y-2">
                <li><Strong>Payment processing:</Strong> our payment processors, such as Stripe, to take and refund payments.</li>
                <li><Strong>CRM, email and SMS:</Strong> GoHighLevel (LeadConnector), which holds our contact records and sends our emails and texts.</li>
                <li><Strong>Hosting, database and analytics:</Strong> Vercel and Neon.</li>
                <li><Strong>Scheduling:</Strong> Cal.com, when you book a call.</li>
                <li><Strong>Video:</Strong> Mux, which hosts our videos and measures playback.</li>
                <li><Strong>Advertising measurement:</Strong> Meta Platforms, as described in section 5.</li>
                <li><Strong>AI features:</Strong> Anthropic, which powers Candor, and ElevenLabs and OpenRouter, which power voice features. They receive what you type or ask, to generate a response.</li>
            </ul>
            <p>
                We may also disclose information where the law requires it, to protect our rights or the safety of others, or to a buyer or successor if our business is sold or reorganised. Mobile numbers and SMS opt-in data are never shared for marketing (see section 2).
            </p>
        </LegalSection>

        <LegalSection title="7. Payment Information">
            <p>
                Card payments are entered on our payment processor&apos;s secure checkout and processed by them. Nexli never sees or stores your full card number or security code. ACH and wire transfers go from your bank to ours; we use the bank details that come with them only to match the payment to your account and, if a refund is due, to send it back.
            </p>
        </LegalSection>

        <LegalSection title="8. Data Retention">
            <p>
                We keep personal information for as long as we need it for the purposes in this policy. For customers, that is the length of the engagement and afterwards as long as tax, accounting and legal obligations require. For everyone else, it is while we are in contact and for a reasonable period after. You can ask us to delete your information at any time (section 10).
            </p>
        </LegalSection>

        <LegalSection title="9. Data Security">
            <p>
                We have implemented measures designed to secure your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure. The safety and security of your information also depends on you.
            </p>
        </LegalSection>

        <LegalSection title="10. Your Rights">
            <p>
                Depending on your location, you may have the following rights regarding your personal information:
            </p>
            <ul className="list-disc pl-6 space-y-2">
                <li><Strong>Right to Access:</Strong> You may request a copy of the personal data we hold about you.</li>
                <li><Strong>Right to Correction:</Strong> You may request that we correct any inaccurate or incomplete personal data.</li>
                <li><Strong>Right to Deletion:</Strong> You may request that we delete your personal data, subject to certain legal exceptions.</li>
                <li><Strong>Right to Opt-Out:</Strong> You may opt out of receiving marketing communications at any time by texting STOP, clicking the unsubscribe link in any email, or contacting us directly.</li>
            </ul>
            <p>
                To exercise any of these rights, contact us at <Email /> or{' '}
                <a href={`tel:${PHONE_E164}`} className={`${legalLinkClass} whitespace-nowrap`}>{PHONE_DISPLAY}</a>. We will respond to your request within 30 days.
            </p>
        </LegalSection>

        <LegalSection title="11. Children">
            <p>
                Our Website and services are intended for businesses and are not directed at anyone under 18. We do not knowingly collect personal information from children.
            </p>
        </LegalSection>

        <LegalSection title="12. Changes to This Policy">
            <p>
                We may update this policy from time to time. The date at the top of this page shows when it last changed.
            </p>
        </LegalSection>

        <LegalSection title="13. Contact Information">
            <p>
                To ask questions or comment about this privacy policy and our privacy practices, contact us at:
            </p>
            <address className="not-italic pl-6 space-y-1">
                <p><Strong>{LEGAL_NAME}</Strong></p>
                <p>{ADDRESS_LINES[0]}</p>
                <p>{ADDRESS_LINES[1]}</p>
                <p>Email: <Email /></p>
                <p>Phone: <a href={`tel:${PHONE_E164}`} className={legalLinkClass}>{PHONE_DISPLAY}</a></p>
            </address>
        </LegalSection>

        <section className="pt-8 mt-8 border-t border-[var(--glass-border)]">
            <p className="text-center text-sm">
                Related: <Link href="/terms" className={legalLinkClass}>Terms and Conditions</Link> ·{' '}
                <Link href="/refund-policy" className={legalLinkClass}>Refund Policy</Link> ·{' '}
                <Link href="/contact" className={legalLinkClass}>Contact</Link>
            </p>
        </section>
    </LegalPage>
);

export default PrivacyPolicy;
