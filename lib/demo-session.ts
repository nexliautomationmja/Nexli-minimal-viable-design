/**
 * Lead identity across the demo funnel.
 *
 * The opt-in on /demo-opt-in is the only place we collect contact details.
 * Every later page (/demo, /demo/qualify, /demo/call, /demo/offer) needs to
 * know who the visitor is without asking again, so the opt-in sets a signed,
 * httpOnly cookie holding the lead's id.
 *
 * The signed value doubles as a bearer credential for the booking and
 * checkout routes, which is why it is HMAC-signed rather than a bare id: a
 * visitor must not be able to type someone else's lead id into a cookie.
 *
 * Server-only. Uses the Web Crypto API so it works on the edge too.
 */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DEMO_OPT_IN_PATH } from './demo-config';

export const DEMO_COOKIE = 'nexli_demo_lead';
const MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

function getSecret(): string {
  const secret =
    process.env.DEMO_SESSION_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.PROVISION_SECRET ||
    '';
  if (!secret) {
    throw new Error(
      'DEMO_SESSION_SECRET is not set. Generate one with: openssl rand -hex 32',
    );
  }
  return secret;
}

function base64url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = '';
  for (const b of arr) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return base64url(sig);
}

/** Constant-time string compare. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Build the cookie value: `<leadId>.<issuedAt>.<signature>`. */
export async function createDemoToken(leadId: string): Promise<string> {
  const payload = `${leadId}.${Date.now()}`;
  return `${payload}.${await sign(payload)}`;
}

/** Verify a token and return the lead id, or null when it is invalid or stale. */
export async function verifyDemoToken(token: string | undefined | null): Promise<string | null> {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [leadId, issuedAt, signature] = parts;
  if (!UUID_RE.test(leadId)) return null;
  const issued = Number(issuedAt);
  if (!Number.isFinite(issued)) return null;
  if (Date.now() - issued > MAX_AGE_SECONDS * 1000) return null;
  const expected = await sign(`${leadId}.${issuedAt}`);
  return safeEqual(expected, signature) ? leadId : null;
}

/** Cookie options shared by the route handlers that set it. */
export function demoCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  };
}

/** Read the lead id from the request cookie. Server components and routes. */
export async function readDemoLead(): Promise<string | null> {
  try {
    const store = await cookies();
    return verifyDemoToken(store.get(DEMO_COOKIE)?.value);
  } catch {
    return null;
  }
}

/**
 * Read the lead id or send the visitor back to the opt-in. Use at the top of
 * every gated page in the funnel.
 */
export async function requireDemoLead(): Promise<string> {
  const leadId = await readDemoLead();
  if (!leadId) redirect(DEMO_OPT_IN_PATH);
  return leadId;
}
