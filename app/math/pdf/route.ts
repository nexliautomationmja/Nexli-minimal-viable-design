// ---------------------------------------------------------------------------
// /math/pdf — the See the Math PDF link to text or email after a call.
//
// Sends a phone the phone PDF and anything else the 16:9 slides, by the
// same rule the download buttons use (isPhone in lib/device). ?format=phone
// or ?format=desktop forces one.
//
// A redirect, never cached by anyone but the browser, and varying on what
// it reads, so a CDN can never hand one visitor the other's file. Unlisted
// like the rest of /math: robots disallows the path, and this says noindex.
// ---------------------------------------------------------------------------
import { NextResponse, type NextRequest } from 'next/server';
import { PDF_HREF, PDF_PHONE_HREF } from '@/components/math/pdf';
import { isPhone, mobileHintFromHeader } from '@/lib/device';

export const dynamic = 'force-dynamic';

export function GET(req: NextRequest) {
  const format = req.nextUrl.searchParams.get('format');
  const phone =
    format === 'phone'
      ? true
      : format === 'desktop'
        ? false
        : isPhone({
            userAgent: req.headers.get('user-agent') ?? '',
            mobileHint: mobileHintFromHeader(req.headers.get('sec-ch-ua-mobile')),
          });

  const res = NextResponse.redirect(new URL(phone ? PDF_PHONE_HREF : PDF_HREF, req.url), 302);
  res.headers.set('Cache-Control', 'private, no-store');
  res.headers.set('Vary', 'User-Agent, Sec-CH-UA-Mobile');
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return res;
}
