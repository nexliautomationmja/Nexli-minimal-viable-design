import type { Metadata } from 'next';
import ClientDashboard from '../../components/ClientDashboard';

export const metadata: Metadata = {
  title: 'Client Dashboard & Portal | All-in-One CPA Practice Management | Nexli',
  description: "One dashboard to manage your entire CPA practice. Invoicing, engagement letters, client portal, secure messaging, and document collection — all branded to your firm.",
  alternates: { canonical: '/document-portal' },
};

export default function DocumentPortalPage() {
  return <ClientDashboard />;
}
