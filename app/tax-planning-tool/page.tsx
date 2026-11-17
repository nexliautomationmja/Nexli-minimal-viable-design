// ---------------------------------------------------------------------------
// /tax-planning-tool — a sales tool for accounting firms.
//
// A firm opens it bare, puts in its name and planning fee, and copies its
// own link. A prospect on that link answers a few questions and sees their
// estimated tax liability next to the firm's fee: "pay the IRS this, or pay
// us a fraction of it". Marcel, 2026-11-17.
//
// UNLISTED, like /math: noindexed here, disallowed in app/robots.ts, out of
// the sitemap. The tax figures want a CPA's review before the tool is put
// in front of search (docs/advisory-calculator-build-brief.md, "Before you
// ship").
//
// Dynamic, because the firm in the link is read here: its name is in the
// HTML and the tab title from the first byte, with no flash of "Your firm".
// The prospect's answers never come near the server; see
// lib/tax-planning/firm.ts for why.
//
// The site navbar and footer are suppressed for it in ConditionalNavbar and
// Footer. The Meta pixel's PageView is skipped on a firm's link (app/layout
// .tsx): a prospect of some other firm isn't Nexli's audience.
// ---------------------------------------------------------------------------
import type { Metadata, Viewport } from 'next';
import { currentTaxYear } from '@/lib/tax-year-deadline';
import { parseFirm } from '@/lib/tax-planning/firm';
import TaxTool from './tool-client';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const dynamic = 'force-dynamic';

const DESCRIPTION =
  'Estimate your tax bill next to what planning costs, and see where planning goes to work.';

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { firm, setup } = parseFirm(await searchParams);
  const title = setup ? 'Tax Planning Tool' : `${firm.name} · Tax Planning Estimate`;
  return {
    title,
    description: DESCRIPTION,
    robots: 'noindex, nofollow',
    // A firm's link is the firm's: no Nexli card when it's texted or emailed.
    openGraph: { title, description: DESCRIPTION },
    twitter: { card: 'summary', title, description: DESCRIPTION },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#020617',
};

export default async function TaxPlanningToolPage({ searchParams }: { searchParams: SearchParams }) {
  const { firm, setup } = parseFirm(await searchParams);
  return <TaxTool initialFirm={firm} setup={setup} year={currentTaxYear()} />;
}
