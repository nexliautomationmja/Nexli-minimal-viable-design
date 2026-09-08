import type { Metadata } from 'next';
import Link from 'next/link';
import { guides } from '../../data/guides';
import { formatGuideDate } from '../../components/guides/GuideArticle';
import JsonLd from '../../components/JsonLd';
import { breadcrumbSchema, collectionPageSchema } from '../../lib/schema';

const TITLE = 'CPA Firm Growth Guides | How to Get Advisory Clients, Scale, and Market Your Firm | Nexli';
const DESCRIPTION =
  'Direct answers to the questions CPA firm owners ask about growth: getting advisory clients, lead generation, marketing budgets, scaling without hiring, and choosing an agency.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/guides' },
  openGraph: { title: TITLE, description: DESCRIPTION, type: 'website' },
};

export default function GuidesIndexPage() {
  return (
    <>
      <JsonLd
        data={[
          collectionPageSchema({
            path: '/guides',
            name: 'CPA Firm Growth Guides',
            description: DESCRIPTION,
            items: guides.map((g) => ({ name: g.title, path: `/guides/${g.slug}` })),
          }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Guides', path: '/guides' },
          ]),
        ]}
      />
      <div className="max-w-5xl mx-auto px-6 pt-32 md:pt-40 pb-24">
        <header className="max-w-3xl mb-14">
          <p className="text-blue-500 text-sm font-bold uppercase tracking-widest mb-4">Guides</p>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight text-[var(--text-main)] mb-5">
            Straight answers on growing a CPA firm
          </h1>
          <p className="text-base md:text-lg text-[var(--text-muted)] leading-relaxed">
            Each guide answers one question CPA firm owners ask, with the short answer first, sourced numbers, and the
            steps that work. Written by Marcel Allen, founder of Nexli Automation, a CPA firm growth agency.
          </p>
        </header>

        <ol className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {guides.map((guide) => (
            <li key={guide.slug}>
              <Link
                href={`/guides/${guide.slug}`}
                className="group flex flex-col h-full p-6 md:p-8 rounded-3xl border border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-blue-500/40 transition-colors no-underline"
              >
                <span className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-3">{guide.category}</span>
                <span className="text-xl md:text-2xl font-bold text-[var(--text-main)] leading-snug mb-3 group-hover:text-blue-500 transition-colors">
                  {guide.title}
                </span>
                <span className="text-sm md:text-base text-[var(--text-muted)] leading-relaxed mb-4">{guide.tldr[0]}</span>
                <span className="mt-auto text-xs text-[var(--text-muted)]">Updated {formatGuideDate(guide.updatedAt)}</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
