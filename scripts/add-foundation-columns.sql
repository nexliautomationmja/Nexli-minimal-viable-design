-- Firm Foundation ($497/mo website + client portal) subscription columns.
-- Run this against your Neon PostgreSQL database via Neon console or psql.
-- Idempotent: safe to run more than once.

ALTER TABLE leads ADD COLUMN IF NOT EXISTS foundation_subscribed_at TIMESTAMP;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS subscription_status TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMP;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS provisioned_at TIMESTAMP;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS provisioning_status TEXT;   -- pending | ok | failed
ALTER TABLE leads ADD COLUMN IF NOT EXISTS provisioning_error TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS onboarding_intake JSONB;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS kickoff_booked_at TIMESTAMP;

-- One lead per Stripe subscription; makes the webhook idempotent under retries.
CREATE UNIQUE INDEX IF NOT EXISTS leads_stripe_subscription_idx
  ON leads (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS leads_stripe_customer_idx
  ON leads (stripe_customer_id);

CREATE INDEX IF NOT EXISTS leads_foundation_subscribed_idx
  ON leads (foundation_subscribed_at)
  WHERE foundation_subscribed_at IS NOT NULL;
