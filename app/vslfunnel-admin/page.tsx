import type { Metadata } from 'next';
import VslFunnelAdmin from './vslfunnel-admin-client';

export const metadata: Metadata = {
  title: 'What Happens If Your Admin Quits in 30 Days? | Nexli',
  description: 'Who chases the missing documents? Who answers the client calls? If the honest answer is "I have no idea" — your firm has a systems problem.',
  alternates: { canonical: '/vslfunnel-admin' },
};

export default function VslFunnelAdminPage() {
  return <VslFunnelAdmin />;
}
