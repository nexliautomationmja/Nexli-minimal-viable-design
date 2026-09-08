import Link from 'next/link';
import { aboutFacts, aboutIntro, aboutSections, founderBio } from '../data/about';
import { getAuthor } from '../data/authors';
import { guides } from '../data/guides';
import { PORTFOLIO_META } from '../lib/portfolio-meta';
import { EMAIL, GUARANTEES, SOCIAL, SYSTEM_COMPONENTS } from '../lib/site';
import { renderInline } from '../lib/inline-markdown';

const cardClass = 'rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6';

export default function About() {
  const founder = getAuthor('marcel-allen');

  return (
    <div className="max-w-3xl mx-auto px-6 pt-32 md:pt-40 pb-24">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-8">
        <Link href="/" className="hover:text-blue-500 no-underline">Home</Link>
        <span aria-hidden>/</span>
        <span className="text-[var(--text-main)]">About</span>
      </nav>

      <header className="mb-12">
        <p className="text-blue-500 text-sm font-bold uppercase tracking-widest mb-4">About</p>
        <h1 className="text-3xl md:text-5xl font-bold leading-tight text-[var(--text-main)] mb-6">About Nexli Automation</h1>
        <p className="text-lg md:text-xl text-[var(--text-main)] leading-relaxed">{renderInline(aboutIntro)}</p>
      </header>

      <section aria-labelledby="facts-heading" className={`${cardClass} mb-12`}>
        <h2 id="facts-heading" className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4">
          Company facts
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          {/* Facts still marked TODO in data/about.ts are hidden until filled in. */}
          {aboutFacts.filter((fact) => !fact.value.startsWith('TODO')).map((fact) => (
            <div key={fact.label}>
              <dt className="text-sm text-[var(--text-muted)]">{fact.label}</dt>
              <dd className="text-base font-semibold text-[var(--text-main)]">{renderInline(fact.value)}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="marcel-allen" aria-labelledby="founder-heading" className="mb-12 scroll-mt-32">
        <h2 id="founder-heading" className="text-2xl md:text-3xl font-bold text-[var(--text-main)] mb-6">
          Founder
        </h2>
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <img
            src={founder.image}
            alt={founder.name}
            width={120}
            height={120}
            className="rounded-2xl object-cover flex-shrink-0"
            style={{ width: 120, height: 120 }}
          />
          <div>
            <p className="text-xl font-bold text-[var(--text-main)]">{founder.name}</p>
            <p className="text-sm text-blue-500 font-semibold mb-4">{founder.role}</p>
            {founderBio.map((p, i) => (
              <p key={i} className="text-base text-[var(--text-muted)] leading-relaxed mb-3">
                {renderInline(p)}
              </p>
            ))}
          </div>
        </div>
      </section>

      <div className="space-y-12">
        {aboutSections.map((section) => (
          <section key={section.id} id={section.id} aria-labelledby={`${section.id}-heading`} className="scroll-mt-32">
            <h2 id={`${section.id}-heading`} className="text-2xl md:text-3xl font-bold text-[var(--text-main)] mb-4">
              {section.heading}
            </h2>
            {section.body.map((p, i) => (
              <p key={i} className="text-base md:text-lg text-[var(--text-muted)] leading-relaxed mb-4">
                {renderInline(p)}
              </p>
            ))}
            {section.bullets && (
              <ul className="list-disc pl-6 space-y-2 text-base md:text-lg text-[var(--text-muted)] leading-relaxed">
                {section.bullets.map((b, i) => (
                  <li key={i}>{renderInline(b)}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <section aria-labelledby="system-heading">
          <h2 id="system-heading" className="text-2xl md:text-3xl font-bold text-[var(--text-main)] mb-4">
            The Digital Rainmaker System
          </h2>
          <p className="text-base md:text-lg text-[var(--text-muted)] leading-relaxed mb-6">
            Four parts, built and integrated for each firm, with paid ads run to it.{' '}
            <Link href="/guides/what-is-the-digital-rainmaker-system" className="text-blue-500 underline underline-offset-4">
              Read the full explainer
            </Link>
            .
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SYSTEM_COMPONENTS.map((c) => (
              <li key={c.name} className={cardClass}>
                <Link href={c.path} className="font-bold text-[var(--text-main)] hover:text-blue-500 no-underline">
                  {c.name}
                </Link>
                <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed">{c.description}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="guarantees-heading">
          <h2 id="guarantees-heading" className="text-2xl md:text-3xl font-bold text-[var(--text-main)] mb-4">
            Guarantees
          </h2>
          <ul className="space-y-4">
            {GUARANTEES.map((g) => (
              <li key={g.name} className={cardClass}>
                <p className="font-bold text-[var(--text-main)]">{g.name}</p>
                <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed">{g.description}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="work-heading">
          <h2 id="work-heading" className="text-2xl md:text-3xl font-bold text-[var(--text-main)] mb-4">
            Work
          </h2>
          <ul className="flex flex-wrap gap-3">
            {Object.entries(PORTFOLIO_META).map(([slug, meta]) => (
              <li key={slug}>
                <Link
                  href={`/portfolio/${slug}`}
                  className="inline-block px-4 py-2 rounded-full border border-[var(--glass-border)] text-sm font-semibold text-[var(--text-main)] hover:border-blue-500/50 no-underline"
                >
                  {meta.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="guides-heading">
          <h2 id="guides-heading" className="text-2xl md:text-3xl font-bold text-[var(--text-main)] mb-4">
            Guides we publish
          </h2>
          <ul className="space-y-2">
            {guides.map((g) => (
              <li key={g.slug}>
                <Link href={`/guides/${g.slug}`} className="text-[var(--text-main)] hover:text-blue-500 underline underline-offset-4 decoration-[var(--glass-border)]">
                  {g.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="connect-heading">
          <h2 id="connect-heading" className="text-2xl md:text-3xl font-bold text-[var(--text-main)] mb-4">
            Contact and profiles
          </h2>
          <ul className="space-y-2 text-base text-[var(--text-muted)]">
            <li>
              Email:{' '}
              <a href={`mailto:${EMAIL}`} className="text-blue-500 underline underline-offset-4">
                {EMAIL}
              </a>
            </li>
            <li>
              Instagram:{' '}
              <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer me" className="text-blue-500 underline underline-offset-4">
                @nexliautomation
              </a>
            </li>
            <li>
              Facebook:{' '}
              <a href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer me" className="text-blue-500 underline underline-offset-4">
                Nexli Automation
              </a>
            </li>
            <li>
              X:{' '}
              <a href={SOCIAL.x} target="_blank" rel="noopener noreferrer me" className="text-blue-500 underline underline-offset-4">
                @nexliautomation
              </a>
            </li>
            <li>
              Strategy call:{' '}
              <Link href="/vslfunnel-advisory" className="text-blue-500 underline underline-offset-4">
                watch the presentation and apply
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
