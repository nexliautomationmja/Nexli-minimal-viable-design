/**
 * DEV-ONLY funnel bypass, for reviewing the demo funnel on localhost without
 * filling in the opt-in every time.
 *
 * It creates (or reuses) a single throwaway "preview" lead, stamps it with a
 * full set of qualifier answers for whichever branch you want to see, signs
 * the normal demo cookie for it and redirects you to the page you asked for.
 * After one visit every /demo page works in that browser for 30 days.
 *
 *   /api/demo/preview                       → /demo
 *   /api/demo/preview?as=agency&to=/demo/call
 *   /api/demo/preview?as=web&to=/demo/offer
 *   /api/demo/preview?reset=1               → clears the cookie
 *
 * Hard-disabled in production: it returns 404 when NODE_ENV is 'production',
 * so it can never mint a session on the live site.
 */
import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { leads } from '@/lib/leads-schema';
import { DEMO_FORM_SOURCE, DEMO_PATH, DEMO_OPT_IN_PATH, type FunnelPath } from '@/lib/demo-config';
import { createDemoToken, demoCookieOptions, DEMO_COOKIE } from '@/lib/demo-session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** One row, reused across every preview so the dev database stays tidy. */
const PREVIEW_EMAIL = 'preview@nexli.local';

/** Answers that put the lead on each side of the qualifier split. */
const BRANCH: Record<FunnelPath, Record<string, unknown>> = {
  agency: {
    usBased: true,
    decisionRole: 'sole-owner',
    goal: 'generate-leads',
    goalTag: 'hot_full_system',
    problemDuration: 'over-a-year',
    annualRevenue: '1m-5m',
    taxSavings: '100k-plus',
    taxSavingsTag: 'taxplan_elite',
    leadScore: 'qualified',
    disqualifyReason: null,
    funnelPath: 'agency',
  },
  web: {
    usBased: true,
    decisionRole: 'sole-owner',
    goal: 'better-website',
    goalTag: 'warm_full_system',
    problemDuration: 'few-months',
    annualRevenue: 'under-400k',
    taxSavings: 'under-10k',
    taxSavingsTag: 'taxplan_compliance',
    leadScore: 'disqualified',
    disqualifyReason: 'revenue_too_low',
    funnelPath: 'web',
  },
};

/** Only allow redirects inside this app. */
function safeTo(raw: string | null): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return DEMO_PATH;
  return raw;
}

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Not found', { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const to = safeTo(searchParams.get('to'));

  // ?reset=1 drops the cookie so you can test the real gate again.
  if (searchParams.get('reset')) {
    const res = NextResponse.redirect(new URL(DEMO_OPT_IN_PATH, req.url));
    res.cookies.set(DEMO_COOKIE, '', { ...demoCookieOptions(), maxAge: 0 });
    return res;
  }

  const asParam = searchParams.get('as');
  const as: FunnelPath | null = asParam === 'agency' || asParam === 'web' ? asParam : null;

  const db = getDb();
  if (!db) {
    return NextResponse.json(
      { error: 'No DATABASE_URL — the preview bypass needs the dev database.' },
      { status: 503 },
    );
  }

  const base = {
    email: PREVIEW_EMAIL,
    firstName: 'Marcel',
    lastName: 'Allen',
    phone: '7205550148',
    firmName: 'Preview CPA Firm',
    formSource: DEMO_FORM_SOURCE,
    marketingSmsOptIn: false,
    nonMarketingSmsOptIn: true,
    updatedAt: new Date(),
    ...(as ? BRANCH[as] : {}),
  };

  const [existing] = await db.select({ id: leads.id }).from(leads).where(eq(leads.email, PREVIEW_EMAIL)).limit(1);

  let leadId: string;
  if (existing) {
    await db.update(leads).set(base).where(eq(leads.id, existing.id));
    leadId = existing.id;
  } else {
    const [row] = await db.insert(leads).values(base).returning({ id: leads.id });
    leadId = row.id;
  }

  const res = NextResponse.redirect(new URL(to, req.url));
  res.cookies.set(DEMO_COOKIE, await createDemoToken(leadId), demoCookieOptions());
  return res;
}
