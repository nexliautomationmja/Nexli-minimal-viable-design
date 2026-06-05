import { timingSafeEqual } from 'crypto';
import { NextRequest } from 'next/server';

/**
 * Verify the x-webhook-secret header against CRM_WEBHOOK_SECRET env var.
 * Uses timing-safe comparison to prevent timing attacks.
 */
export function verifyWebhookSecret(req: NextRequest): boolean {
  const secret = process.env.CRM_WEBHOOK_SECRET;
  if (!secret) {
    console.warn('[Webhook Auth] CRM_WEBHOOK_SECRET not set — rejecting request');
    return false;
  }

  const provided = req.headers.get('x-webhook-secret') || '';
  if (provided.length !== secret.length) return false;

  try {
    return timingSafeEqual(Buffer.from(provided), Buffer.from(secret));
  } catch {
    return false;
  }
}
