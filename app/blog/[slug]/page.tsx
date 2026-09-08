import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { blogPosts, getBlogPostBySlug } from '../../../data/blogPosts';
import BlogPost from '../../../components/BlogPost';
import JsonLd from '../../../components/JsonLd';
import { blogPostSchema, breadcrumbSchema } from '../../../lib/schema';
import { SITE_URL } from '../../../lib/site';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) {
    return { title: 'Post Not Found | Nexli Blog' };
  }

  const ogImage = post.src.startsWith('http') ? post.src : `${SITE_URL}${post.src}`;
  const description = post.excerpt.length > 160 ? post.excerpt.substring(0, 157) + '...' : post.excerpt;

  return {
    title: `${post.title} | Nexli Blog`,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: `${post.title} | Nexli Blog`,
      description,
      images: [{ url: ogImage }],
      ...(post.publishedAt ? { publishedTime: post.publishedAt, modifiedTime: post.publishedAt } : {}),
      ...(post.author ? { authors: [post.author] } : {}),
      section: post.category,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();

  return (
    <>
      <JsonLd
        data={[
          blogPostSchema(post),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog' },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        ]}
      />
      <BlogPost slug={slug} />
    </>
  );
}
