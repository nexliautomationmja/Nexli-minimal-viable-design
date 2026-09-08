import {
  ADDRESS,
  EMAIL,
  FOUNDER,
  FOUNDING_DATE,
  GUARANTEES,
  KNOWS_ABOUT,
  LEGAL_NAME,
  LOGO_URL,
  MIN_REVENUE,
  OG_IMAGE_URL,
  ORG_DESCRIPTION,
  ORG_ID,
  SAME_AS,
  SITE_NAME,
  SITE_URL,
  SYSTEM_COMPONENTS,
  TAGLINE,
  WEBSITE_ID,
} from './site';
import type { Guide } from '../data/guides/types';
import type { BlogPost } from '../data/blogPosts';

const CONTEXT = 'https://schema.org';

export const absoluteUrl = (path: string) =>
  path.startsWith('http') ? path : `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;

const wordCount = (chunks: string[]) =>
  chunks.reduce((n, text) => n + text.split(/\s+/).filter(Boolean).length, 0);

/** Person node without @context, for embedding inside other nodes. */
export function personNode() {
  return {
    '@type': 'Person',
    '@id': FOUNDER.id,
    name: FOUNDER.name,
    jobTitle: FOUNDER.jobTitle,
    image: FOUNDER.image,
    url: FOUNDER.url,
    worksFor: { '@id': ORG_ID },
    ...(FOUNDER.sameAs.length ? { sameAs: FOUNDER.sameAs } : {}),
  };
}

export function personSchema() {
  return { '@context': CONTEXT, ...personNode() };
}

/** Organization node without @context, for embedding as publisher/provider. */
export function organizationNode() {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE_NAME,
    alternateName: ['Nexli', LEGAL_NAME],
    legalName: LEGAL_NAME,
    url: SITE_URL,
    logo: { '@type': 'ImageObject', url: LOGO_URL },
    image: OG_IMAGE_URL,
    description: ORG_DESCRIPTION,
    slogan: TAGLINE,
    email: EMAIL,
    founder: personNode(),
    ...(FOUNDING_DATE ? { foundingDate: FOUNDING_DATE } : {}),
    ...(ADDRESS ? { address: { '@type': 'PostalAddress', ...ADDRESS } } : {}),
    areaServed: { '@type': 'Country', name: 'United States' },
    knowsAbout: KNOWS_ABOUT,
    sameAs: SAME_AS,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        email: EMAIL,
        availableLanguage: 'English',
      },
    ],
  };
}

export function organizationSchema() {
  return { '@context': CONTEXT, ...organizationNode() };
}

export function websiteSchema() {
  return {
    '@context': CONTEXT,
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    description: ORG_DESCRIPTION,
    publisher: { '@id': ORG_ID },
    inLanguage: 'en-US',
  };
}

export function serviceSchema() {
  return {
    '@context': CONTEXT,
    '@type': 'ProfessionalService',
    '@id': `${SITE_URL}/#service`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: LOGO_URL,
    image: OG_IMAGE_URL,
    description: `${ORG_DESCRIPTION} Guarantees: ${GUARANTEES.map((g) => g.description).join(' ')} Month-to-month, no annual contracts.`,
    provider: { '@id': ORG_ID },
    priceRange: '$$$',
    email: EMAIL,
    serviceType: [
      'CPA Firm Growth Agency',
      'CPA Firm Marketing',
      'Accounting Firm Lead Generation',
      'CPA Website Design',
      'AI Automation for Accounting Firms',
      'Google Review Management for CPAs',
      'Client Document Portal for Tax Professionals',
      'Paid Advertising for CPA Firms',
    ],
    audience: {
      '@type': 'BusinessAudience',
      name: `Established CPA and accounting firms with ${MIN_REVENUE} annual revenue`,
    },
    areaServed: { '@type': 'Country', name: 'United States' },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Digital Rainmaker System',
      itemListElement: SYSTEM_COMPONENTS.map((c) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: c.name,
          description: c.description,
          url: absoluteUrl(c.path),
        },
      })),
    },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    '@context': CONTEXT,
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

interface ArticleOptions {
  type?: 'Article' | 'BlogPosting';
  path: string;
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author?: { name: string; url?: string; isPerson?: boolean };
  section?: string;
  wordCount?: number;
  keywords?: string[];
}

export function articleSchema(opts: ArticleOptions) {
  const url = absoluteUrl(opts.path);
  const author = opts.author ?? { name: SITE_NAME, url: SITE_URL, isPerson: false };
  return {
    '@context': CONTEXT,
    '@type': opts.type ?? 'Article',
    headline: opts.headline,
    description: opts.description,
    image: opts.image ? absoluteUrl(opts.image) : OG_IMAGE_URL,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    datePublished: opts.datePublished,
    dateModified: opts.dateModified ?? opts.datePublished,
    author:
      author.isPerson && author.name === FOUNDER.name
        ? personNode()
        : {
            '@type': author.isPerson ? 'Person' : 'Organization',
            name: author.name,
            ...(author.url ? { url: author.url } : {}),
          },
    publisher: {
      '@type': 'Organization',
      '@id': ORG_ID,
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: LOGO_URL },
    },
    inLanguage: 'en-US',
    ...(opts.section ? { articleSection: opts.section } : {}),
    ...(opts.wordCount ? { wordCount: opts.wordCount } : {}),
    ...(opts.keywords?.length ? { keywords: opts.keywords.join(', ') } : {}),
  };
}

export function blogPostSchema(post: BlogPost) {
  return articleSchema({
    type: 'BlogPosting',
    path: `/blog/${post.slug}`,
    headline: post.title,
    description: post.excerpt,
    image: post.src,
    datePublished: post.publishedAt ?? '2026-02-06',
    author: post.author
      ? { name: post.author, url: `${SITE_URL}/about`, isPerson: true }
      : undefined,
    section: post.category,
    wordCount: wordCount([post.excerpt, ...post.sections.map((s) => s.content)]),
  });
}

export function guideSchema(guide: Guide) {
  const bodyText = [
    ...guide.tldr,
    ...guide.sections.flatMap((s) => [...s.body, ...(s.bullets ?? [])]),
    ...guide.faq.map((f) => f.answer),
  ];
  return articleSchema({
    type: 'Article',
    path: `/guides/${guide.slug}`,
    headline: guide.title,
    description: guide.description,
    datePublished: guide.publishedAt,
    dateModified: guide.updatedAt,
    author: { name: FOUNDER.name, url: FOUNDER.url, isPerson: true },
    section: guide.category,
    wordCount: wordCount(bodyText),
    keywords: [guide.question, guide.category, 'CPA firm growth'],
  });
}

export function collectionPageSchema(opts: {
  path: string;
  name: string;
  description: string;
  items: { name: string; path: string }[];
}) {
  return {
    '@context': CONTEXT,
    '@type': 'CollectionPage',
    url: absoluteUrl(opts.path),
    name: opts.name,
    description: opts.description,
    isPartOf: { '@id': WEBSITE_ID },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: opts.items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        url: absoluteUrl(item.path),
      })),
    },
  };
}

export function aboutPageSchema() {
  return {
    '@context': CONTEXT,
    '@type': 'AboutPage',
    url: `${SITE_URL}/about`,
    name: `About ${SITE_NAME}`,
    description: ORG_DESCRIPTION,
    isPartOf: { '@id': WEBSITE_ID },
    mainEntity: organizationNode(),
  };
}
