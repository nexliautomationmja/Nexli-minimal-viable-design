import type { Metadata } from 'next';
import Funnel from '../../components/Funnel';

export const metadata: Metadata = {
  title: 'Stop Chasing Documents — Automate Your CPA Firm | Nexli',
  description: 'The Digital Rainmaker System helps established CPA firms automate client intake, eliminate email chains, and build a 5-star reputation — all on autopilot.',
  alternates: { canonical: '/funnel' },
};

export default function FunnelPage() {
  return <Funnel />;
}
