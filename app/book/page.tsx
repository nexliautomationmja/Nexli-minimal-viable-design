// ---------------------------------------------------------------------------
// /book: now a redirect to the Better Clients VSL's booking section, the
// price with the calendar under it (Marcel, 2026-11-23).
//
// It is still the link in GHL's no-show and retargeting messages, so it has
// to keep working; it just sends them where booking happens now. Before
// this it was the qualified-firms-only calendar (2026-11-16): the calendar
// for a browser we recognised, and "use the email you qualified with" for
// anyone else. The VSL calendar asks nobody to qualify first, so none of
// that is needed. The query string goes along, so UTM tags on a GHL link
// still reach the page.
//
// Temporary (307), not permanent: where the button points may change again,
// and a browser caches a permanent redirect.
// ---------------------------------------------------------------------------
import { redirect } from 'next/navigation';
import { REBOOK_PATH } from '@/lib/advisory-config';

export const dynamic = 'force-dynamic';

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    for (const v of Array.isArray(value) ? value : value === undefined ? [] : [value]) query.append(key, v);
  }
  const [path, hash = ''] = REBOOK_PATH.split('#');
  const qs = query.toString();
  redirect(`${path}${qs ? `?${qs}` : ''}${hash ? `#${hash}` : ''}`);
}
