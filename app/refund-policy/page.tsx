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
import { AGENCY_TOTAL_MONTHLY, usd } from '@/lib/agency-offer';
import { EMAIL, PHONE_DISPLAY, PHONE_E164 } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Refund Policy | Nexli Automation',
  description: `Nexli refund and cancellation policy: a ${ADVISORY_REFUND_DAYS}-day full refund on the ${ADVISORY_PRODUCT_NAME}, and how Digital Rainmaker System fees and cancellations work.`,
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
        <p>
          The Digital Rainmaker System is a done-for-you service sold under a signed agreement, at{' '}
          {usd(AGENCY_TOTAL_MONTHLY)} a month plus a one-time setup fee quoted in writing before you sign.
          Because the work starts as soon as you sign, its fees are refundable only as set out here.
        </p>
        <ul className="list-disc pl-6 space-y-3">
          <li>
            <Strong>Setup fee:</Strong> covers the design and build of your website, client portal, funnel
            and automations. It is non-refundable once project work has begun.
          </li>
          <li>
            <Strong>Monthly fee:</Strong> non-refundable once charged. It includes the advertising budget,
            which we place into your campaigns during that month.
          </li>
          <li>
            <Strong>Six-month initial term:</Strong> the engagement has a minimum initial term of six months
            from your first payment. You may give notice at any time during it, but cancellation takes effect
            at the end of the six months, and the monthly fees due within that period remain payable.
          </li>
          <li>
            <Strong>After the initial term:</Strong> the engagement continues month to month and you may
            cancel with 30 days&apos; written notice to <Email />. Cancellation takes effect at the end of the
            notice period. We do not issue partial-month refunds.
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
          and amount of the charge.
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
