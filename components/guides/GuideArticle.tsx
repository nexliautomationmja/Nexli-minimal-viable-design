import Link from 'next/link';
import type { Guide, GuideSection, GuideTable } from '../../data/guides/types';
import { DEFAULT_GUIDE_CTA, getGuideBySlug } from '../../data/guides';
import { getBlogPostBySlug } from '../../data/blogPosts';
import { getAuthor } from '../../data/authors';
import { renderInline } from '../../lib/inline-markdown';
import AuthorCard from './AuthorCard';
import GuideCta from './GuideCta';
import GuideFaq from './GuideFaq';

export const formatGuideDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

function Table({ table }: { table: GuideTable }) {
  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-[var(--glass-border)]">
      <table className="w-full text-sm text-left">
        {table.caption && <caption className="sr-only">{table.caption}</caption>}
        <thead className="bg-[var(--glass-bg)] text-[var(--text-main)]">
          <tr>
            {table.headers.map((h) => (
              <th key={h} scope="col" className="px-4 py-3 font-bold whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--glass-border)] text-[var(--text-muted)]">
          {table.rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className={`px-4 py-3 align-top ${j === 0 ? 'font-semibold text-[var(--text-main)]' : ''}`}>
                  {renderInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Section({ section }: { section: GuideSection }) {
  return (
    <section id={section.id} aria-labelledby={`${section.id}-heading`} className="scroll-mt-32">
      <h2 id={`${section.id}-heading`} className="text-2xl md:text-3xl font-bold text-[var(--text-main)] mb-4">
        {section.heading}
      </h2>
      {section.body.map((paragraph, i) => (
        <p key={i} className="text-base md:text-lg text-[var(--text-muted)] leading-relaxed mb-4">
          {renderInline(paragraph)}
        </p>
      ))}
      {section.bullets && (
        <ul className="list-disc pl-6 space-y-2 text-base md:text-lg text-[var(--text-muted)] leading-relaxed">
          {section.bullets.map((b, i) => (
            <li key={i}>{renderInline(b)}</li>
          ))}
        </ul>
      )}
      {section.table && <Table table={section.table} />}
    </section>
  );
}

export default function GuideArticle({ guide }: { guide: Guide }) {
  const author = getAuthor(guide.author);
  const cta = guide.cta ?? DEFAULT_GUIDE_CTA;
  const relatedGuides = (guide.relatedGuides ?? [])
    .map(getGuideBySlug)
    .filter((g): g is Guide => Boolean(g) && g!.slug !== guide.slug);
  const relatedPosts = (guide.relatedPosts ?? [])
    .map(getBlogPostBySlug)
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <article className="max-w-3xl mx-auto px-6 pt-32 md:pt-40 pb-24">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-8">
        <Link href="/" className="hover:text-blue-500 no-underline">Home</Link>
        <span aria-hidden>/</span>
        <Link href="/guides" className="hover:text-blue-500 no-underline">Guides</Link>
        <span aria-hidden>/</span>
        <span className="text-[var(--text-main)]">{guide.category}</span>
      </nav>

      <header>
        <p className="text-blue-500 text-sm font-bold uppercase tracking-widest mb-4">{guide.question}</p>
        <h1 className="text-3xl md:text-5xl font-bold leading-tight text-[var(--text-main)] mb-6">{guide.title}</h1>
        <p className="text-sm text-[var(--text-muted)] mb-10">
          By{' '}
          <Link href={author.url} className="text-[var(--text-main)] font-semibold hover:text-blue-500 no-underline">
            {author.name}
          </Link>
          , {author.role}.{' '}
          <time dateTime={guide.updatedAt}>Updated {formatGuideDate(guide.updatedAt)}</time>.
        </p>
      </header>

      <section aria-labelledby="quick-answer" className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-6 md:p-8 mb-12">
        <h2 id="quick-answer" className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-3">
          Quick answer
        </h2>
        {guide.tldr.map((sentence, i) => (
          <p key={i} className="text-base md:text-lg text-[var(--text-main)] leading-relaxed mb-2 last:mb-0">
            {renderInline(sentence)}
          </p>
        ))}
      </section>

      {guide.stats && guide.stats.length > 0 && (
        <section aria-label="Key statistics" className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {guide.stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5">
              <p className="text-2xl md:text-3xl font-black text-[var(--text-main)]">{stat.value}</p>
              <p className="text-sm text-[var(--text-muted)] mt-1 leading-snug">{stat.label}</p>
              <cite className="block not-italic text-xs text-[var(--text-muted)] mt-3">
                Source:{' '}
                <a href={stat.source.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-500">
                  {stat.source.name}
                  {stat.source.year ? ` (${stat.source.year})` : ''}
                </a>
              </cite>
            </div>
          ))}
        </section>
      )}

      <nav aria-label="Table of contents" className="mb-12 rounded-2xl border border-[var(--glass-border)] p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3">In this guide</p>
        <ol className="list-decimal pl-5 space-y-1.5 text-sm md:text-base">
          {guide.sections.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="text-[var(--text-main)] hover:text-blue-500 no-underline">
                {s.heading}
              </a>
            </li>
          ))}
          <li>
            <a href="#faq" className="text-[var(--text-main)] hover:text-blue-500 no-underline">
              Frequently asked questions
            </a>
          </li>
        </ol>
      </nav>

      <div className="space-y-12">
        {guide.sections.map((section) => (
          <Section key={section.id} section={section} />
        ))}
      </div>

      <GuideFaq items={guide.faq} />
      <AuthorCard author={author} />
      <GuideCta {...cta} />

      {(relatedGuides.length > 0 || relatedPosts.length > 0) && (
        <section aria-labelledby="related-heading" className="mt-16">
          <h2 id="related-heading" className="text-xl md:text-2xl font-bold text-[var(--text-main)] mb-6">
            Keep reading
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relatedGuides.map((g) => (
              <li key={g.slug}>
                <Link
                  href={`/guides/${g.slug}`}
                  className="block h-full p-5 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-blue-500/40 transition-colors no-underline"
                >
                  <span className="block text-xs font-bold uppercase tracking-widest text-blue-500 mb-2">Guide</span>
                  <span className="block font-semibold text-[var(--text-main)]">{g.title}</span>
                </Link>
              </li>
            ))}
            {relatedPosts.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/blog/${p.slug}`}
                  className="block h-full p-5 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-blue-500/40 transition-colors no-underline"
                >
                  <span className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Blog</span>
                  <span className="block font-semibold text-[var(--text-main)]">{p.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
