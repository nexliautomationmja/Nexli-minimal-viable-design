import { timingSafeEqual } from 'crypto';
import { NextRequest } from 'next/server';

/**
 * Whether `provided` is CRM_WEBHOOK_SECRET, compared in constant time.
 * False when the env var is not set, so an unconfigured deploy refuses
 * everything rather than accepting everything.
 */
export function secretMatches(provided: string): boolean {
  const secret = process.env.CRM_WEBHOOK_SECRET;
  if (!secret) {
    console.warn('[Webhook Auth] CRM_WEBHOOK_SECRET not set — rejecting request');
    return false;
  }
  if (!provided || provided.length !== secret.length) return false;

  try {
    return timingSafeEqual(Buffer.from(provided), Buffer.from(secret));
  } catch {
    return false;
  }
}

/**
 * Verify the x-webhook-secret header against CRM_WEBHOOK_SECRET env var.
 * Uses timing-safe comparison to prevent timing attacks.
 */
export function verifyWebhookSecret(req: NextRequest): boolean {
  return secretMatches(req.headers.get('x-webhook-secret') || '');
}
