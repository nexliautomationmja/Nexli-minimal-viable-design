import type { Metadata } from 'next';
import HomeContent from '../components/HomeContent';

export const metadata: Metadata = {
  title: 'CPA Website Design & Automation | Nexli | Premium Websites for CPAs, RIAs & Financial Advisors',
  description: 'Premium website design and AI automation for CPAs, accounting firms, RIAs, and financial advisors. We build high-converting websites that attract high-net-worth clients and automate your practice.',
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return <HomeContent />;
}
