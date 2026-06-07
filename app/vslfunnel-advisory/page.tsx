import type { Metadata } from 'next';
import VslFunnelAdvisory from './vslfunnel-advisory-client';

export const metadata: Metadata = {
  title: 'Stop Trading $400 Tax Returns for 80-Hour Aprils — Build an Advisory Firm You Actually Love | Nexli',
  description: 'Tax-prep clients haggle over every dollar, disappear after April, and burn you out. Advisory clients pay 10x more, stay year-round, and actually value your expertise. Here\'s the system that makes the shift possible.',
  alternates: { canonical: '/vslfunnel-advisory' },
};

export default function VslFunnelAdvisoryPage() {
  return <VslFunnelAdvisory />;
}
