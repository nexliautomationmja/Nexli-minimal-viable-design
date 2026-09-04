import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import {
  isCheckoutSessionId,
  isPaidRoadmapSession,
  retrieveCheckoutSession,
} from '@/lib/stripe';
import { ROADMAP_PATH } from '@/lib/roadmap-config';
import RoadmapThankYou from './roadmap-thank-you-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Your CPA Scaling Roadmap | Nexli',
  description: 'Access your CPA Scaling Roadmap and book your strategy call.',
  robots: 'noindex, nofollow',
};

export default async function RoadmapThankYouPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const sessionId = Array.isArray(params.session_id) ? params.session_id[0] : params.session_id;

  if (!isCheckoutSessionId(sessionId)) {
    redirect(ROADMAP_PATH);
  }

  const session = await retrieveCheckoutSession(sessionId).catch(() => null);
  if (!session || !isPaidRoadmapSession(session)) {
    redirect(ROADMAP_PATH);
  }

  const m = session.metadata || {};
  const email = m.email || session.customer_details?.email || '';
  const firstName = m.first_name || session.customer_details?.name?.split(' ')[0] || '';
  const lastName = m.last_name || '';

  return (
    <RoadmapThankYou
      sessionId={session.id}
      firstName={firstName}
      lastName={lastName}
      email={email}
      purchaseEventId={m.purchase_event_id || `pu.${session.id}`}
      amount={(session.amount_total ?? 0) / 100}
      currency={(session.currency || 'usd').toUpperCase()}
    />
  );
}
