// ---------------------------------------------------------------------------
// The product, served to buyers only.
//
// NOT LINKED FROM ANY PAGE. Delivery is by email — the GoHighLevel workflow
// attaches the PDF — and the on-page download was removed because the card it
// needed pushed the agency CTA below the mobile fold.
//
// This route is kept on purpose: it is a working, purchase-gated URL and it
// is the answer when a buyer emails to say the attachment never arrived or
// was stripped by their mail filter. Deleting it would mean rebuilding it the
// first time that happens.
//
// The PDF lives outside public/ precisely so there is no guessable URL for
// it — this one file is the entire $297. Entitlement is the same check every
// other page in the funnel uses: the signed cookie identifies the lead, and
// `advisory_purchased_at` on that row is what makes it a purchase.
//
// Uses loadAdvisoryBuyer, NOT requireAdvisoryBuyer: the latter calls
// next/navigation's redirect, which cannot run inside a route handler.
//
// Note the cookie is shared with the demo funnel, so on its own it proves
// identity and not entitlement. The paid-row check is the gate.
// ---------------------------------------------------------------------------
import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import { readDemoLead } from '@/lib/demo-session';
import { loadAdvisoryBuyer } from '@/lib/advisory-session';
import { advisoryPdfPath } from '@/lib/advisory-delivery';
import { ADVISORY_PDF_FILENAME } from '@/lib/advisory-config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const leadId = await readDemoLead();
  if (!leadId) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 403 });
  }

  const buyer = await loadAdvisoryBuyer(leadId);
  if (!buyer) {
    return NextResponse.json({ error: 'Purchase required.' }, { status: 403 });
  }

  let file: Buffer;
  try {
    file = await readFile(advisoryPdfPath());
  } catch {
    // The file is not in the deployment. Most likely cause is that
    // next.config.ts is missing the outputFileTracingIncludes entry, which
    // fails only in production — localhost reads straight off the repo.
    console.error(
      `[Advisory Download] PDF missing at ${advisoryPdfPath()} — check outputFileTracingIncludes`,
    );
    return NextResponse.json(
      { error: 'Your copy is not available for download yet. Check your email, or contact mail@nexli.net.' },
      { status: 404 },
    );
  }

  return new NextResponse(new Uint8Array(file), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${ADVISORY_PDF_FILENAME}"`,
      'Content-Length': String(file.byteLength),
      // Buyer-specific and access-controlled; never let a shared cache hold it.
      'Cache-Control': 'private, no-store',
    },
  });
}
