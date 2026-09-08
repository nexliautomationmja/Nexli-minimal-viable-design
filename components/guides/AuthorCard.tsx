import Link from 'next/link';
import type { Author } from '../../data/authors';

export default function AuthorCard({ author }: { author: Author }) {
  return (
    <section
      aria-label="About the author"
      className="mt-16 flex flex-col sm:flex-row gap-5 items-start p-6 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)]"
    >
      <img
        src={author.image}
        alt={author.name}
        width={72}
        height={72}
        loading="lazy"
        className="w-18 h-18 rounded-full object-cover flex-shrink-0"
        style={{ width: 72, height: 72 }}
      />
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Written by</p>
        <p className="text-lg font-bold text-[var(--text-main)]">
          <Link href={author.url} className="hover:text-blue-500 no-underline">
            {author.name}
          </Link>
        </p>
        <p className="text-sm text-blue-500 font-semibold mb-3">{author.role}</p>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">{author.bio}</p>
      </div>
    </section>
  );
}
