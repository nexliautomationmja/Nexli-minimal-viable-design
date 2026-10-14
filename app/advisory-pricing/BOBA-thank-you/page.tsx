// ---------------------------------------------------------------------------
// Advisory funnel, page 3 — delivery, then the pitch for the agency offer.
//
// Two ways in, by design:
//   1. straight from Stripe with ?session_id= — verified, then the purchase is
//      recorded and a cookie minted, so the page works on a device that has
//      none (the GHL delivery email is routinely opened on a phone);
//   2. a returning buyer with the cookie and no session id.
// ---------------------------------------------------------------------------
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import FunnelLogo from '@/components/FunnelLogo';
import { getDb } from '@/lib/db';
import { leads } from '@/lib/leads-schema';
import {
  isCheckoutSessionId,
  isPaidAdvisorySession,
  retrieveCheckoutSession,
} from '@/lib/stripe';
import { DEMO_COOKIE, createDemoToken, demoCookieOptions, readDemoLead } from '@/lib/demo-session';
import { loadAdvisoryBuyer } from '@/lib/advisory-session';
import { recordAdvisoryPurchase } from '@/lib/advisory-purchase';
import {
  ADVISORY_CURRENCY,
  ADVISORY_NEXT_STEPS_PATH,
  ADVISORY_OFFER_PATH,
  ADVISORY_PATH,
  ADVISORY_PRICE_VALUE,
  ADVISORY_THANK_YOU_PATH,
} from '@/lib/advisory-config';
import AdvisoryThankYouClient from './thank-you-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Your guide is ready | Nexli',
  robots: 'noindex, nofollow',
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function AdvisoryThankYouPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const sessionId = Array.isArray(params.session_id) ? params.session_id[0] : params.session_id;

  let lead: typeof leads.$inferSelect | null = null;
  let purchaseEventId = '';
  let amount = ADVISORY_PRICE_VALUE;
  let currency = ADVISORY_CURRENCY;
  let verifiedSessionId = '';

  if (isCheckoutSessionId(sessionId)) {
    const session = await retrieveCheckoutSession(sessionId).catch(() => null);
    if (!session || !isPaidAdvisorySession(session)) redirect(ADVISORY_OFFER_PATH);

    const m = session.metadata || {};
    verifiedSessionId = session.id;
    purchaseEventId = m.purchase_event_id || `pu.${session.id}`;
    amount = (session.amount_total ?? ADVISORY_PRICE_VALUE * 100) / 100;
    currency = (session.currency || ADVISORY_CURRENCY).toUpperCase();

    // Safety net. Stripe's redirect regularly beats the webhook, and without
    // this the buyer would click through to the qualifier and be bounced back
    // to the page they just paid on. recordAdvisoryPurchase does the whole
    // job — stamp, CAPI, delivery email — behind one atomic claim, so running
    // it here and in the webhook cannot double up or half-finish.
    await recordAdvisoryPurchase(session).catch((err) => {
      console.error('[Advisory Thank-You] purchase record failed:', err);
    });

    const db = getDb();
    if (db) {
      try {
        if (m.lead_id && UUID_RE.test(m.lead_id)) {
          [lead] = await db.select().from(leads).where(eq(leads.id, m.lead_id)).limit(1);
        }
        if (!lead) {
          [lead] = await db
            .select()
            .from(leads)
            .where(eq(leads.stripeCheckoutSessionId, session.id))
            .limit(1);
        }
      } catch (err) {
        console.error('[Advisory Thank-You] lead lookup failed:', err);
      }
    }

    // Mint the cookie if they arrived without one — which is the normal case
    // when the delivery email is opened on a different device.
    //
    // This hands off to a route handler rather than calling cookies().set()
    // here. Next forbids writing cookies from a Server Component and throws,
    // which surfaced as a 500 on exactly this path: every buyer opening the
    // email on their phone. The `minted` flag stops the bounce repeating if
    // the browser refuses the cookie.
    if (lead && !params.minted) {
      const existing = await readDemoLead();
      if (existing !== lead.id) {
        const back = `${ADVISORY_THANK_YOU_PATH}?session_id=${encodeURIComponent(session.id)}&minted=1`;
        redirect(
          `/api/advisory-pricing/resume?session_id=${encodeURIComponent(session.id)}&to=${encodeURIComponent(back)}`,
        );
      }
    }
  } else {
    // No session id — a returning buyer. Cookie plus a paid row, or nothing.
    const leadId = await readDemoLead();
    if (!leadId) redirect(ADVISORY_PATH);
    const buyer = await loadAdvisoryBuyer(leadId);
    if (!buyer) redirect(ADVISORY_OFFER_PATH);
    lead = buyer.lead;
    amount = (lead.advisoryAmountCents ?? ADVISORY_PRICE_VALUE * 100) / 100;
  }

  // A downsell buyer already failed the qualifier, so this page is wrong for
  // them: it pitches the done-for-you engine and its CTA points back at the
  // gate they just missed. /next-steps delivers the same product with the
  // reason named and no calendar anywhere.
  if (lead?.funnelPath === 'not-a-fit') redirect(ADVISORY_NEXT_STEPS_PATH);

  return (
    <main className="relative min-h-screen overflow-hidden" style={{ backgroundColor: '#0a0f1c' }}>
      <FunnelLogo />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[520px] rounded-full blur-[130px] bg-emerald-500/10" />
      </div>

      <AdvisoryThankYouClient
        firstName={(lead?.firstName || '').trim()}
        email={lead?.email || ''}
        sessionId={verifiedSessionId}
        purchaseEventId={purchaseEventId}
        amount={amount}
        currency={currency}
      />
    </main>
  );
}
