// ---------------------------------------------------------------------------
// The delivery policy. The processor asks every merchant for one: when does
// the buyer get what they paid for, and how. Nexli ships nothing physical,
// so this covers digital delivery of the guide and service delivery of the
// Digital Rainmaker System.
//
// Keep it to what actually happens. The guide is EMAILED to every buyer —
// that is the one delivery path common to all of them (buyers who missed the
// qualifier bar land on /next-steps, which has no download button), so the
// policy promises the email and nothing more specific.
// ---------------------------------------------------------------------------

import type { Metadata } from 'next';
import Link from 'next/link';
import { Truck } from 'lucide-react';
import LegalPage, { LegalSection, Strong, legalLinkClass } from '@/components/legal/LegalPage';
import { ADVISORY_PRODUCT_NAME } from '@/lib/advisory-config';
import { AGENCY_LAUNCH_DAYS, AGENCY_LAUNCH_DAYS_MAX, AGENCY_LAUNCH_DAYS_MIN } from '@/lib/agency-offer';
import { EMAIL, PHONE_DISPLAY, PHONE_E164 } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Delivery Policy | Nexli Automation',
  description: `How and when Nexli delivers what you buy: the ${ADVISORY_PRODUCT_NAME} by email immediately after purchase, and the Digital Rainmaker System live in ${AGENCY_LAUNCH_DAYS_MIN} to ${AGENCY_LAUNCH_DAYS} days.`,
  alternates: { canonical: '/delivery-policy' },
};

const Email = () => (
  <a href={`mailto:${EMAIL}`} className={legalLinkClass}>{EMAIL}</a>
);

export default function DeliveryPolicyPage() {
  return (
    <LegalPage
      eyebrow="Delivery"
      icon={Truck}
      title="Delivery Policy"
      dateLine="Effective Date: November 9, 2026"
      intro="Nexli sells a digital product and a done-for-you service. Nothing is shipped: there are no physical goods, shipping charges or delivery addresses involved in any purchase."
    >
      <LegalSection title={`1. ${ADVISORY_PRODUCT_NAME} (digital product)`} variant="feature">
        <ul className="list-disc pl-6 space-y-3">
          <li>
            <Strong>What you get:</Strong> a single PDF guide.
          </li>
          <li>
            <Strong>How it is delivered:</Strong> by email, as an attachment, to the email address you enter
            at checkout.
          </li>
          <li>
            <Strong>When:</Strong> immediately after your payment goes through. It usually arrives within a
            few minutes.
          </li>
          <li>
            <Strong>If it has not arrived within an hour:</Strong> check your spam or promotions folder, then
            email <Email /> or call{' '}
            <a href={`tel:${PHONE_E164}`} className={`${legalLinkClass} whitespace-nowrap`}>{PHONE_DISPLAY}</a>.
            We resend it within one business day.
          </li>
          <li>
            <Strong>Access:</Strong> the file is yours to keep. There is no login, no subscription and no
            expiry.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="2. Digital Rainmaker System (service)" variant="card">
        <ul className="list-disc pl-6 space-y-3">
          <li>
            <Strong>When work starts:</Strong> at a kickoff call, once the agreement is signed and the setup
            fee is paid.
          </li>
          <li>
            <Strong>Build and launch:</Strong> most firms are live within {AGENCY_LAUNCH_DAYS_MIN} to{' '}
            {AGENCY_LAUNCH_DAYS} days of kickoff, and {AGENCY_LAUNCH_DAYS_MAX} days is the outside edge. The
            timeline depends on how quickly you send the assets, account access and approvals we ask for.
          </li>
          <li>
            <Strong>What goes live:</Strong> your website, branded client portal, sales funnel, automations,
            Google review engine and ad campaigns.
          </li>
          <li>
            <Strong>Every month after launch:</Strong> ad campaign management (including placing the ad budget
            included in your monthly fee), hosting, ongoing optimization, and a weekly report on where the
            budget went.
          </li>
          <li>
            <Strong>When it ends:</Strong> on termination we provide an export of your website content and
            client data within 30 days, as set out in our{' '}
            <Link href="/terms" className={legalLinkClass}>Terms and Conditions</Link>.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Questions">
        <p>
          Anything not covered here, contact us through our <Link href="/contact" className={legalLinkClass}>Contact</Link>{' '}
          page. Refunds are covered by our <Link href="/refund-policy" className={legalLinkClass}>Refund Policy</Link>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
