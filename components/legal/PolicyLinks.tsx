// ---------------------------------------------------------------------------
// The policy link row plus the business line (legal name, address, email,
// phone). The processor's underwriters look for exactly these links, by
// these names, at the bottom of any page that sells. One list here so the
// site footer, the VSL disclaimer and the funnel footer cannot drift apart.
// ---------------------------------------------------------------------------

import React from 'react';
import Link from 'next/link';
import { ADDRESS_LINES, EMAIL, LEGAL_NAME, PHONE_DISPLAY, PHONE_E164 } from '@/lib/site';

export const POLICY_LINKS = [
  { href: '/terms', label: 'Terms & Conditions' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/refund-policy', label: 'Refund Policy' },
  { href: '/delivery-policy', label: 'Delivery Policy' },
  { href: '/contact', label: 'Contact' },
  { href: '/pricing', label: 'Pricing' },
] as const;

interface PolicyLinksProps {
  /**
   * Open in a new tab. Used on funnel pages, where following a policy link
   * should not take a buyer off the page they were about to buy from.
   */
  newTab?: boolean;
  /** Text colour. Defaults to the theme's muted text. */
  color?: string;
  align?: 'center' | 'start';
  /** Show the legal name, address, email and phone under the links. */
  showBusiness?: boolean;
  className?: string;
}

export default function PolicyLinks({
  newTab = false,
  color = 'var(--text-muted)',
  align = 'center',
  showBusiness = true,
  className = '',
}: PolicyLinksProps) {
  const tab = newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  const justify = align === 'center' ? 'justify-center text-center' : 'justify-center text-center md:justify-start md:text-left';

  return (
    <div className={`flex flex-col gap-3 ${align === 'center' ? 'items-center' : 'items-center md:items-start'} ${className}`} style={{ color }}>
      <nav aria-label="Policies" className={`flex flex-wrap gap-x-5 gap-y-3 text-[10px] font-black uppercase tracking-[0.2em] ${justify}`}>
        {POLICY_LINKS.map((l) => (
          <Link key={l.href} href={l.href} {...tab} className="transition-colors hover:text-blue-500">
            {l.label}
          </Link>
        ))}
      </nav>

      {showBusiness && (
        <p className={`text-[11px] leading-relaxed ${justify}`}>
          {/* Each fact is unbreakable, so a narrow screen wraps between them
              rather than splitting the ZIP code from its city. */}
          <span className="whitespace-nowrap">{LEGAL_NAME}</span> ·{' '}
          <span className="whitespace-nowrap">{ADDRESS_LINES[0]},</span>{' '}
          <span className="whitespace-nowrap">{ADDRESS_LINES[1]}</span> ·{' '}
          <a href={`mailto:${EMAIL}`} className="whitespace-nowrap underline-offset-2 hover:underline hover:text-blue-500">
            {EMAIL}
          </a>{' '}
          ·{' '}
          <a href={`tel:${PHONE_E164}`} className="whitespace-nowrap underline-offset-2 hover:underline hover:text-blue-500">
            {PHONE_DISPLAY}
          </a>
        </p>
      )}
    </div>
  );
}
