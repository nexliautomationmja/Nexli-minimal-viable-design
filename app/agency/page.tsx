// ---------------------------------------------------------------------------
// Advisory funnel, page 1 — /agency. THE VSL.
//
// Goes after "I hired an agency and got trash leads". The turn is that the
// agency did deliver what it sold: the failure was lead QUALITY, which
// nobody was measuring, not lead count.
//
// There is no opt-in any more. The ad lands here, the video does the selling,
// and every button scrolls to the price and the calendar further down this
// same page (Marcel, 2026-11-19). Cal's booking form is where contact
// details are collected now; the five-step qualifier is no longer in the
// path, because firms that could afford the work were falling out of it.
//
// LIVED AT /advisory-pricing UNTIL 4 NOVEMBER 2026. The old URL 301s here
// (next.config.ts) because it is in live ads and in sent email, and the
// funnel's inner steps deliberately stayed put — /advisory-pricing/qualify,
// /call and /next-steps are shared by all four angles, so moving them would
// have renamed a path that is not this page's to rename.
//
// Public and indexable on purpose: this is the ad destination, and the only
// one of the four angles that is indexed. Everything after it is noindex.
// ---------------------------------------------------------------------------
import type { Metadata } from 'next';
import { socialMeta } from '@/lib/seo';
import { VSL_ANGLE_AGENCY } from '@/lib/advisory-config';
import AgencyVslClient from './agency-client';

const TITLE = 'Why the $15,000 client never calls your firm | Nexli';
const DESCRIPTION =
  'A short video on what established CPA firms put in place before they spend a dollar on ads — and why the firms that skip it burn the budget finding out.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  robots: { index: true, follow: true },
  alternates: { canonical: '/agency' },
  ...socialMeta({ title: TITLE, description: DESCRIPTION, path: '/agency' }),
};

export default function AgencyVslPage() {
  // The angle rides on every booking from this page's calendar (Cal
  // metadata), so the contact arrives in GoHighLevel tagged agencyVSL. The
  // buttons used to link to the qualifier; since 2026-11-19 they scroll to
  // the pricing and calendar on this page.
  return <AgencyVslClient angle={VSL_ANGLE_AGENCY} />;
}
