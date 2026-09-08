import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getGuideBySlug, guides } from '../../../data/guides';
import { getAuthor } from '../../../data/authors';
import GuideArticle from '../../../components/guides/GuideArticle';
import JsonLd from '../../../components/JsonLd';
import { breadcrumbSchema, faqSchema, guideSchema } from '../../../lib/schema';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return { title: 'Guide Not Found | Nexli' };

  const title = guide.metaTitle ?? `${guide.title} | Nexli`;
  const author = getAuthor(guide.author);

  return {
    title,
    description: guide.description,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: {
      type: 'article',
      title,
      description: guide.description,
      publishedTime: guide.publishedAt,
      modifiedTime: guide.updatedAt,
      authors: [author.name],
      section: guide.category,
    },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  return (
    <>
      <JsonLd
        data={[
          guideSchema(guide),
          faqSchema(guide.faq),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Guides', path: '/guides' },
            { name: guide.title, path: `/guides/${guide.slug}` },
          ]),
        ]}
      />
      <GuideArticle guide={guide} />
    </>
  );
}
