import type { Metadata } from 'next';
import SmartReviews from '../../components/SmartReviews';

export const metadata: Metadata = {
  title: 'Smart Reviews | Automated Google Review Management for CPAs | Nexli',
  description: 'Automatically request, route, and manage Google reviews for your CPA or financial advisory firm. Build your online reputation and attract new clients on autopilot.',
  alternates: { canonical: '/smart-reviews' },
};

export default function SmartReviewsPage() {
  return <SmartReviews />;
}
