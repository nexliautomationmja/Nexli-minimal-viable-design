import type { Metadata } from 'next';
import { after } from 'next/server';
import { eq } from 'drizzle-orm';
import { requireDemoLead } from '@/lib/demo-session';
import { markDemoStage } from '@/lib/demo-stage';
import { getDb } from '@/lib/db';
import { leads } from '@/lib/leads-schema';
import { FOUNDATION_PRODUCT_NAME } from '@/lib/foundation-config';
import OfferPage from '@/components/demo/OfferPage';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: `${FOUNDATION_PRODUCT_NAME} — your website and client portal | Nexli`,
  description: 'The website and branded client portal for your firm, built, hosted and run for you.',
  robots: 'noindex, nofollow',
};

/**
 * Page 4B — the self-serve offer. Gated on the demo lead cookie: without it
 * requireDemoLead() redirects to /demo-opt-in.
 *
 * A lead on the agency path is NOT redirected away: a qualified firm may
 * still prefer to buy the infrastructure outright. They get an extra line
 * offering the call instead.
 */
export default async function DemoOfferPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const leadId = await requireDemoLead();

  // Arrival, not assignment. A qualified agency lead is allowed to land here
  // and buy the infrastructure outright, so this tag is deliberately not
  // 'web pitch' — that one belongs to the qualifier.
  after(() => markDemoStage(leadId, 'webPitch'));

  const params = await searchParams;
  const checkout = Array.isArray(params.checkout) ? params.checkout[0] : params.checkout;

  const db = getDb();
  const [lead] = db
    ? await db
        .select({
          firstName: leads.firstName,
          firmName: leads.firmName,
          funnelPath: leads.funnelPath,
        })
        .from(leads)
        .where(eq(leads.id, leadId))
        .limit(1)
    : [];

  return (
    <OfferPage
      firstName={(lead?.firstName || '').trim()}
      firmName={(lead?.firmName || '').trim()}
      qualifiedForCall={lead?.funnelPath === 'agency'}
      cancelled={checkout === 'cancelled'}
    />
  );
}
