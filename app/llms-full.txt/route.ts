import { headers } from 'next/headers';
import { buildLlmsFullTxt } from '../../lib/llms';
import { isOwnHost } from '../../lib/firm-sites/hosts';

// Per request so it can refuse client firm domains. See app/llms.txt/route.ts.
export async function GET() {
  const host = (await headers()).get('host');
  if (!isOwnHost(host)) return new Response('Not found', { status: 404 });

  return new Response(buildLlmsFullTxt(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
