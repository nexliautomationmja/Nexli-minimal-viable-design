import type { Metadata } from 'next';
import RoadmapClient from './roadmap-client';

export const metadata: Metadata = {
  title: 'The CPA Scaling Roadmap | Scale Your Firm Without Hiring or Discounting | Nexli',
  description:
    'The step-by-step roadmap established CPA firms use to move from $800 clients to $8,000 clients. Video walkthrough plus PDF workbook. Instant access for $97.',
  alternates: { canonical: '/roadmap' },
  openGraph: {
    title: 'The CPA Scaling Roadmap | Nexli',
    description:
      'The step-by-step roadmap established CPA firms use to scale past the $800 client. Video walkthrough plus PDF workbook.',
    url: 'https://www.nexli.net/roadmap',
    type: 'website',
  },
};

export default function RoadmapPage() {
  return <RoadmapClient />;
}
