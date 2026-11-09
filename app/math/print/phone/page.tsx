// ---------------------------------------------------------------------------
// /math/print/phone — the page the phone See the Math PDF is made from.
//
// The deck's phone layout, one slide per page, each page as tall as its
// slide: see app/math/print/math-print. Not for people;
// scripts/build-math-pdf.mjs prints it to
// public/downloads/nexli-see-the-math-phone.pdf. Unlisted like /math.
// ---------------------------------------------------------------------------
import type { Metadata } from 'next';
import MathPrint from '../math-print';

export const metadata: Metadata = {
  // Becomes the PDF's title.
  title: 'See the Math | Nexli',
  robots: 'noindex, nofollow',
};

export default function MathPrintPhonePage() {
  return <MathPrint format="phone" />;
}
