import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import FirmSitePage from '../../../../components/firm-site/FirmSitePage';
import { buildFirmSiteMetadata, NOT_FOUND_METADATA } from '../../../../lib/firm-sites/metadata';
import { resolveFirmSite } from '../../../../lib/firm-sites/resolve';

/**
 * /sites/host/<host> — a Firm Foundation site by custom domain.
 *
 * middleware.ts rewrites every request whose host is not one of ours here,
 * so the browser URL stays on the firm's domain. The domain is looked up in
 * the `firm_sites` table at request time (published rows only; previews are
 * slug-based at /sites/<slug>?preview=...), falling back to the static
 * registry. Unknown hosts 404.
 */
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ host: string }>;
}

async function hostFromProps({ params }: Props): Promise<string> {
  const { host } = await params;
  try {
    return decodeURIComponent(host);
  } catch {
    return host;
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const host = await hostFromProps(props);
  const site = await resolveFirmSite({ host });
  if (!site) return NOT_FOUND_METADATA;
  return buildFirmSiteMetadata(site.cfg, host);
}

export default async function HostSitePage(props: Props) {
  const host = await hostFromProps(props);
  const site = await resolveFirmSite({ host });
  if (!site) notFound();

  return <FirmSitePage cfg={site.cfg} />;
}
