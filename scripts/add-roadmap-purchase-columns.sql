-- Migration: Add low-ticket (CPA Scaling Roadmap) purchase columns to the leads table.
-- Keeps purchased_at reserved for the high-ticket "won" signal from GHL.
-- Idempotent — safe to re-run. Run against your Neon PostgreSQL database via
-- the Neon console or psql.

ALTER TABLE leads ADD COLUMN IF NOT EXISTS roadmap_purchased_at TIMESTAMP;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS roadmap_amount_cents INTEGER;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

-- Partial unique index: makes the Stripe webhook idempotent even under
-- concurrent retries (a second write with the same session id fails loudly).
CREATE UNIQUE INDEX IF NOT EXISTS leads_stripe_checkout_session_idx
  ON leads (stripe_checkout_session_id)
  WHERE stripe_checkout_session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS leads_roadmap_purchased_idx ON leads (roadmap_purchased_at);
