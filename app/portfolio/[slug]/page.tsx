import type { Metadata } from 'next';
import { socialMeta } from '@/lib/seo';
import { notFound } from 'next/navigation';
import PortfolioFirmContent from '../../../components/PortfolioFirmContent';
import { PORTFOLIO_META, PORTFOLIO_SLUGS } from '../../../lib/portfolio-meta';

const VALID_SLUGS = PORTFOLIO_SLUGS;

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
    // Its own og:url and the Nexli share image. Without this the page
    // inherited the homepage's og tags while rendering a fictional
    // firm's website, which reads to a crawler as Nexli's own site.
    ...socialMeta({ title: meta.title, description: meta.description, path: `/portfolio/${slug}` }),
  };
}

export default async function PortfolioFirmPage({ params }: Props) {
  const { slug } = await params;
  if (!VALID_SLUGS.includes(slug)) notFound();

  return <PortfolioFirmContent slug={slug} />;
}
