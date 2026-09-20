import type { Metadata } from 'next';
import { Syne } from 'next/font/google';
import ProfitCalculator from '../../components/ProfitCalculator';

// Display font used by the Nexli portal (Launch Pad). Scoped to this page only.
const syne = Syne({
  variable: '--font-syne',
  subsets: ['latin'],
  weight: ['700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Profit Calculator | Nexli',
  description: 'Internal sales-call tool.',
  robots: 'noindex, nofollow',
};

export default function ProfitCalculatorPage() {
  return (
    <div className={syne.variable}>
      <ProfitCalculator />
    </div>
  );
}
