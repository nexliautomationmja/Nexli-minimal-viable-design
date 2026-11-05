// ---------------------------------------------------------------------------
// Candor — /candor
//
// The pre-call tool. A firm owner who has booked a strategy call asks the
// thing that is actually bothering them, and gets a straight answer grounded
// in what this site already publishes.
//
// UNGATED, for the same reason /booking-confirmed-b is: the link arrives by
// email and gets opened on a phone that has never visited the site. A cookie
// gate there is a dead end, and the page shows nothing that is not already in
// the pitch. If the cookie HAPPENS to be there we greet them by name; if not,
// the page works exactly the same.
//
// Noindex and absent from the sitemap. It is an unlisted link in an email
// sequence, not a search destination, and four near-identical AI chat pages
// is not something to invite a crawler into.
// ---------------------------------------------------------------------------
import type { Metadata } from 'next';
import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { leads } from '@/lib/leads-schema';
import { readDemoLead } from '@/lib/demo-session';
import CandorClient from './candor-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Candor | Nexli',
  description: 'Ask anything before your strategy call. Straight answers.',
  robots: 'noindex, nofollow',
};

export default async function CandorPage() {
  // Best effort only. Every failure path here — no cookie, no database, no
  // row — lands on the same ungated page with a generic greeting.
  let firstName: string | null = null;
  let leadId: string | null = null;

  try {
    leadId = await readDemoLead();
    if (leadId) {
      const db = getDb();
      if (db) {
        const [lead] = await db
          .select({ firstName: leads.firstName })
          .from(leads)
          .where(eq(leads.id, leadId))
          .limit(1);
        const name = (lead?.firstName || '').trim();
        if (name) firstName = name.split(' ')[0];
      }
    }
  } catch (err) {
    console.error('[Candor] lead lookup failed:', err);
  }

  return <CandorClient firstName={firstName} leadId={leadId} />;
}
