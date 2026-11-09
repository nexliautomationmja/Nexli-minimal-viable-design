import { headers } from 'next/headers';
import { buildLlmsTxt } from '../../lib/llms';
import { isOwnHost } from '../../lib/firm-sites/hosts';

// Per request, not force-static: it has to know which domain asked. A client
// firm's domain reaches this route too (middleware.ts skips dotted paths),
// and handing an AI crawler Nexli's company profile at firmdomain.com/llms.txt
// tells it the firm's website is Nexli's. Firm domains get a 404.
export async function GET() {
  const host = (await headers()).get('host');
  if (!isOwnHost(host)) return new Response('Not found', { status: 404 });

  return new Response(buildLlmsTxt(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
