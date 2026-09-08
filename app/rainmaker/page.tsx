import type { Metadata } from 'next';
import Services from '../../components/Services';
import JsonLd from '../../components/JsonLd';
import { breadcrumbSchema, serviceSchema } from '../../lib/schema';

export const metadata: Metadata = {
  title: 'Digital Rainmaker System | Growth System for CPA Firms | Nexli',
  description:
    'The Digital Rainmaker System combines a premium website, AI intake automation, a secure client portal, and a Google review engine so established CPA firms land and serve high-value advisory clients.',
  alternates: { canonical: '/rainmaker' },
};

export default function RainmakerPage() {
  return (
    <>
      <JsonLd
        data={[
          serviceSchema(),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Digital Rainmaker System', path: '/rainmaker' },
          ]),
        ]}
      />
      <Services />
    </>
  );
}
