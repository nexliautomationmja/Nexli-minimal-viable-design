import type { GuideFaq as GuideFaqItem } from '../../data/guides/types';
import { renderInline } from '../../lib/inline-markdown';

/**
 * Native <details> so every answer is present in the initial HTML for
 * crawlers, while still collapsing for readers.
 */
export default function GuideFaq({ items }: { items: GuideFaqItem[] }) {
  if (!items.length) return null;
  return (
    <section id="faq" aria-labelledby="faq-heading" className="mt-16">
      <h2 id="faq-heading" className="text-2xl md:text-3xl font-bold text-[var(--text-main)] mb-6">
        Frequently asked questions
      </h2>
      <div className="divide-y divide-[var(--glass-border)] border-y border-[var(--glass-border)]">
        {items.map((item) => (
          <details key={item.question} className="group py-4">
            <summary className="cursor-pointer list-none flex items-start justify-between gap-4 text-base md:text-lg font-semibold text-[var(--text-main)]">
              <span>{item.question}</span>
              <span aria-hidden className="text-blue-500 transition-transform group-open:rotate-45 flex-shrink-0">+</span>
            </summary>
            <p className="mt-3 text-[var(--text-muted)] leading-relaxed">{renderInline(item.answer)}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
