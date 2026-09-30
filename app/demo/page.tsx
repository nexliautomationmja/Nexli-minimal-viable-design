// ---------------------------------------------------------------------------
// Demo funnel, page 2 — /demo
// Gated by the signed cookie set on /demo-opt-in.
// ---------------------------------------------------------------------------
import type { Metadata } from 'next';
import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { leads } from '@/lib/leads-schema';
import { requireDemoLead } from '@/lib/demo-session';
import DemoExperience from '@/components/demo/DemoExperience';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Your guest access | Nexli',
  robots: { index: false, follow: false },
};

export default async function DemoPage() {
  const leadId = await requireDemoLead();

  let firstName: string | null = null;
  const db = getDb();
  if (db) {
    try {
      const [row] = await db
        .select({ firstName: leads.firstName })
        .from(leads)
        .where(eq(leads.id, leadId))
        .limit(1);
      firstName = row?.firstName || null;
    } catch (err) {
      console.error('[Demo] lead lookup failed:', err);
    }
  }

  return <DemoExperience firstName={firstName} />;
}
