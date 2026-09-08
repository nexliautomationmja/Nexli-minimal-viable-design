import type { Metadata } from 'next';
import About from '../../components/About';
import JsonLd from '../../components/JsonLd';
import { aboutPageSchema, breadcrumbSchema, personSchema } from '../../lib/schema';
import { ORG_DESCRIPTION } from '../../lib/site';

const TITLE = 'About Nexli Automation | CPA Firm Growth Agency Founded by Marcel Allen';

export const metadata: Metadata = {
  title: TITLE,
  description: ORG_DESCRIPTION,
  alternates: { canonical: '/about' },
  openGraph: { title: TITLE, description: ORG_DESCRIPTION, type: 'website' },
};

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={[
          aboutPageSchema(),
          personSchema(),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'About', path: '/about' },
          ]),
        ]}
      />
      <About />
    </>
  );
}
