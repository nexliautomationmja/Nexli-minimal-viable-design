import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { leads } from "./leads-schema";
import { getSubscriptionPeriodEnd, type Stripe } from "./stripe";
import { FOUNDATION_PRODUCT_ID } from "./foundation-config";

// ---------------------------------------------------------------------------
// Bridge to the dashboard app's internal provisioning API. The dashboard
// creates the firm's portal account, sends the service agreement to e-sign,
// and emails the set-password link. Everything here is best-effort and
// idempotent on the dashboard side (keyed by email / subscription id).
// ---------------------------------------------------------------------------

export type ProvisionSource = "stripe-webhook" | "thank-you" | "invoice-paid";

type Lead = typeof leads.$inferSelect;

export interface ProvisionArgs {
  lead: Lead | null;
  session: Stripe.Checkout.Session;
  subscription: Stripe.Subscription | null;
  source: ProvisionSource;
}

export interface ProvisionResult {
  ok: boolean;
  error?: string;
}

interface DashboardProvisionResponse {
  ok?: boolean;
  userId?: string;
  created?: boolean;
  steps?: unknown;
  errors?: string[];
  /** The buyer's Launch Pad on the portal, once the agreement token exists. */
  onboardingUrl?: string;
}

const TIMEOUT_MS = 8000;
const RETRY_DELAYS_MS = [0, 2000, 5000];

function internalConfig(): { url: string; secret: string } | null {
  const url = (process.env.DASHBOARD_INTERNAL_URL || "").replace(/\/+$/, "");
  const secret = process.env.PROVISION_SECRET || "";
  if (!url || !secret) return null;
  return { url, secret };
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

class NonRetryableError extends Error {}

async function postInternal<T>(
  path: string,
  body: unknown,
  attempts: number
): Promise<T> {
  const cfg = internalConfig();
  if (!cfg) throw new NonRetryableError("dashboard internal url/secret not configured");

  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    if (RETRY_DELAYS_MS[i]) await sleep(RETRY_DELAYS_MS[i]);
    try {
      const res = await fetch(`${cfg.url}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-provision-secret": cfg.secret,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });

      if (res.ok) {
        return (await res.json().catch(() => ({}))) as T;
      }
      const text = await res.text().catch(() => "");
      if (res.status >= 400 && res.status < 500) {
        // Bad request / bad secret: retrying will not help.
        throw new NonRetryableError(`dashboard ${path} ${res.status}: ${text.slice(0, 300)}`);
      }
      lastErr = new Error(`dashboard ${path} ${res.status}: ${text.slice(0, 300)}`);
    } catch (err) {
      if (err instanceof NonRetryableError) throw err;
      lastErr = err; // network / timeout → retry
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

/**
 * Merge keys into leads.onboarding_intake without clobbering what is there.
 * JSONB, so no migration — and the portal reads this column already.
 */
async function mergeOnboardingIntake(leadId: string, patch: Record<string, unknown>) {
  const db = getDb();
  if (!db) return;
  try {
    const [row] = await db
      .select({ intake: leads.onboardingIntake })
      .from(leads)
      .where(eq(leads.id, leadId))
      .limit(1);
    const existing = (row?.intake as Record<string, unknown> | null) ?? {};
    await db
      .update(leads)
      .set({ onboardingIntake: { ...existing, ...patch }, updatedAt: new Date() })
      .where(eq(leads.id, leadId));
  } catch (err) {
    console.error("[Foundation Provision] intake merge failed:", err);
  }
}

async function markLead(
  leadId: string | undefined,
  patch: Partial<typeof leads.$inferInsert>
) {
  if (!leadId) return;
  const db = getDb();
  if (!db) return;
  try {
    await db
      .update(leads)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(leads.id, leadId));
  } catch (err) {
    console.error("[Foundation Provision] lead update failed:", err);
  }
}

/**
 * Ask the dashboard to create/refresh the customer's portal account.
 * Writes provisioning_status / provisioning_error / provisioned_at on the lead.
 */
export async function provisionFoundationCustomer({
  lead,
  session,
  subscription,
  source,
}: ProvisionArgs): Promise<ProvisionResult> {
  const m = session.metadata || {};
  const email = (lead?.email || m.email || session.customer_details?.email || "")
    .trim()
    .toLowerCase();

  if (!email) {
    const error = "no email on lead or session";
    await markLead(lead?.id, { provisioningStatus: "failed", provisioningError: error });
    return { ok: false, error };
  }

  const stripeCustomerId =
    lead?.stripeCustomerId ||
    (typeof session.customer === "string" ? session.customer : session.customer?.id) ||
    subscription?.customer?.toString() ||
    "";
  const stripeSubscriptionId =
    lead?.stripeSubscriptionId ||
    subscription?.id ||
    (typeof session.subscription === "string" ? session.subscription : session.subscription?.id) ||
    "";

  const periodEnd = getSubscriptionPeriodEnd(subscription) || lead?.subscriptionCurrentPeriodEnd || null;
  const startedAt = subscription?.start_date
    ? new Date(subscription.start_date * 1000)
    : lead?.foundationSubscribedAt || new Date();

  const payload = {
    email,
    firstName: lead?.firstName || m.first_name || session.customer_details?.name?.split(" ")[0] || "",
    lastName: lead?.lastName || m.last_name || "",
    firmName: lead?.firmName || m.firm_name || "",
    phone: lead?.phone || m.phone || session.customer_details?.phone || "",
    websiteUrl: lead?.websiteUrl || m.website_url || undefined,
    tier: FOUNDATION_PRODUCT_ID,
    stripeCustomerId,
    stripeSubscriptionId,
    subscriptionStatus: subscription?.status || lead?.subscriptionStatus || "active",
    subscriptionCurrentPeriodEnd: periodEnd ? periodEnd.toISOString() : null,
    subscriptionStartedAt: startedAt.toISOString(),
    sendAgreement: true,
    sendWelcome: true,
    source,
  };

  if (!internalConfig()) {
    const error = "dashboard internal url/secret not configured";
    console.warn(`[Foundation Provision] ${error} — skipping provisioning for ${email}`);
    await markLead(lead?.id, { provisioningStatus: "failed", provisioningError: error });
    return { ok: false, error };
  }

  try {
    const res = await postInternal<DashboardProvisionResponse>(
      "/api/internal/provision",
      payload,
      RETRY_DELAYS_MS.length
    );
    if (res.ok === false) {
      const error = (res.errors || []).join("; ") || "dashboard reported failure";
      console.error(`[Foundation Provision] dashboard returned ok=false for ${email}: ${error}`);
      await markLead(lead?.id, { provisioningStatus: "failed", provisioningError: error.slice(0, 1000) });
      return { ok: false, error };
    }
    console.log(
      `[Foundation Provision] ${source}: provisioned ${email} (userId=${res.userId ?? "?"}, created=${res.created ?? "?"})`
    );
    await markLead(lead?.id, {
      provisioningStatus: "ok",
      provisioningError: null,
      provisionedAt: new Date(),
    });
    // Stash the Launch Pad link so the thank-you page can hand off to it.
    // onboarding_intake is JSONB, so this needs no migration.
    if (typeof res.onboardingUrl === "string" && res.onboardingUrl && lead?.id) {
      await mergeOnboardingIntake(lead.id, { onboardingUrl: res.onboardingUrl });
    }
    return { ok: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error(`[Foundation Provision] ${source}: failed for ${email}:`, error);
    await markLead(lead?.id, { provisioningStatus: "failed", provisioningError: error.slice(0, 1000) });
    return { ok: false, error };
  }
}

export interface SubscriptionStatusPush {
  stripeSubscriptionId: string;
  stripeCustomerId?: string | null;
  status: string;
  currentPeriodEnd?: Date | null;
}

/** Fire-and-forget mirror of subscription state into the dashboard (one retry). */
export function pushSubscriptionStatus(args: SubscriptionStatusPush): void {
  if (!internalConfig()) {
    console.warn("[Foundation Provision] dashboard internal url/secret not configured — skipping subscription-status push");
    return;
  }
  postInternal<{ ok?: boolean; updated?: boolean }>(
    "/api/internal/subscription-status",
    {
      stripeSubscriptionId: args.stripeSubscriptionId,
      stripeCustomerId: args.stripeCustomerId || undefined,
      status: args.status,
      currentPeriodEnd: args.currentPeriodEnd ? args.currentPeriodEnd.toISOString() : undefined,
    },
    2
  ).catch((err) => {
    console.error("[Foundation Provision] subscription-status push failed:", err instanceof Error ? err.message : err);
  });
}
