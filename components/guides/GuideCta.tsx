'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useBooking } from '../QualificationProvider';

interface Props {
  heading: string;
  body: string;
  href: string;
  label: string;
}

export default function GuideCta({ heading, body, href, label }: Props) {
  const { openBooking } = useBooking();

  return (
    <aside className="mt-16 p-8 md:p-12 rounded-3xl bg-[var(--glass-bg)] border border-[var(--glass-border)] text-center">
      <h2 className="text-xl md:text-2xl font-bold text-[var(--text-main)] mb-4">{heading}</h2>
      <p className="text-[var(--text-muted)] mb-8 max-w-xl mx-auto leading-relaxed">{body}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href={href}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-500 hover:scale-105 transition-all shadow-lg shadow-blue-600/25 no-underline"
        >
          {label}
          <ArrowRight size={18} />
        </Link>
        <button
          type="button"
          onClick={openBooking}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold border border-[var(--glass-border)] text-[var(--text-main)] hover:border-blue-500/50 transition-all"
        >
          See if your firm qualifies
        </button>
      </div>
      <p className="mt-6 text-xs text-[var(--text-muted)]">
        Established CPA firms doing $500K+ a year (about $40K-$50K a month) only. Month-to-month, no annual contracts.
      </p>
    </aside>
  );
}
