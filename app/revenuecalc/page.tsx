import type { Metadata } from 'next';
import RevenueCalculator from '../../components/RevenueCalculator';

export const metadata: Metadata = {
  title: 'How Much Revenue Are You Bleeding? | Free CPA Firm Calculator | Nexli',
  description: 'Calculate exactly how much growth your CPA firm is leaving on the table with outdated systems. Free 60-second diagnostic shows your annual opportunity cost.',
  alternates: { canonical: '/revenuecalc' },
};

export default function RevenueCalcPage() {
  return <RevenueCalculator />;
}
