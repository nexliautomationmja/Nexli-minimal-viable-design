import Stripe from "stripe";
import { getSiteUrl } from "./site";
import {
  ADVISORY_OFFER_PATH,
  ADVISORY_THANK_YOU_PATH,
  getAdvisoryPriceId,
} from "./advisory-config";
import {
  FOUNDATION_PRODUCT_ID,
  FOUNDATION_PRODUCT_NAME,
  FOUNDATION_SETUP_FEE_VALUE,
  FOUNDATION_FIRST_PAYMENT_VALUE,
  getFoundationSetupPriceId,
  getFoundationStripePriceId,
} from "./foundation-config";
import { DEMO_OFFER_PATH, DEMO_THANK_YOU_PATH } from "./demo-config";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    _stripe = new Stripe(key, { typescript: true });
  }
  return _stripe;
}

export type SessionProduct = "advisory" | "foundation";

/** Attribution fields carried through Stripe metadata so the webhook can
 *  fire a fully-attributed CAPI Purchase without a DB round-trip. */
export interface CheckoutAttributionFields {
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

export type CheckoutAttribution = CheckoutAttributionFields;

export interface OneTimeCheckoutParams {
  leadId: string | null;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  purchaseEventId: string;
  attribution: CheckoutAttributionFields;
}

export interface FoundationCheckoutParams extends OneTimeCheckoutParams {
  firmName: string;
  websiteUrl?: string | null;
  marketingSmsOptIn: boolean;
  nonMarketingSmsOptIn: boolean;
  /** site_previews.token the buyer saw before subscribing; the webhook hands
   *  its config to the portal as the firm's draft website. */
  previewToken?: string | null;
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

function attributionMetadata(a: CheckoutAttributionFields): Record<string, string | undefined> {
  return {
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
  };
}

/**
 * Every line item is now a plain env-var lookup, so there is deliberately no
 * cache. The old one memoised resolved prices for the life of the serverless
 * instance, which meant a corrected price id only took effect on instances
 * started after the change — during a rolling deploy some customers were
 * charged the old amount. It existed only because the retired roadmap
 * resolver might call stripe.products.retrieve(); with that gone, caching an
 * object literal buys nothing.
 */

/** The $297 one-time calculator. Throws if the Price id is unset. */
function resolveAdvisoryLineItem(): Stripe.Checkout.SessionCreateParams.LineItem {
  return { price: getAdvisoryPriceId(), quantity: 1 };
}

/**
 * Foundation charges two explicit Prices on one `mode: "subscription"`
 * session: the recurring $497/mo Price and a one-time $999 setup Price.
 * Stripe puts the one-time price on the subscription's first invoice, so the
 * first charge is $1,496 and every later charge is $497.
 *
 * ORDER MATTERS BY CONVENTION: the recurring price is always first.
 * A one-time price can never become a subscription item, so
 * `getSubscriptionPeriodEnd` (which reads `items.data[0]`) is safe either
 * way — but keeping the recurring item first makes that invariant obvious
 * and keeps the Checkout page reading "$497/month" above "$999 setup fee".
 */
function resolveFoundationLineItems(): Stripe.Checkout.SessionCreateParams.LineItem[] {
  const recurring: Stripe.Checkout.SessionCreateParams.LineItem = {
    price: getFoundationStripePriceId(),
    quantity: 1,
  };
  const setup: Stripe.Checkout.SessionCreateParams.LineItem = {
    price: getFoundationSetupPriceId(),
    quantity: 1,
  };
  return [recurring, setup];
}

export async function createAdvisoryCheckoutSession(
  params: OneTimeCheckoutParams
): Promise<{ sessionId: string; checkoutUrl: string }> {
  const stripe = getStripe();
  const lineItem = resolveAdvisoryLineItem();
  const site = getSiteUrl();
  const a = params.attribution || {};

  const metadata = compact({
    product: "advisory",
    lead_id: meta(params.leadId),
    first_name: meta(params.firstName),
    last_name: meta(params.lastName),
    email: meta(params.email),
    phone: meta(params.phone),
    purchase_event_id: meta(params.purchaseEventId),
    ...attributionMetadata(a),
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
        product: "advisory",
        lead_id: meta(params.leadId),
        email: meta(params.email),
      }),
    },
    // Stripe requires at least 30 minutes; 45 keeps abandoned sessions short.
    expires_at: Math.floor(Date.now() / 1000) + 45 * 60,
    success_url: `${site}${ADVISORY_THANK_YOU_PATH}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${site}${ADVISORY_OFFER_PATH}?checkout=cancelled#checkout`,
  });

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL");
  }

  return { sessionId: session.id, checkoutUrl: session.url };
}

/**
 * Firm Foundation subscription checkout: $999 one-time setup fee plus
 * $497/month, month-to-month. Terms are accepted on the Stripe page
 * (consent_collection) so the buyer never reaches the thank-you page without
 * having agreed to them.
 */
export async function createFoundationCheckoutSession(
  params: FoundationCheckoutParams
): Promise<{ sessionId: string; checkoutUrl: string }> {
  const stripe = getStripe();
  const lineItems = resolveFoundationLineItems();
  const site = getSiteUrl();
  const a = params.attribution || {};

  const metadata = compact({
    product: FOUNDATION_PRODUCT_ID,
    lead_id: meta(params.leadId),
    first_name: meta(params.firstName),
    last_name: meta(params.lastName),
    email: meta(params.email),
    phone: meta(params.phone),
    firm_name: meta(params.firmName),
    website_url: meta(params.websiteUrl),
    purchase_event_id: meta(params.purchaseEventId),
    preview_token: meta(params.previewToken),
    setup_fee: String(FOUNDATION_SETUP_FEE_VALUE),
    first_payment: String(FOUNDATION_FIRST_PAYMENT_VALUE),
    sms_marketing: params.marketingSmsOptIn ? "1" : "0",
    sms_nonmarketing: params.nonMarketingSmsOptIn ? "1" : "0",
    ...attributionMetadata(a),
  });

  const previewToken = meta(params.previewToken);
  const cancelUrl = `${site}${DEMO_OFFER_PATH}?checkout=cancelled`;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    payment_method_collection: "always",
    customer_email: params.email,
    line_items: lineItems,
    metadata,
    subscription_data: {
      metadata: compact({
        product: FOUNDATION_PRODUCT_ID,
        lead_id: meta(params.leadId),
        email: meta(params.email),
        firm_name: meta(params.firmName),
        preview_token: previewToken,
      }),
      description: `${FOUNDATION_PRODUCT_NAME} — website + client portal`,
    },
    // Stripe requires a Terms of Service URL under the account's public
    // business details before consent_collection is allowed; without it,
    // session creation fails. STRIPE_SKIP_TOS_CONSENT=1 drops the consent
    // step for local demos only. Never set it in production.
    ...(process.env.STRIPE_SKIP_TOS_CONSENT !== "1"
      ? {
          consent_collection: { terms_of_service: "required" as const },
          custom_text: {
            terms_of_service_acceptance: {
              message: `I agree to the ${FOUNDATION_PRODUCT_NAME} service terms.`,
            },
          },
        }
      : {}),
    allow_promotion_codes: false,
    billing_address_collection: "auto",
    expires_at: Math.floor(Date.now() / 1000) + 45 * 60,
    success_url: `${site}${DEMO_THANK_YOU_PATH}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
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
  sessionId: string,
  opts?: { expandSubscription?: boolean }
): Promise<Stripe.Checkout.Session> {
  const expand: string[] = [];
  if (opts?.expandSubscription) expand.push("subscription");
  return getStripe().checkout.sessions.retrieve(
    sessionId,
    expand.length ? { expand } : undefined
  );
}

export async function retrieveSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return getStripe().subscriptions.retrieve(subscriptionId);
}

/** Stripe v21 moved current_period_end onto subscription items. */
export function getSubscriptionPeriodEnd(sub: Stripe.Subscription | null | undefined): Date | null {
  const secs = sub?.items?.data?.[0]?.current_period_end;
  return typeof secs === "number" ? new Date(secs * 1000) : null;
}

export function getSessionProduct(session: Stripe.Checkout.Session): SessionProduct | null {
  const p = session.metadata?.product;
  if (p === "advisory" || p === "foundation") return p;
  return null;
}

/** True when a session represents a settled advisory calculator purchase. */
export function isPaidAdvisorySession(session: Stripe.Checkout.Session): boolean {
  return (
    session.metadata?.product === "advisory" &&
    session.mode === "payment" &&
    session.status === "complete" &&
    session.payment_status === "paid"
  );
}

/** True when a session represents an active, paid Firm Foundation subscription checkout. */
export function isPaidFoundationSession(session: Stripe.Checkout.Session): boolean {
  return (
    session.metadata?.product === FOUNDATION_PRODUCT_ID &&
    session.mode === "subscription" &&
    session.status === "complete" &&
    session.payment_status === "paid" &&
    !!session.subscription
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
