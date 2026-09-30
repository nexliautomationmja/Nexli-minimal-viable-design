import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import FunnelLogo from '@/components/FunnelLogo';
import { getDb } from '@/lib/db';
import { leads } from '@/lib/leads-schema';
import { DEMO_OFFER_PATH } from '@/lib/demo-config';
import { DEMO_COOKIE, requireDemoLead } from '@/lib/demo-session';
import { qualificationLabel } from '@/lib/qualification-steps';
import DemoCallClient from './call-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'You qualify | Nexli',
  description: '50 qualified advisory leads in your first 90 days. Watch the walkthrough and pick a time.',
  robots: 'noindex, nofollow',
};

const OUTFIT = { fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif" } as const;

/** The call-prep block Cal.com shows us alongside the booking. */
function buildNotes(lead: typeof leads.$inferSelect): string {
  const lines = ['--- Nexli demo funnel — qualifier answers ---'];
  if (lead.firmName) lines.push(`Firm: ${lead.firmName}`);
  lines.push(`US based: ${lead.usBased === null ? 'N/A' : lead.usBased ? 'Yes' : 'No'}`);
  lines.push(`Decision role: ${qualificationLabel('decisionRole', lead.decisionRole) ?? 'N/A'}`);
  lines.push(`Primary goal: ${qualificationLabel('goal', lead.goal) ?? 'N/A'}`);
  lines.push(`Problem duration: ${qualificationLabel('problemDuration', lead.problemDuration) ?? 'N/A'}`);
  lines.push(`Annual revenue: ${qualificationLabel('annualRevenue', lead.annualRevenue) ?? 'N/A'}`);
  lines.push(`Biggest tax saving: ${qualificationLabel('taxSavings', lead.taxSavings) ?? 'N/A'}`);
  if (lead.goalTag) lines.push(`Goal tag: ${lead.goalTag}`);
  if (lead.taxSavingsTag) lines.push(`Tax planning tier: ${lead.taxSavingsTag}`);
  if (lead.leadScore) lines.push(`Lead score: ${lead.leadScore}`);
  return lines.join('\n');
}

/**
 * Demo funnel page 4A — the qualified path. Anyone routed to the web pitch
 * is bounced to /demo/offer so they cannot wander in here.
 */
export default async function DemoCallPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const leadId = await requireDemoLead();

  // Set by QualifyFlow when the visitor entered through the "Claim the
  // website" button. They were promised a website and landed on a call
  // instead, so the page has to acknowledge that rather than swallow it.
  const params = await searchParams;
  const fromParam = Array.isArray(params.from) ? params.from[0] : params.from;
  const cameForWebsite = fromParam === 'website';

  const db = getDb();
  let lead: typeof leads.$inferSelect | null = null;
  if (db) {
    try {
      [lead] = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
    } catch (err) {
      console.error('[Demo Call] lead lookup failed:', err);
    }
  }

  if (lead?.funnelPath === 'web') redirect(DEMO_OFFER_PATH);

  const leadToken = (await cookies()).get(DEMO_COOKIE)?.value || '';
  const firstName = (lead?.firstName || '').trim();
  const lastName = (lead?.lastName || '').trim();
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || firstName || 'there';
  const email = lead?.email || '';
  const notes = lead ? buildNotes(lead) : '';

  return (
    <main className="relative min-h-screen overflow-hidden" style={{ backgroundColor: '#0a0f1c' }}>
      <FunnelLogo />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[560px] rounded-full blur-[130px] bg-blue-500/10" />
      </div>

      <section className="relative z-10 px-4 pt-28 pb-10 md:pt-36 md:pb-14 text-center">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-5"
          style={{ backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.25)' }}
        >
          <span className="text-[11px] font-bold tracking-[0.15em] uppercase" style={{ color: '#34d399' }}>
            You qualify
          </span>
        </div>

        <h1
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-[1.08] tracking-tight text-white max-w-3xl mx-auto"
          style={OUTFIT}
        >
          {firstName ? `${firstName}, your firm qualifies` : 'Your firm qualifies'} for the engine that turns{' '}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(90deg, #60a5fa, #22d3ee)' }}
          >
            $800 filers into $15,000+ advisory clients
          </span>
          .
        </h1>

        <p
          className="mt-5 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto"
          style={{ color: 'rgba(255,255,255,0.65)' }}
        >
          Your firm cleared the bar: 50 qualified advisory leads in your first 90 days, in writing.
          Watch the short walkthrough, then pick a time — no slide deck, no pressure.
        </p>

        {cameForWebsite && (
          <p
            className="mt-5 mx-auto max-w-2xl rounded-2xl border px-5 py-4 text-sm sm:text-base leading-relaxed"
            style={{
              background: 'rgba(52,211,153,0.07)',
              borderColor: 'rgba(52,211,153,0.28)',
              color: 'rgba(255,255,255,0.8)',
            }}
          >
            You came in for the website — that is still yours whenever you want it. Your answers also
            cleared the bar for the system that fills it, so here is that first.
          </p>
        )}
      </section>

      <DemoCallClient
        firstName={firstName || 'there'}
        fullName={fullName}
        email={email}
        leadToken={leadToken}
        notes={notes}
      />
    </main>
  );
}
