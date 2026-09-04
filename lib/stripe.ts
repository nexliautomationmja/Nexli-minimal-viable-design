import Stripe from "stripe";
import {
  getSiteUrl,
  ROADMAP_CURRENCY,
  ROADMAP_PATH,
  ROADMAP_PRICE_VALUE,
  ROADMAP_STRIPE_PRODUCT_ID,
  ROADMAP_THANK_YOU_PATH,
} from "./roadmap-config";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    _stripe = new Stripe(key, { typescript: true });
  }
  return _stripe;
}

/** Attribution fields carried through Stripe metadata so the webhook can
 *  fire a fully-attributed CAPI Purchase without a DB round-trip. */
export interface RoadmapAttribution {
  fbclid?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
  landing_page?: string | null;
  referrer?: string | null;
}

export interface RoadmapCheckoutParams {
  leadId: string | null;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  purchaseEventId: string;
  attribution: RoadmapAttribution;
}

/** Stripe metadata values must be strings of at most 500 chars. */
function meta(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  const s = String(value).trim();
  return s ? s.slice(0, 500) : undefined;
}

function compact(obj: Record<string, string | undefined>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) if (v !== undefined) out[k] = v;
  return out;
}

let cachedLineItem: Stripe.Checkout.SessionCreateParams.LineItem | null = null;

/**
 * Resolve what to charge, in priority order:
 *  1. STRIPE_ROADMAP_PRICE_ID (explicit Price)
 *  2. the Product's default price
 *  3. ad-hoc price_data on the Product using ROADMAP_PRICE_VALUE
 * The result is cached for the life of the serverless instance.
 */
async function resolveRoadmapLineItem(
  stripe: Stripe
): Promise<Stripe.Checkout.SessionCreateParams.LineItem> {
  if (cachedLineItem) return cachedLineItem;

  const explicitPrice = process.env.STRIPE_ROADMAP_PRICE_ID;
  if (explicitPrice) {
    cachedLineItem = { price: explicitPrice, quantity: 1 };
    return cachedLineItem;
  }

  const product = await stripe.products.retrieve(ROADMAP_STRIPE_PRODUCT_ID);
  const defaultPrice =
    typeof product.default_price === "string"
      ? product.default_price
      : product.default_price?.id;

  if (defaultPrice) {
    cachedLineItem = { price: defaultPrice, quantity: 1 };
  } else {
    console.warn(
      `[Stripe] Product ${ROADMAP_STRIPE_PRODUCT_ID} has no default price — charging ${ROADMAP_PRICE_VALUE} ${ROADMAP_CURRENCY} via price_data`
    );
    cachedLineItem = {
      price_data: {
        currency: ROADMAP_CURRENCY.toLowerCase(),
        product: ROADMAP_STRIPE_PRODUCT_ID,
        unit_amount: Math.round(ROADMAP_PRICE_VALUE * 100),
      },
      quantity: 1,
    };
  }
  return cachedLineItem;
}

export async function createRoadmapCheckoutSession(
  params: RoadmapCheckoutParams
): Promise<{ sessionId: string; checkoutUrl: string }> {
  const stripe = getStripe();
  const lineItem = await resolveRoadmapLineItem(stripe);
  const site = getSiteUrl();
  const a = params.attribution || {};

  const metadata = compact({
    product: "roadmap",
    lead_id: meta(params.leadId),
    first_name: meta(params.firstName),
    last_name: meta(params.lastName),
    email: meta(params.email),
    phone: meta(params.phone),
    purchase_event_id: meta(params.purchaseEventId),
    fbclid: meta(a.fbclid),
    fbp: meta(a.fbp),
    fbc: meta(a.fbc),
    utm_source: meta(a.utm_source),
    utm_medium: meta(a.utm_medium),
    utm_campaign: meta(a.utm_campaign),
    utm_term: meta(a.utm_term),
    utm_content: meta(a.utm_content),
    landing_page: meta(a.landing_page),
    referrer: meta(a.referrer),
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: params.email,
    customer_creation: "always",
    allow_promotion_codes: false,
    line_items: [lineItem],
    metadata,
    payment_intent_data: {
      metadata: compact({
        product: "roadmap",
        lead_id: meta(params.leadId),
        email: meta(params.email),
      }),
    },
    // Stripe requires at least 30 minutes; 45 keeps abandoned sessions short.
    expires_at: Math.floor(Date.now() / 1000) + 45 * 60,
    success_url: `${site}${ROADMAP_THANK_YOU_PATH}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${site}${ROADMAP_PATH}?checkout=cancelled#checkout`,
  });

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL");
  }

  return { sessionId: session.id, checkoutUrl: session.url };
}

export function isCheckoutSessionId(value: unknown): value is string {
  return typeof value === "string" && /^cs_(test|live)_[A-Za-z0-9]+$/.test(value);
}

export async function retrieveCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session> {
  return getStripe().checkout.sessions.retrieve(sessionId);
}

/** True when a session represents a settled roadmap purchase. */
export function isPaidRoadmapSession(session: Stripe.Checkout.Session): boolean {
  return (
    session.payment_status === "paid" &&
    session.metadata?.product === "roadmap"
  );
}

export function constructWebhookEvent(
  rawBody: string,
  signature: string
): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  return getStripe().webhooks.constructEvent(rawBody, signature, secret);
}

export type { Stripe };
