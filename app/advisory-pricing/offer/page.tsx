// ---------------------------------------------------------------------------
// Advisory funnel — the $297 Accelerator. The DOWNSELL, not the main path.
//
// A firm reaches this page one of two ways:
//
//   from the qualifier, having missed the bar for the done-for-you engine.
//   funnel_path is then 'not-a-fit', and the page opens by naming the reason
//   before it sells anything.
//
//   from a nurture email, having opted in and never finished the qualifier.
//   No reason to name, so it reads as a straight sales page.
//
// Gated on the opt-in cookie: no cookie, no page.
// ---------------------------------------------------------------------------
import type { Metadata } from 'next';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import FunnelLogo from '@/components/FunnelLogo';
import { getDb } from '@/lib/db';
import { leads } from '@/lib/leads-schema';
import { requireAdvisoryLead } from '@/lib/advisory-session';
import { reasonFor } from '@/lib/advisory-fit';
import { ADVISORY_PRODUCT_NAME, ADVISORY_THANK_YOU_PATH } from '@/lib/advisory-config';
import { CANVAS } from '@/components/funnel/primitives';
import AdvisoryOfferClient from './offer-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: `${ADVISORY_PRODUCT_NAME} | Nexli`,
  description: 'Price advisory engagements off the value you create, not off what you charged last year.',
  robots: 'noindex, nofollow',
};

export default async function AdvisoryOfferPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const leadId = await requireAdvisoryLead();

  const params = await searchParams;
  const checkout = Array.isArray(params.checkout) ? params.checkout[0] : params.checkout;

  const db = getDb();
  const [lead] = db
    ? await db
        .select({
          firstName: leads.firstName,
          advisoryPurchasedAt: leads.advisoryPurchasedAt,
          funnelPath: leads.funnelPath,
          usBased: leads.usBased,
          decisionRole: leads.decisionRole,
          annualRevenue: leads.annualRevenue,
        })
        .from(leads)
        .where(eq(leads.id, leadId))
        .limit(1)
    : [];

  // Already bought it — send them to what they paid for rather than selling
  // it to them again.
  if (lead?.advisoryPurchasedAt) redirect(ADVISORY_THANK_YOU_PATH);

  // Only when the qualifier actually said so. Someone who arrives from an
  // email without having answered gets the plain sales page, not a rejection
  // for a verdict nobody reached.
  const notAFit = lead?.funnelPath === 'not-a-fit' ? reasonFor(lead) : null;

  // The client owns <main> and the ambient glow so it can run the benchmark's
  // section rhythm; this is just the canvas. Note there is no overflow-hidden:
  // the old wrapper only had it to contain a blur blob, and an overflow
  // ancestor combined with globals.css's scroll-behavior: smooth breaks
  // anchor scrolling.
  return (
    <div className="relative min-h-screen" style={{ backgroundColor: CANVAS }}>
      <FunnelLogo />
      <AdvisoryOfferClient
        firstName={(lead?.firstName || '').trim()}
        cancelled={checkout === 'cancelled'}
        notAFit={notAFit}
      />
    </div>
  );
}
