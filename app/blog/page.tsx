import type { Metadata } from 'next';
import Blog from '../../components/Blog';

export const metadata: Metadata = {
  title: 'Blog | CPA & Financial Advisor Marketing Insights | Nexli',
  description: 'Expert insights on CPA website design, accounting firm marketing, financial advisor SEO, AI automation, and lead generation strategies for growing your practice.',
  alternates: { canonical: '/blog' },
};

export default function BlogPage() {
  return <Blog />;
}
