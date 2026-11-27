// ---------------------------------------------------------------------------
// The /roas-calculator opt-in.
//
// Same shape as /api/forms/revenue-calc: rate limit, validate, score, insert
// the lead, fire Meta CAPI `Lead` (deduped with the browser pixel by
// event_id). Then GoHighLevel, two ways, both optional and neither able to
// fail the visitor's request:
//
//   - The API (GHL_API_KEY + GHL_LOCATION_ID): upsert the contact, tag it
//     "roas calculator", and write the numbers they built as a note, so a
//     human can read them on the contact whatever fields are mapped.
//   - An inbound webhook (GHL_ROAS_CALC_WEBHOOK_URL), to fire the workflow
//     that emails the breakdown. Unset, it is skipped. It deliberately does
//     NOT fall back to the revenue-calc webhook: that workflow sends the
//     Growth Ceiling emails, which would be the wrong email for this lead.
//
// The visitor's numbers are re-run on the server from their inputs rather
// than trusted from the body, so the note always matches the sheet's math.
// ---------------------------------------------------------------------------
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { getDb } from '@/lib/db';
import { leads } from '@/lib/leads-schema';
import { scoreLead } from '@/lib/lead-scoring';
import { sendCAPIEvent } from '@/lib/meta-capi';
import { EMAIL_RE } from '@/lib/contact-validation';
import { addContactNote, isGhlConfigured, upsertContact } from '@/lib/ghl';
import { getSiteUrl } from '@/lib/site';
import { DEFAULTS, MODEL_LABEL, SCENARIOS, breakEvenSales, run, sanitize, type Model } from '@/lib/roas-calc';

const FORM_SOURCE = 'roas-calc';
const CONTENT_NAME = 'ROAS Calculator';
const TAG = 'roas calculator';
const WEBHOOK_URL = process.env.GHL_ROAS_CALC_WEBHOOK_URL;

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const usd = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = checkRateLimit(`form-roas-calc:${ip}`, 5, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const firstName = str(body.firstName, 100);
  const email = str(body.email, 200);
  const firmName = str(body.firmName, 200);
  if (!firstName) return NextResponse.json({ error: 'Add your first name.' }, { status: 400 });
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'Enter a valid email.' }, { status: 400 });

  const model: Model = body.model === 'b2c' ? 'b2c' : 'b2b';
  const inputs = sanitize(body.inputs, DEFAULTS[model]);
  const { spend, results } = run(inputs);

  const eventId = typeof body.event_id === 'string' ? body.event_id.slice(0, 100) : null;
  const attribution = (body.attribution && typeof body.attribution === 'object' ? body.attribution : {}) as Record<
    string,
    string | null | undefined
  >;
  const userAgent = req.headers.get('user-agent') || '';

  const scoring = scoreLead({ email, firstName, formSource: FORM_SOURCE });

  const db = getDb();
  if (db) {
    try {
      await db.insert(leads).values({
        email,
        firstName,
        firmName: firmName || null,
        leadScore: scoring.classification,
        disqualifyReason: scoring.classification === 'disqualified' ? scoring.reason : null,
        formSource: FORM_SOURCE,
        fbclid: attribution.fbclid || null,
        fbp: attribution.fbp || null,
        fbc: attribution.fbc || null,
        utmSource: attribution.utm_source || null,
        utmMedium: attribution.utm_medium || null,
        utmCampaign: attribution.utm_campaign || null,
        utmTerm: attribution.utm_term || null,
        utmContent: attribution.utm_content || null,
        landingPage: attribution.landing_page || null,
        referrer: attribution.referrer || null,
        metaEventId: eventId,
        ipAddress: ip,
        userAgent,
      });
    } catch {
      console.error('[ROAS Calc] DB insert failed');
    }
  }

  // Flat keys for the webhook, so a GHL workflow can map them to fields.
  const metrics: Record<string, string | number> = {
    roas_model: MODEL_LABEL[model],
    roas_daily_spend: inputs.daily,
    roas_monthly_spend: spend,
    roas_offer_price: inputs.price,
    roas_break_even_sales: breakEvenSales(spend, inputs.price),
  };
  for (const { key } of SCENARIOS) {
    const r = results[key];
    const g = inputs.grid[key];
    metrics[`roas_${key}_cpl`] = g.cpl;
    metrics[`roas_${key}_cpbc`] = g.cpbc;
    metrics[`roas_${key}_show_rate`] = g.show;
    metrics[`roas_${key}_close_rate`] = g.close;
    metrics[`roas_${key}_leads`] = Math.round(r.leads);
    metrics[`roas_${key}_calls`] = Math.round(r.calls);
    metrics[`roas_${key}_showed`] = Math.round(r.showed);
    metrics[`roas_${key}_sales`] = r.salesRounded;
    metrics[`roas_${key}_revenue`] = r.revenue;
    metrics[`roas_${key}_roas`] = Number(r.roas.toFixed(2));
  }

  if (WEBHOOK_URL) {
    fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName,
        email,
        companyName: firmName || null,
        source: CONTENT_NAME,
        utm_source: attribution.utm_source || null,
        utm_medium: attribution.utm_medium || null,
        utm_campaign: attribution.utm_campaign || null,
        fbclid: attribution.fbclid || null,
        landing_page: attribution.landing_page || null,
        ...metrics,
      }),
    }).catch(() => {});
  } else {
    console.warn('[ROAS Calc] GHL_ROAS_CALC_WEBHOOK_URL is not set; no workflow fired');
  }

  if (isGhlConfigured()) {
    (async () => {
      const contact = await upsertContact({
        email,
        firstName,
        companyName: firmName || null,
        tags: [TAG],
        source: CONTENT_NAME,
        attribution,
      });
      if (!contact.ok || !contact.data) return;
      const lines = [
        `ROAS Calculator (${MODEL_LABEL[model]})`,
        `Ad spend: ${usd(inputs.daily)}/day = ${usd(spend)}/month`,
        `Offer contract price: ${usd(inputs.price)}`,
        `Break even: ${breakEvenSales(spend, inputs.price)} sales/month`,
        '',
        ...SCENARIOS.map(({ key, label }) => {
          const r = results[key];
          const g = inputs.grid[key];
          return `${label}: CPL ${usd(g.cpl)}, CPBC ${usd(g.cpbc)}, show ${g.show}%, close ${g.close}% → ${Math.round(r.leads)} leads, ${Math.round(r.calls)} calls, ${Math.round(r.showed)} showed, ${r.salesRounded} sales, ${usd(r.revenue)} revenue, ROAS ${r.roas.toFixed(2)}`;
        }),
      ];
      await addContactNote(contact.data.id, lines.join('\n'));
    })().catch(() => {});
  }

  if (eventId) {
    sendCAPIEvent({
      event_name: 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      action_source: 'website',
      event_source_url: attribution.landing_page || `${getSiteUrl()}/roas-calculator`,
      user_data: {
        em: email,
        fn: firstName,
        fbp: attribution.fbp || undefined,
        fbc: attribution.fbc || undefined,
        client_ip_address: ip !== 'unknown' ? ip : undefined,
        client_user_agent: userAgent || undefined,
      },
      custom_data: { content_name: CONTENT_NAME, lead_score: scoring.classification },
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
