// ---------------------------------------------------------------------------
// Products & Pricing. Everything Nexli sells, what it costs, and how it is
// billed, delivered and refunded, on one public page.
//
// Why it exists: the only card checkout on the site, the $97 guide, sits
// behind the qualifier (/advisory-pricing/BOBA needs the opt-in cookie), so
// a card processor's underwriter browsing the site would otherwise find no
// product, no price and no checkout. This is the page to point them at.
//
// noindex: it is for underwriters and anyone who asks, not a search landing
// page competing with the funnels. Linked from every footer.
//
// The setup fee is DISCLOSED, never priced — see the rule in
// lib/agency-offer.ts. Every number comes from the constants the sales pages
// use.
// ---------------------------------------------------------------------------

import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, Tag } from 'lucide-react';
import LegalPage, { legalLinkClass } from '@/components/legal/LegalPage';
import CardLogos from '@/components/legal/CardLogos';
import {
  ADVISORY_PATH,
  ADVISORY_PRICE_DISPLAY,
  ADVISORY_PRODUCT_NAME,
  ADVISORY_QUALIFY_PATH,
  ADVISORY_REFUND_DAYS,
} from '@/lib/advisory-config';
import {
  AGENCY_AD_SPEND,
  AGENCY_LAUNCH_DAYS,
  AGENCY_LAUNCH_DAYS_MAX,
  AGENCY_LAUNCH_DAYS_MIN,
  AGENCY_TOTAL_MONTHLY,
  usd,
} from '@/lib/agency-offer';
import { MIN_REVENUE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Products & Pricing | Nexli Automation',
  description: `What Nexli sells and what it costs: the Digital Rainmaker System at ${usd(AGENCY_TOTAL_MONTHLY)} a month and the ${ADVISORY_PRODUCT_NAME} at ${ADVISORY_PRICE_DISPLAY}.`,
  alternates: { canonical: '/pricing' },
  robots: { index: false, follow: true },
};

interface Product {
  name: string;
  kind: string;
  summary: string;
  price: string;
  per: string;
  priceNote: string;
  points: string[];
  cta: { label: string; href: string };
}

const PRODUCTS: Product[] = [
  {
    name: 'Digital Rainmaker System',
    kind: 'Done-for-you service',
    summary: `We build and run the system that brings established CPA firms (${MIN_REVENUE} in annual revenue) high-value advisory clients: a premium website, a branded client portal, a sales funnel, AI automations, a Google review engine, and the paid ad campaigns that drive it.`,
    price: usd(AGENCY_TOTAL_MONTHLY),
    per: '/ month',
    priceNote: `Includes the ${usd(AGENCY_AD_SPEND)} monthly ad budget, which we place into your campaigns. Plus a one-time setup fee, quoted in writing before you sign.`,
    points: [
      'Sold under a signed agreement, billed by invoice',
      'Six-month minimum initial term, then month to month with 30 days’ notice',
      `Live within ${AGENCY_LAUNCH_DAYS_MIN} to ${AGENCY_LAUNCH_DAYS} days of kickoff, ${AGENCY_LAUNCH_DAYS_MAX} days at most`,
      'Setup fee non-refundable once work begins; monthly fees non-refundable once charged',
    ],
    cta: { label: 'Book a call', href: ADVISORY_PATH },
  },
  {
    name: ADVISORY_PRODUCT_NAME,
    kind: 'Digital product',
    summary:
      'A five-page PDF guide for CPAs: how to find the clients in your existing book who need advisory work, the call script to raise it with them, and a pricing table to quote it.',
    price: ADVISORY_PRICE_DISPLAY,
    per: 'one time',
    priceNote: 'One payment by card. No subscription and nothing to cancel.',
    points: [
      'Emailed to you immediately after purchase',
      'Yours to keep, no login and no expiry',
      `Full refund within ${ADVISORY_REFUND_DAYS} days, for any reason`,
      'Offered after a 2-minute fit check',
    ],
    cta: { label: 'Take the fit check', href: ADVISORY_QUALIFY_PATH },
  },
];

export default function PricingPage() {
  return (
    <LegalPage
      eyebrow="Products & Pricing"
      icon={Tag}
      title="Pricing"
      intro="Everything we sell, what it costs, and how it is billed, delivered and refunded. All prices are in US dollars."
    >
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 list-none p-0">
        {PRODUCTS.map((p) => (
          <li
            key={p.name}
            className="flex flex-col rounded-3xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 sm:p-8"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-2">{p.kind}</p>
            <h2 className="text-2xl font-bold text-[var(--text-main)] mb-3">{p.name}</h2>
            <p className="text-base leading-relaxed mb-6">{p.summary}</p>

            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-4xl sm:text-5xl font-black text-[var(--text-main)]">{p.price}</span>
              <span className="text-base">{p.per}</span>
            </div>
            <p className="text-sm leading-relaxed mt-2 mb-6">{p.priceNote}</p>

            <ul className="space-y-3 mb-8 list-none p-0 text-base">
              {p.points.map((pt) => (
                <li key={pt} className="flex gap-3">
                  <Check className="text-blue-500 flex-shrink-0 mt-1" size={18} aria-hidden="true" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>

            <Link
              href={p.cta.href}
              className="mt-auto inline-flex justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white no-underline transition-colors hover:bg-blue-500"
            >
              {p.cta.label}
            </Link>
          </li>
        ))}
      </ul>

      <section className="rounded-3xl border border-[var(--glass-border)] p-6 sm:p-8 space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-main)]">Payment</h2>
        <CardLogos />
        <p className="text-base">
          We accept Visa, Mastercard, American Express and Discover. Card payments are processed securely by
          our payment processor; Nexli never sees or stores your full card number.
        </p>
        <p className="text-base">
          Before you buy, please read our{' '}
          <Link href="/refund-policy" className={legalLinkClass}>Refund Policy</Link>,{' '}
          <Link href="/delivery-policy" className={legalLinkClass}>Delivery Policy</Link> and{' '}
          <Link href="/terms" className={legalLinkClass}>Terms and Conditions</Link>. Questions?{' '}
          <Link href="/contact" className={legalLinkClass}>Contact us</Link>.
        </p>
      </section>
    </LegalPage>
  );
}
