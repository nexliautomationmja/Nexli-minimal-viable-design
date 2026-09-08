export interface GuideSource {
  name: string;
  url: string;
  year?: number;
}

export interface GuideStat {
  value: string;
  label: string;
  source: GuideSource;
}

export interface GuideFaq {
  question: string;
  answer: string;
}

export interface GuideTable {
  caption?: string;
  headers: string[];
  rows: string[][];
}

export interface GuideSection {
  /** Anchor id, kebab-case, unique within the guide. */
  id: string;
  heading: string;
  /**
   * Paragraphs of plain text. Minimal inline markdown is supported:
   * **bold** and [link text](https://... or /internal/path).
   */
  body: string[];
  bullets?: string[];
  table?: GuideTable;
}

export type GuideCategory = 'Growth' | 'Marketing' | 'Operations' | 'Comparison' | 'Product';

export interface GuideCta {
  heading: string;
  body: string;
  href: string;
  label: string;
}

export interface Guide {
  slug: string;
  /** H1. */
  title: string;
  /** <title> tag override; defaults to `${title} | Nexli`. */
  metaTitle?: string;
  /** Meta description, 140-160 chars. */
  description: string;
  /** The exact question this page answers, shown as an eyebrow above the H1. */
  question: string;
  /** 3-5 sentences. The first sentence must answer `question` directly. Rendered first as a "Quick answer" card. */
  tldr: string[];
  /** ISO date YYYY-MM-DD. */
  publishedAt: string;
  updatedAt: string;
  author: 'marcel-allen';
  category: GuideCategory;
  /** Sourced numbers rendered as a stats strip with citations. */
  stats?: GuideStat[];
  sections: GuideSection[];
  faq: GuideFaq[];
  /** Slugs of other guides. */
  relatedGuides?: string[];
  /** Slugs of blog posts in data/blogPosts.ts. */
  relatedPosts?: string[];
  /** Defaults to the advisory VSL CTA when omitted. */
  cta?: GuideCta;
}
