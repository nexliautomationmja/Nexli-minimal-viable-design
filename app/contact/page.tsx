import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, MapPin, MessageSquare, Phone } from 'lucide-react';
import LegalPage, { LegalSection, Strong, legalLinkClass } from '@/components/legal/LegalPage';
import { ADDRESS_LINES, EMAIL, LEGAL_NAME, PHONE_DISPLAY, PHONE_E164 } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact Us | Nexli Automation',
  description: `Contact ${LEGAL_NAME}: ${ADDRESS_LINES.join(', ')}, ${EMAIL}, ${PHONE_DISPLAY}.`,
  alternates: { canonical: '/contact' },
};

const cardClass = 'rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6';

const CHANNELS = [
  {
    icon: Mail,
    label: 'Email',
    value: EMAIL,
    href: `mailto:${EMAIL}`,
    note: 'Best for orders, refunds and anything you want in writing.',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: PHONE_DISPLAY,
    href: `tel:${PHONE_E164}`,
    note: 'For questions about an order, a charge or your account.',
  },
  {
    icon: MapPin,
    label: 'Business address',
    value: `${ADDRESS_LINES[0]}\n${ADDRESS_LINES[1]}`,
    href: null,
    note: 'Mail and written notices.',
  },
] as const;

export default function ContactPage() {
  return (
    <LegalPage
      eyebrow="Customer Service"
      icon={MessageSquare}
      title="Contact Us"
      intro="Questions about an order, a refund, your engagement or anything on this site. Reach us any of these ways and we reply within one business day."
    >
      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4 list-none p-0">
        {CHANNELS.map((c) => (
          <li key={c.label} className={cardClass}>
            <c.icon className="text-blue-500 mb-4" size={22} aria-hidden="true" />
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">{c.label}</p>
            {c.href ? (
              <a href={c.href} className="text-base font-semibold text-[var(--text-main)] hover:text-blue-500 break-words no-underline">
                {c.value}
              </a>
            ) : (
              <address className="not-italic text-base font-semibold text-[var(--text-main)] whitespace-pre-line">
                {c.value}
              </address>
            )}
            <p className="text-sm mt-3 leading-relaxed">{c.note}</p>
          </li>
        ))}
      </ul>

      <LegalSection title="Who you are dealing with" variant="card">
        <p>
          <Strong>{LEGAL_NAME}</Strong>, a Florida limited liability company, trading as Nexli.
        </p>
        <address className="not-italic">
          {ADDRESS_LINES[0]}
          <br />
          {ADDRESS_LINES[1]}
          <br />
          United States
        </address>
      </LegalSection>

      <LegalSection title="Orders, refunds and delivery">
        <p>
          For a refund on the Book of Business Accelerator, reply to your purchase receipt or email{' '}
          <a href={`mailto:${EMAIL}`} className={legalLinkClass}>{EMAIL}</a>. The full rules are in our{' '}
          <Link href="/refund-policy" className={legalLinkClass}>Refund Policy</Link>. If your guide has not
          arrived, see our <Link href="/delivery-policy" className={legalLinkClass}>Delivery Policy</Link>,
          then get in touch and we will resend it.
        </p>
        <p>
          What we sell and what it costs is on our <Link href="/pricing" className={legalLinkClass}>Pricing</Link>{' '}
          page. Our <Link href="/terms" className={legalLinkClass}>Terms and Conditions</Link> and{' '}
          <Link href="/privacy" className={legalLinkClass}>Privacy Policy</Link> cover the rest.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
