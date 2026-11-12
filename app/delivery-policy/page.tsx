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
//
// The Rainmaker build list is Marcel's (2026-11-09): about 21 days from
// kickoff for the website, the portal, the automations, A2P, the ad account
// and invoicing. It restates the Terms (section 3 and 6) and must not
// promise more than they do.
// ---------------------------------------------------------------------------

import type { Metadata } from 'next';
import Link from 'next/link';
import { Truck } from 'lucide-react';
import LegalPage, { LegalSection, Strong, legalLinkClass } from '@/components/legal/LegalPage';
import { ADVISORY_PRODUCT_NAME } from '@/lib/advisory-config';
import {
  AGENCY_AD_SPEND,
  AGENCY_ANNUAL_UPFRONT,
  AGENCY_LAUNCH_DAYS,
  AGENCY_SETUP_FEE,
  usd,
} from '@/lib/agency-offer';
import { EMAIL, PHONE_DISPLAY, PHONE_E164 } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Delivery Policy | Nexli Automation',
  description: `How and when Nexli delivers what you buy: the ${ADVISORY_PRODUCT_NAME} by email immediately after purchase, and the Digital Rainmaker System built in about ${AGENCY_LAUNCH_DAYS} days from kickoff.`,
  alternates: { canonical: '/delivery-policy' },
};

const Email = () => (
  <a href={`mailto:${EMAIL}`} className={legalLinkClass}>{EMAIL}</a>
);

/** What the build delivers, in Marcel's words: everything the system needs to run. */
const BUILD = [
  'Your website',
  'Your branded client portal, with invoicing connected',
  'The sales funnel and the qualifier in front of your calendar',
  'AI automations for intake, follow-up, reminders and Google review requests',
  'A2P 10DLC registration, so the system can text your prospects and clients',
  'Your advertising account, set up and ready to run',
  'The other tools the system needs, connected to each other',
];

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
            <Strong>When work starts:</Strong> at a kickoff call, once the agreement is signed and the{' '}
            {usd(AGENCY_SETUP_FEE)} setup fee ({usd(AGENCY_ANNUAL_UPFRONT)} on the annual plan) has arrived in
            our account. Those two payments are made by ACH bank transfer or wire transfer only, not by card.
            A wire usually arrives the same or next business day; an ACH transfer usually takes one to three
            business days.
          </li>
          <li>
            <Strong>How long the build takes:</Strong> about {AGENCY_LAUNCH_DAYS} days from kickoff. In that
            time we build and set up:
            <ul className="list-[circle] pl-6 mt-2 space-y-1">
              {BUILD.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </li>
          <li>
            <Strong>What sets the pace:</Strong> the {AGENCY_LAUNCH_DAYS} days assume you send the assets,
            account access and approvals we ask for when we ask for them. Two steps also need approval from
            third parties we do not control: the carriers&apos; review of the A2P 10DLC registration, and the
            ad platform&apos;s review of your advertising account. A delay on either moves launch by the same
            amount.
          </li>
          <li>
            <Strong>Launch:</Strong> the day the build is complete and your ads go live. Monthly billing
            starts at launch, and so does your term.
          </li>
          <li>
            <Strong>Every month after launch:</Strong> we maintain your website, portal and automations; make
            changes to the funnels, ads and automations as they are needed; run your ad campaigns, including
            placing the {usd(AGENCY_AD_SPEND)} advertising budget included in your monthly fee; and send a
            weekly written update on where the budget went and what it produced.
          </li>
          <li>
            <Strong>Hosting:</Strong> not part of our fees. You pay your hosting provider directly.
          </li>
          <li>
            <Strong>What you own:</Strong> the website, the client portal, the funnel and the automations we
            build are yours, along with your content, domain, advertising account and client data. The ad
            creative we make for your campaigns (the videos and images) stays ours.
          </li>
          <li>
            <Strong>When it ends:</Strong> our upkeep and management stop. You keep everything we built except the ad creative; we
            hand over any account access we hold for you and remove our own, as set out in our{' '}
            <Link href="/terms" className={legalLinkClass}>Terms and Conditions</Link>.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Questions">
        <p>
          Anything not covered here, contact us through our <Link href="/contact" className={legalLinkClass}>Contact</Link>{' '}
          page. Prices and plans are on our <Link href="/pricing" className={legalLinkClass}>Pricing</Link> page,
          and refunds are covered by our <Link href="/refund-policy" className={legalLinkClass}>Refund Policy</Link>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
