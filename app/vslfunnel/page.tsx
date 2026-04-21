import type { Metadata } from 'next';
import VslFunnel from '../../components/VslFunnel';

export const metadata: Metadata = {
  title: 'Stop Losing High-Value Clients to Firms With Better Systems | Nexli',
  description: 'The Digital Rainmaker System is a complete, done-for-you infrastructure that automates your intake, secures your documents, and engineers 5-star Google reviews on autopilot. Built exclusively for established CPA firms.',
  alternates: { canonical: '/vslfunnel' },
};

export default function VslFunnelPage() {
  return <VslFunnel />;
}
