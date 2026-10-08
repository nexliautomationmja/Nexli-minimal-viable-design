// ---------------------------------------------------------------------------
// Advisory funnel, page 2 — the VSL. The main path.
//
// Same component and same video as the public /vslfunnel-betterclients page,
// with one difference that matters: ctaHref. On the public page every CTA
// opens the QualificationProvider modal, which posts to /api/forms/qualification
// and, for a firm that does not clear the bar, simply declines to open the
// calendar — no lead row, no funnelPath, no GoHighLevel tag, no downsell.
//
// Here the CTAs link to this funnel's own qualifier page instead, which does
// all four and routes a firm that is not a fit to the $297 Accelerator.
//
// Gated on the opt-in cookie only. There is deliberately no purchase check:
// the $297 is the downsell now, not the toll for reaching the calendar.
// ---------------------------------------------------------------------------
import type { Metadata } from 'next';
import { requireAdvisoryLead } from '@/lib/advisory-session';
import { ADVISORY_QUALIFY_PATH } from '@/lib/advisory-config';
import AdvisoryVslClient from './advisory-vsl-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Why CPA firms that run ads without this system waste every dollar | Nexli',
  robots: 'noindex, nofollow',
};

export default async function AdvisoryVslPage() {
  // Redirects to /advisory-pricing when there is no cookie. The visitor
  // identifies themselves again in one field rather than hitting an error.
  await requireAdvisoryLead();

  return <AdvisoryVslClient ctaHref={ADVISORY_QUALIFY_PATH} />;
}
