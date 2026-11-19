import { NextRequest, NextResponse } from "next/server";
import { recordAdvisoryPurchase } from "@/lib/advisory-purchase";
import { constructWebhookEvent, getSessionProduct, type Stripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe's webhook. One product is sold through Stripe now: the Book of
 * Business Accelerator ($97, one-time), recorded by recordAdvisoryPurchase.
 *
 * The Firm Foundation subscription ($497/mo website + portal) and everything
 * that handled it here (its checkout sessions, subscription and invoice
 * events, portal provisioning) were removed on 2026-11-19 (Marcel): the
 * product is retired. Subscription and invoice events Stripe still sends
 * fall through to the default branch and are acknowledged without action.
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = constructWebhookEvent(rawBody, signature);
  } catch (err) {
    console.error("[Stripe Webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Business-logic failures are logged, never surfaced as 5xx — otherwise
  // Stripe retries for days and we risk duplicate downstream side effects.
  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (getSessionProduct(session) === "advisory") {
          await recordAdvisoryPurchase(session);
        }
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error(`[Stripe Webhook] handler error for ${event.type}:`, err);
  }

  return NextResponse.json({ received: true });
}
