// ---------------------------------------------------------------------------
// The four card-brand acceptance marks the processor requires on the site:
// Visa, Mastercard, American Express, Discover.
//
// Artwork is Shopify's payment_icons set (MIT, see
// public/payment-logos/LICENSE.txt). Each SVG carries its own card-shaped
// background, so the marks read the same on the light site, the dark site
// and the dark funnel canvas. Do not recolour or crop them: the networks'
// brand rules require the marks to be shown as issued.
// ---------------------------------------------------------------------------

import React from 'react';

export const CARD_BRANDS = [
  { name: 'Visa', src: '/payment-logos/visa.svg' },
  { name: 'Mastercard', src: '/payment-logos/mastercard.svg' },
  { name: 'American Express', src: '/payment-logos/amex.svg' },
  { name: 'Discover', src: '/payment-logos/discover.svg' },
] as const;

/** The artwork is 38×24. */
const HEIGHT = { sm: 22, md: 30 } as const;

interface CardLogosProps {
  size?: keyof typeof HEIGHT;
  className?: string;
}

export default function CardLogos({ size = 'md', className = '' }: CardLogosProps) {
  const h = HEIGHT[size];
  const w = Math.round((h * 38) / 24);

  return (
    <ul
      className={`flex flex-wrap items-center gap-2 list-none p-0 ${className}`}
      aria-label="We accept Visa, Mastercard, American Express and Discover"
    >
      {CARD_BRANDS.map((brand) => (
        <li key={brand.name} className="leading-none">
          <img src={brand.src} alt={brand.name} width={w} height={h} className="block" style={{ width: w, height: h }} />
        </li>
      ))}
    </ul>
  );
}
