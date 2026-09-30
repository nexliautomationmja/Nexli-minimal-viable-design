import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import FirmSitePage from '../../../components/firm-site/FirmSitePage';
import PreviewBanner from '../../../components/firm-site/PreviewBanner';
import { buildFirmSiteMetadata, NOT_FOUND_METADATA } from '../../../lib/firm-sites/metadata';
import { resolveFirmSite } from '../../../lib/firm-sites/resolve';

/**
 * /sites/<slug> — a Firm Foundation site by slug.
 *
 * Resolved at request time from the `firm_sites` table (published rows, or
 * any row when `?preview=<token>` matches its preview token), falling back
 * to the static registry. Dynamic so a publish in the dashboard is live
 * immediately with no deploy.
 */
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string | string[] }>;
}

async function resolveFromProps({ params, searchParams }: Props) {
  const { slug } = await params;
  // "host" is the sibling route segment (/sites/host/<host>), never a slug.
  if (slug === 'host') return null;
  const { preview } = await searchParams;
  const previewToken = typeof preview === 'string' && preview ? preview : undefined;
  return resolveFirmSite({ slug, previewToken });
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const site = await resolveFromProps(props);
  if (!site) return NOT_FOUND_METADATA;
  const host = (await headers()).get('host');
  return buildFirmSiteMetadata(site.cfg, host, { noindex: site.isPreview });
}

export default async function SitePage(props: Props) {
  const site = await resolveFromProps(props);
  if (!site) notFound();

  return (
    <>
      {site.isPreview && <PreviewBanner />}
      <FirmSitePage cfg={site.cfg} />
    </>
  );
}
