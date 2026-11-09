// ---------------------------------------------------------------------------
// The refund policy, standalone, because the card processor's underwriters
// look for it by name and cardholders have to be able to read it before
// they buy.
//
// It restates the Terms (components/TermsAndConditions.tsx, section 2); it
// must never say more or less than they do. Every number comes from the
// same constants the sales pages use, so the policy cannot quote a refund
// window or a price the checkout does not.
// ---------------------------------------------------------------------------

import type { Metadata } from 'next';
import Link from 'next/link';
import { RotateCcw } from 'lucide-react';
import LegalPage, { LegalSection, Strong, legalLinkClass } from '@/components/legal/LegalPage';
import {
  ADVISORY_PRICE_DISPLAY,
  ADVISORY_PRODUCT_NAME,
  ADVISORY_REFUND_DAYS,
} from '@/lib/advisory-config';
import {
  AGENCY_AD_SPEND,
  AGENCY_ANNUAL_SERVICE_FEE,
  AGENCY_ANNUAL_TERM_MONTHS,
  AGENCY_ANNUAL_UPFRONT,
  AGENCY_CANCEL_NOTICE_DAYS,
  AGENCY_INITIAL_TERM_MONTHS,
  AGENCY_SETUP_FEE,
  AGENCY_TOTAL_MONTHLY,
  usd,
} from '@/lib/agency-offer';
import { EMAIL, PHONE_DISPLAY, PHONE_E164 } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Refund Policy | Nexli Automation',
  description: `Nexli refund and cancellation policy: a ${ADVISORY_REFUND_DAYS}-day full refund on the ${ADVISORY_PRODUCT_NAME}, and the non-refundable fees, terms and cancellation rules of the Digital Rainmaker System.`,
  alternates: { canonical: '/refund-policy' },
};

const Email = () => (
  <a href={`mailto:${EMAIL}`} className={legalLinkClass}>{EMAIL}</a>
);
const Tel = () => (
  <a href={`tel:${PHONE_E164}`} className={`${legalLinkClass} whitespace-nowrap`}>{PHONE_DISPLAY}</a>
);

export default function RefundPolicyPage() {
  return (
    <LegalPage
      eyebrow="Refunds & Cancellations"
      icon={RotateCcw}
      title="Refund Policy"
      dateLine="Effective Date: November 9, 2026"
      intro="What you can get back, how to ask for it, and how long it takes. This policy forms part of our Terms and Conditions."
    >
      <LegalSection title={`1. ${ADVISORY_PRODUCT_NAME} (${ADVISORY_PRICE_DISPLAY})`} variant="feature">
        <p className="text-[var(--text-main)] font-medium">
          Full refund within {ADVISORY_REFUND_DAYS} days of purchase, for any reason.
        </p>
        <ul className="list-disc pl-6 space-y-3">
          <li>
            <Strong>How to ask:</Strong> reply to your purchase receipt, email <Email />, or call <Tel />.
            Tell us the email address you used at checkout. No form, and you do not have to give a reason.
          </li>
          <li>
            <Strong>Where it goes:</Strong> back to the card you paid with. We do not issue refunds as
            credit or to a different card.
          </li>
          <li>
            <Strong>How long it takes:</Strong> we issue approved refunds within 5 business days of your
            request. Your bank may then take 5 to 10 business days to show it on your statement.
          </li>
          <li>
            <Strong>You keep the file.</Strong> You are not asked to delete or return the guide.
          </li>
          <li>
            <Strong>After {ADVISORY_REFUND_DAYS} days</Strong> the purchase is final, except for billing
            errors (section 3).
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="2. Digital Rainmaker System" variant="card">
        <p className="text-[var(--text-main)] font-medium">
          No refunds. Every fee for the Digital Rainmaker System is non-refundable, except for billing errors
          (section 3).
        </p>
        <p>
          It is a done-for-you service sold under a signed agreement, paid monthly or annually, and both start
          with a one-time {usd(AGENCY_SETUP_FEE)} setup fee. The fees pay for work we schedule and carry out
          for you, which is why they are not refundable. You read and sign these terms before you pay anything.
        </p>
        <ul className="list-disc pl-6 space-y-3">
          <li>
            <Strong>Setup fee ({usd(AGENCY_SETUP_FEE)}, due at signing):</Strong> pays for the build of your
            website, client portal, sales funnel, automations, text-messaging registration, ad account and
            invoicing. Non-refundable.
          </li>
          <li>
            <Strong>Monthly plan ({usd(AGENCY_TOTAL_MONTHLY)} a month, from launch):</Strong> includes the{' '}
            {usd(AGENCY_AD_SPEND)} advertising budget, which we place into your campaigns that month. Each
            monthly fee is non-refundable once charged.
          </li>
          <li>
            <Strong>{AGENCY_INITIAL_TERM_MONTHS}-month minimum on the monthly plan:</Strong> the minimum term
            is {AGENCY_INITIAL_TERM_MONTHS} months from launch. You may give notice at any time during it, but
            cancellation takes effect at the end of the {AGENCY_INITIAL_TERM_MONTHS} months, and the monthly
            fees due within that period remain payable.
          </li>
          <li>
            <Strong>After the minimum term:</Strong> the monthly plan continues month to month and you may
            cancel with {AGENCY_CANCEL_NOTICE_DAYS} days&apos; written notice to <Email />. Cancellation takes
            effect at the end of the notice period. We do not issue partial-month refunds.
          </li>
          <li>
            <Strong>Annual plan ({usd(AGENCY_ANNUAL_UPFRONT)}, due at signing):</Strong> the{' '}
            {usd(AGENCY_SETUP_FEE)} setup fee plus {usd(AGENCY_ANNUAL_SERVICE_FEE)} for{' '}
            {AGENCY_ANNUAL_TERM_MONTHS} months of service, paid in advance, with the {usd(AGENCY_AD_SPEND)}{' '}
            advertising budget billed monthly from launch. None of the {usd(AGENCY_ANNUAL_UPFRONT)} is
            refundable, in whole or in part, and each month&apos;s advertising budget is non-refundable once
            charged.
          </li>
          <li>
            <Strong>Cancelling the annual plan:</Strong> you may give notice at any time. Service continues to
            the end of the {AGENCY_ANNUAL_TERM_MONTHS} months from launch, the monthly advertising budget
            remains payable through the end of that term, and nothing already paid is refunded. The annual plan
            does <Strong>not</Strong> renew automatically: nothing is charged after the{' '}
            {AGENCY_ANNUAL_TERM_MONTHS} months unless you agree in writing to continue.
          </li>
          <li>
            <Strong>One system, one fee:</Strong> parts of the system cannot be removed, paused or refunded
            separately, and fees are not reduced if you choose not to use part of it.
          </li>
          <li>
            <Strong>No performance guarantee:</Strong> we do not guarantee results, and fees are not refunded
            on the basis of campaign or business outcomes.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Billing errors">
        <p>
          If you were charged twice, charged the wrong amount, or charged for something you did not buy, we
          refund the difference in full whenever you raise it. Email <Email /> or call <Tel /> with the date
          and amount of the charge. The refund goes back the way you paid: to your card for card payments, or
          to your bank account for payments made by ACH or wire transfer (the {usd(AGENCY_SETUP_FEE)} setup
          fee and the {usd(AGENCY_ANNUAL_UPFRONT)} annual plan payment).
        </p>
      </LegalSection>

      <LegalSection title="4. Before you dispute a charge">
        <p>
          Please contact us first. A refund from us reaches you faster than a dispute through your bank. See
          our <Link href="/contact" className={legalLinkClass}>Contact</Link>{' '}
          page for every way to reach us.
        </p>
      </LegalSection>

      <section className="pt-8 mt-8 border-t border-[var(--glass-border)]">
        <p className="text-center text-sm">
          Related: <Link href="/terms" className={legalLinkClass}>Terms and Conditions</Link> ·{' '}
          <Link href="/delivery-policy" className={legalLinkClass}>Delivery Policy</Link> ·{' '}
          <Link href="/pricing" className={legalLinkClass}>Pricing</Link>
        </p>
      </section>
    </LegalPage>
  );
}
