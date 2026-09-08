import Link from 'next/link';
import type { ReactNode } from 'react';

const TOKEN = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g;
const LINK = /^\[([^\]]+)\]\(([^)\s]+)\)$/;

const linkClass = 'text-blue-500 underline decoration-blue-500/40 underline-offset-4 hover:decoration-blue-500';

/**
 * Renders the minimal inline markdown allowed in guide and about copy:
 * **bold** and [text](url). Internal links use next/link; external links
 * open in a new tab. Anything else is emitted as plain text.
 */
export function renderInline(text: string): ReactNode[] {
  return text.split(TOKEN).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={i} className="font-semibold text-[var(--text-main)]">{part.slice(2, -2)}</strong>;
    }
    const match = part.match(LINK);
    if (match) {
      const [, label, href] = match;
      if (href.startsWith('/')) {
        return (
          <Link key={i} href={href} className={linkClass}>
            {label}
          </Link>
        );
      }
      return (
        <a key={i} href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
          {label}
        </a>
      );
    }
    return part;
  });
}
