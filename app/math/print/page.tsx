// ---------------------------------------------------------------------------
// /math/print — the page the See the Math PDF is made from.
//
// Not for people: scripts/build-math-pdf.mjs opens it at 1280×720 and prints
// it to public/downloads/nexli-see-the-math.pdf. It renders the deck's own
// slides (components/math/slides), one per 16:9 page, so the PDF always
// matches the deck. Unlisted like /math: robots disallows /math and
// everything under it, and the site navbar and footer skip /math/ paths.
// ---------------------------------------------------------------------------
import type { Metadata } from 'next';
import MathPrint from './math-print';

export const metadata: Metadata = {
  // Becomes the PDF's title.
  title: 'See the Math | Nexli',
  robots: 'noindex, nofollow',
};

export default function MathPrintPage() {
  return <MathPrint />;
}
