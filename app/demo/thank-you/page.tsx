import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import {
  isCheckoutSessionId,
  isPaidFoundationSession,
  retrieveCheckoutSession,
  type Stripe,
} from '@/lib/stripe';
import { getDb } from '@/lib/db';
import { leads } from '@/lib/leads-schema';
import { provisionFoundationCustomer } from '@/lib/foundation-provision';
import { DEMO_OFFER_PATH } from '@/lib/demo-config';
import {
  FOUNDATION_CURRENCY,
  FOUNDATION_FIRST_PAYMENT_VALUE,
  FOUNDATION_PRODUCT_NAME,
} from '@/lib/foundation-config';
import DemoThankYou from './thank-you-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: `Welcome to ${FOUNDATION_PRODUCT_NAME} | Nexli`,
  description: 'Check your email, then set up your payments and domain.',
  robots: 'noindex, nofollow',
};

export default async function DemoThankYouPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const sessionId = Array.isArray(params.session_id) ? params.session_id[0] : params.session_id;

  if (!isCheckoutSessionId(sessionId)) {
    redirect(DEMO_OFFER_PATH);
  }

  const session = await retrieveCheckoutSession(sessionId, { expandSubscription: true }).catch(() => null);
  if (!session || !isPaidFoundationSession(session)) {
    redirect(DEMO_OFFER_PATH);
  }

  const subscription: Stripe.Subscription | null =
    session.subscription && typeof session.subscription !== 'string' ? session.subscription : null;

  const m = session.metadata || {};

  // Safety net: if the webhook has not provisioned this customer yet (or
  // failed), do it now so the buyer's welcome + agreement emails go out.
  let lead: typeof leads.$inferSelect | null = null;
  const db = getDb();
  if (db) {
    try {
      [lead] = await db
        .select()
        .from(leads)
        .where(eq(leads.stripeCheckoutSessionId, session.id))
        .limit(1);
    } catch (err) {
      console.error('[Demo Thank-You] lead lookup failed:', err);
    }
  }
  if (!lead || lead.provisioningStatus !== 'ok') {
    // provisionFoundationCustomer caps each attempt at 8s; bound the whole
    // call so the page never hangs on a slow dashboard.
    await Promise.race([
      provisionFoundationCustomer({ lead, session, subscription, source: 'thank-you' }),
      new Promise((r) => setTimeout(r, 8500)),
    ]).catch(() => {});
  }

  const email = lead?.email || m.email || session.customer_details?.email || '';
  const firstName = lead?.firstName || m.first_name || session.customer_details?.name?.split(' ')[0] || '';
  const lastName = lead?.lastName || m.last_name || '';
  const firmName = lead?.firmName || m.firm_name || '';

  // Stashed by lib/foundation-provision.ts once the portal hands back the
  // Launch Pad link. Absent until provisioning finishes, which the page
  // handles rather than rendering a dead button.
  const saved = (lead?.onboardingIntake as Record<string, unknown> | null) ?? {};
  const onboardingUrl =
    typeof saved.onboardingUrl === 'string' ? saved.onboardingUrl : undefined;

  return (
    <DemoThankYou
      sessionId={session.id}
      firstName={firstName}
      email={email}
      firmName={firmName}
      purchaseEventId={m.purchase_event_id || `pu.${session.id}`}
      amount={session.amount_total != null ? session.amount_total / 100 : FOUNDATION_FIRST_PAYMENT_VALUE}
      currency={(session.currency || FOUNDATION_CURRENCY).toUpperCase()}
      onboardingUrl={onboardingUrl}
    />
  );
}
