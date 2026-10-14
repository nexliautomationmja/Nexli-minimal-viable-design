-- High-Ticket Advisory Pricing Calculator ($297 one-time) purchase columns.
-- Replaces the retired roadmap pair, which is deliberately left in place for
-- now: nexli-portal's src/db/external-schema.ts still mirrors those two
-- columns and does a bare select on leads, so dropping them before that ships
-- would break the live portal for Firm Foundation subscribers.
--
-- Run against Neon via the console, psql, or:
--   node scripts/demo/run-sql.mjs scripts/add-advisory-purchase-columns.sql --env .env.local
-- Idempotent.

ALTER TABLE leads ADD COLUMN IF NOT EXISTS advisory_purchased_at TIMESTAMP;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS advisory_amount_cents INTEGER;

-- The funnel gate reads this column on every qualifier and calendar request.
CREATE INDEX IF NOT EXISTS leads_advisory_purchased_idx
  ON leads (advisory_purchased_at)
  WHERE advisory_purchased_at IS NOT NULL;
