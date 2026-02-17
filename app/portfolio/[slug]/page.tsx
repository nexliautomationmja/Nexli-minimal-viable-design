import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PortfolioFirmContent from '../../../components/PortfolioFirmContent';

const PORTFOLIO_META: Record<string, { title: string; description: string }> = {
  'summit-tax-group': {
    title: 'Summit Tax Group | CPA Firm Website Design | Nexli Portfolio',
    description: 'See how Nexli designed a premium, high-converting website for Summit Tax Group, a CPA firm. Custom design that builds trust and converts prospects into clients.',
  },
  'clarity-advisory': {
    title: 'Clarity Advisory | CPA Firm Website Design | Nexli Portfolio',
    description: 'Explore the custom website design for Clarity Advisory, a CPA firm. Premium digital experience built to attract high-value clients and reflect advisory excellence.',
  },
  'meridian-financial': {
    title: 'Meridian Financial | RIA Website Design | Nexli Portfolio',
    description: 'See the premium website Nexli designed for Meridian Financial, a registered investment advisor. Built to convert affluent prospects into long-term clients.',
  },
  'harbor-wealth': {
    title: 'Harbor Wealth | Wealth Management Website Design | Nexli Portfolio',
    description: 'Explore the custom website design for Harbor Wealth, a wealth management firm. A premium digital experience that communicates trust and expertise.',
  },
};

const VALID_SLUGS = Object.keys(PORTFOLIO_META);

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return VALID_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meta = PORTFOLIO_META[slug];
  if (!meta) {
    return { title: 'Portfolio | Nexli' };
  }
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `/portfolio/${slug}` },
  };
}

export default async function PortfolioFirmPage({ params }: Props) {
  const { slug } = await params;
  if (!VALID_SLUGS.includes(slug)) notFound();

  return <PortfolioFirmContent slug={slug} />;
}
