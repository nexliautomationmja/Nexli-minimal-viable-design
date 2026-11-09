import type { Metadata } from 'next';
import HomeContent from '../components/HomeContent';
import JsonLd from '../components/JsonLd';
import { serviceSchema } from '../lib/schema';
import { socialMeta } from '../lib/seo';
import { CLIENT_VALUE_LINE } from '../lib/agency-offer';

const TITLE = 'Nexli Automation | CPA Firm Growth Agency for Tax Planning Clients';
const DESCRIPTION = `Nexli Automation is a CPA firm growth agency. We build the Digital Rainmaker System and run ads to it, bringing established CPA firms ${CLIENT_VALUE_LINE}.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/' },
  ...socialMeta({ title: TITLE, description: DESCRIPTION, path: '/' }),
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={serviceSchema()} />
      <HomeContent />
    </>
  );
}
