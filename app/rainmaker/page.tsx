import type { Metadata } from 'next';
import Services from '../../components/Services';

export const metadata: Metadata = {
  title: 'Digital Rainmaker System | CPA Website Design & AI Automation | Nexli',
  description: 'The Digital Rainmaker System combines premium website design, AI automation, and Google review amplification to help CPAs and financial advisors attract and convert high-value clients.',
  alternates: { canonical: '/rainmaker' },
};

export default function RainmakerPage() {
  return <Services />;
}
