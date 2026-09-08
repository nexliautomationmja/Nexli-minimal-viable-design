import type { Metadata } from 'next';
import HomeContent from '../components/HomeContent';
import JsonLd from '../components/JsonLd';
import { serviceSchema } from '../lib/schema';

export const metadata: Metadata = {
  title: 'CPA Firm Growth Agency | Digital Rainmaker System | Nexli',
  description:
    'Nexli is a CPA firm growth agency. We build the Digital Rainmaker System and run ads to it so established CPA firms land high-value tax advisory clients.',
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={serviceSchema()} />
      <HomeContent />
    </>
  );
}
