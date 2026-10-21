// ---------------------------------------------------------------------------
// Accelerator funnel, page 3 — the done-for-you pitch, for firms that
// cleared the bar.
//
// They have just been told the guide is on its way and that it takes about
// ten minutes. That wait is the whole reason this page works: there is
// nothing to download, so the only thing to do is watch.
//
// The pitch is the inverse of the guide's. The guide says "here is how to
// do this yourself"; the VSL says "or we do all of it for you". Then a
// calendar, directly underneath, because a firm that has just decided it
// does not want the homework should not have to go looking.
//
// GATED ON ITS OWN PATHS, not requireAdvisoryLeadRow — that helper bounces
// to /advisory-pricing, which would drop an Accelerator visitor into a
// funnel they never entered.
// ---------------------------------------------------------------------------
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import FunnelLogo from '@/components/FunnelLogo';
import { getDb } from '@/lib/db';
import { leads } from '@/lib/leads-schema';
import { DEMO_COOKIE, readDemoLead } from '@/lib/demo-session';
import { qualificationLabel } from '@/lib/qualification-steps';
import { toE164 } from '@/lib/contact-validation';
import {
  ACCELERATOR_DELIVERY_MINUTES,
  ACCELERATOR_PATH,
  ACCELERATOR_QUALIFY_PATH,
  ACCELERATOR_SENDING_PATH,
} from '@/lib/accelerator-config';
import AcceleratorNextClient from './next-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'On its way | Nexli',
  description: 'Your Accelerator is sending. While you wait.',
  robots: 'noindex, nofollow',
};

const OUTFIT = { fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif" } as const;

/**
 * The call-prep block Cal.com shows alongside the booking.
 *
 * Its own builder rather than the advisory page's. That one opens
 * "cleared the qualifier" and lists Problem duration and Biggest tax
 * saving, neither of which this funnel asks — they would read N/A. More
 * usefully, the header line tells Marcel on the call which funnel the firm
 * came through, which nothing else on the booking does.
 *
 * No budget line, because there is no budget question. A firm here has
 * never been shown a price.
 */
function buildNotes(lead: typeof leads.$inferSelect): string {
  const lines = ['--- Nexli ACCELERATOR funnel (free guide) — cleared the qualifier ---'];
  if (lead.firmName) lines.push(`Firm: ${lead.firmName}`);
  lines.push(`US based: ${lead.usBased === null ? 'N/A' : lead.usBased ? 'Yes' : 'No'}`);
  lines.push(`Decision role: ${qualificationLabel('decisionRole', lead.decisionRole) ?? 'N/A'}`);
  lines.push(`Annual revenue: ${qualificationLabel('annualRevenue', lead.annualRevenue) ?? 'N/A'}`);
  lines.push(`Primary goal: ${qualificationLabel('goal', lead.goal) ?? 'N/A'}`);
  if (lead.goalTag) lines.push(`Goal tag: ${lead.goalTag}`);
  if (lead.leadScore) lines.push(`Lead score: ${lead.leadScore}`);
  lines.push('Budget: not asked (free funnel)');
  return lines.join('\n');
}

export default async function AcceleratorNextPage() {
  const leadId = await readDemoLead();
  if (!leadId) redirect(ACCELERATOR_PATH);

  const db = getDb();
  const [lead] = db
    ? await db.select().from(leads).where(eq(leads.id, leadId)).limit(1)
    : [];

  // Fails closed: no funnelPath means the qualifier never completed.
  if (!lead?.funnelPath) redirect(ACCELERATOR_QUALIFY_PATH);
  // Missed the bar — they still get the guide, just not this pitch.
  if (lead.funnelPath !== 'agency') redirect(ACCELERATOR_SENDING_PATH);

  const leadToken = (await cookies()).get(DEMO_COOKIE)?.value || '';
  const firstName = (lead.firstName || '').trim();
  const lastName = (lead.lastName || '').trim();
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || firstName || 'there';

  return (
    <main className="relative min-h-screen overflow-hidden" style={{ backgroundColor: '#0a0f1c' }}>
      <FunnelLogo />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[540px] rounded-full blur-[130px] bg-emerald-500/10" />
      </div>

      <section className="relative z-10 px-4 sm:px-6 pt-24 md:pt-28 pb-6 text-center">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-5"
          style={{ backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.25)' }}
        >
          <span
            className="text-[11px] font-bold tracking-[0.15em] uppercase"
            style={{ color: '#34d399' }}
          >
            On its way
          </span>
        </div>

        <h1
          className="text-2xl sm:text-3xl md:text-4xl font-black leading-[1.08] tracking-tight text-white max-w-2xl mx-auto"
          style={OUTFIT}
        >
          {firstName ? `${firstName}, it is sending now.` : 'It is sending now.'}
        </h1>

        <p
          className="mt-4 text-sm sm:text-base leading-relaxed max-w-xl mx-auto"
          style={{ color: 'rgba(255,255,255,0.65)' }}
        >
          Give it about {ACCELERATOR_DELIVERY_MINUTES} minutes to land. While you
          wait &mdash; there is a version of this where we bring you the clients
          and you never do any of it yourself.
        </p>

        {/* NOT DeliveryBlock. That component hardcodes "it lands in the
            next two minutes", which is true of the paid flow and of
            /accelerator/sending but flatly contradicts the ten-minute hold
            this page is built around — the two lines sat one above the
            other saying different numbers. The email address is the only
            part worth keeping, so it is inline. */}
        {lead.email && (
          <p className="mt-6 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Going to <span className="font-semibold text-white">{lead.email}</span>.
            Check spam if it has not arrived in fifteen.
          </p>
        )}
      </section>

      <AcceleratorNextClient
        fullName={fullName}
        email={lead.email || ''}
        phone={toE164(lead.phone || '')}
        leadToken={leadToken}
        notes={buildNotes(lead)}
      />
    </main>
  );
}
