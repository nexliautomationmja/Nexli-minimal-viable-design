// ---------------------------------------------------------------------------
// Finds each avatar's images on disk, so adding them needs no code change.
//
// Drop files into public/ai-avatars/<slug>/ and they appear: on the card,
// on the avatar's own page and in its gallery. A file named portrait.* is
// the card image; otherwise the first file in natural order is (01, 02 …
// 10, not 1, 10, 2).
//
// SERVER ONLY. It reads the filesystem. The pages that call it are
// force-static, so in production it runs once at build time, when public/
// is on disk; in dev it runs on every request, so new files show on reload.
// Never import it from a client component.
// ---------------------------------------------------------------------------
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(process.cwd(), 'public', 'ai-avatars');
const IMAGE = /\.(webp|avif|jpe?g|png)$/i;
const naturally = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });

export interface AvatarImages {
  /** Card image, or null when the folder is empty or missing. */
  portrait: string | null;
  /** Every image, portrait first, as public URLs. */
  all: string[];
}

export function avatarImages(slug: string): AvatarImages {
  // The slug comes from our own data, but it still ends up in a path.
  if (!/^[a-z0-9-]+$/.test(slug)) return { portrait: null, all: [] };

  let files: string[] = [];
  try {
    files = fs
      .readdirSync(path.join(ROOT, slug))
      .filter((f) => IMAGE.test(f) && !f.startsWith('.'))
      .sort(naturally.compare);
  } catch {
    return { portrait: null, all: [] };
  }

  const portraitFile = files.find((f) => /^portrait\./i.test(f)) ?? files[0];
  if (!portraitFile) return { portrait: null, all: [] };

  const ordered = [portraitFile, ...files.filter((f) => f !== portraitFile)];
  const url = (f: string) => `/ai-avatars/${slug}/${encodeURIComponent(f)}`;
  return { portrait: url(portraitFile), all: ordered.map(url) };
}
