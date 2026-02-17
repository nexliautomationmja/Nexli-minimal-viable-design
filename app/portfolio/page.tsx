import type { Metadata } from 'next';
import Portfolio from '../../components/Portfolio';

export const metadata: Metadata = {
  title: 'Portfolio | Premium CPA & Financial Advisor Website Designs | Nexli',
  description: 'Explore our portfolio of premium website designs for CPAs, accounting firms, RIAs, and financial advisors. Each project is custom-crafted to convert visitors into clients.',
  alternates: { canonical: '/portfolio' },
};

export default function PortfolioPage() {
  return <Portfolio />;
}
