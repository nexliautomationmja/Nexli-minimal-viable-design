import type { Metadata } from 'next';
import RevenueCalculator from '../../components/RevenueCalculator';

export const metadata: Metadata = {
  title: 'What\'s Your Firm\'s Growth Ceiling? | Free CPA Capacity Calculator | Nexli',
  description: 'Calculate how much additional revenue your CPA firm could handle with optimized systems. Free capacity audit shows your growth bottleneck and benchmark comparison.',
  alternates: { canonical: '/revenuecalc' },
};

export default function RevenueCalcPage() {
  return <RevenueCalculator />;
}
