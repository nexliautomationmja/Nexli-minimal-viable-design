// ---------------------------------------------------------------------------
// Accelerator funnel, page 3b — delivery confirmation, for firms that did
// not clear the bar.
//
// They still get the guide. The fork decides what they are SHOWN, not
// whether they are helped — which is the whole difference between this
// funnel and the advisory one, where missing the bar means a $97 downsell.
//
// SO THERE IS NOTHING ELSE ON THIS PAGE. No calendar: they did not
// qualify for the call. No $97 offer: they are being handed that product
// free as this renders, and selling it to them here would be grotesque.
// No download: the email is the delivery mechanism and the wait is
// deliberate elsewhere in the funnel.
//
// THEY WAIT A MINUTE OR TWO, NOT TEN. The ten-minute hold on
// /accelerator/next exists to keep a qualified firm on the VSL. There is
// no VSL here, so a long wait buys nothing and earns a support email.
// That needs the GHL workflow to branch on the tag — see the two
// constants in lib/accelerator-config.
//
// Gated on 'not-a-fit' specifically, not merely on funnelPath being set.
// A funnel-A lead with 'agency' would otherwise read "your free guide is
// on its way" and never receive one.
// ---------------------------------------------------------------------------
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import FunnelLogo from '@/components/FunnelLogo';
import DeliveryBlock from '@/components/advisory/DeliveryBlock';
import { getDb } from '@/lib/db';
import { leads } from '@/lib/leads-schema';
import { readDemoLead } from '@/lib/demo-session';
import {
  ACCELERATOR_NEXT_PATH,
  ACCELERATOR_PATH,
  ACCELERATOR_QUALIFY_PATH,
} from '@/lib/accelerator-config';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'On its way | Nexli',
  description: 'Your Accelerator is sending.',
  robots: 'noindex, nofollow',
};

const OUTFIT = { fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif" } as const;

export default async function AcceleratorSendingPage() {
  const leadId = await readDemoLead();
  if (!leadId) redirect(ACCELERATOR_PATH);

  const db = getDb();
  const [lead] = db
    ? await db.select().from(leads).where(eq(leads.id, leadId)).limit(1)
    : [];

  if (!lead?.funnelPath) redirect(ACCELERATOR_QUALIFY_PATH);
  // Cleared the bar — they belong on the page with the VSL and the calendar.
  if (lead.funnelPath === 'agency') redirect(ACCELERATOR_NEXT_PATH);

  const firstName = (lead.firstName || '').trim();

  return (
    <main className="relative min-h-screen overflow-hidden" style={{ backgroundColor: '#0a0f1c' }}>
      <FunnelLogo />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[130px] bg-emerald-500/10" />
      </div>

      <section className="relative z-10 mx-auto max-w-xl px-4 sm:px-6 pt-28 md:pt-32 pb-24 text-center">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6"
          style={{ backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.25)' }}
        >
          <span
            className="text-[11px] font-bold tracking-[0.15em] uppercase"
            style={{ color: '#34d399' }}
          >
            Sending
          </span>
        </div>

        <h1
          className="text-2xl sm:text-3xl md:text-4xl font-black leading-[1.08] tracking-tight text-white"
          style={OUTFIT}
        >
          {firstName ? `${firstName}, it is on its way.` : 'It is on its way.'}
        </h1>

        <p
          className="mt-4 text-sm sm:text-base leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.65)' }}
        >
          Give it a couple of minutes to land. If it has not shown up, check the
          spam folder before you give up on us.
        </p>

        <div className="mt-8 text-left">
          <DeliveryBlock email={lead.email} />
        </div>

        <p className="mt-10 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Start with the twenty highest-income clients already on your books.
          That is page three, and it is the part that makes the rest worth
          reading.
        </p>

        <p className="mt-8 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
          &mdash; Marcel
        </p>
      </section>
    </main>
  );
}
