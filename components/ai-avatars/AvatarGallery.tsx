'use client';

// ---------------------------------------------------------------------------
// An avatar's gallery: a grid of every image, and a lightbox over it.
//
// Marcel sends a batch of images per avatar, so this has to stay usable at
// thirty or forty: a plain grid, lazy images, and a full-screen viewer with
// previous / next, Esc to close and the arrow keys.
// ---------------------------------------------------------------------------
import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ImageIcon, X } from 'lucide-react';

export default function AvatarGallery({ images, name }: { images: string[]; name: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const total = images.length;

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (by: number) => setOpen((i) => (i === null ? i : (i + by + total) % total)),
    [total],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, close, step]);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-[var(--glass-border)] bg-[var(--glass-bg)] px-6 py-16 text-center">
        <ImageIcon size={32} className="text-[var(--text-muted)] opacity-50" aria-hidden="true" />
        <p className="text-sm font-semibold text-[var(--text-muted)]">Images in production</p>
      </div>
    );
  }

  return (
    <>
      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 list-none p-0">
        {images.map((src, i) => (
          <li key={src}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="relative block w-full aspect-[4/5] overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] transition-transform duration-300 hover:-translate-y-0.5"
              aria-label={`Open image ${i + 1} of ${total}`}
            >
              <Image
                src={src}
                alt={`${name}, an AI-generated avatar, image ${i + 1}`}
                fill
                sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 46vw"
                className="object-cover object-top"
              />
            </button>
          </li>
        ))}
      </ul>

      {open !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${name}, image ${open + 1} of ${total}`}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={close}
        >
          <div className="relative h-[82vh] w-[92vw] max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[open]}
              alt={`${name}, an AI-generated avatar, image ${open + 1}`}
              fill
              sizes="92vw"
              className="object-contain"
              priority
            />
          </div>

          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20"
          >
            <X size={22} />
          </button>
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                aria-label="Previous image"
                className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                aria-label="Next image"
                className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs font-semibold text-white/70">
            {open + 1} / {total}
          </p>
        </div>
      )}
    </>
  );
}
