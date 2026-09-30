-- Firm Foundation setup fee: $999 one-time charged with the first month.
-- Run against Neon via the console, psql, or:
--   node scripts/demo/run-sql.mjs scripts/add-setup-fee-columns.sql --env .env.local
-- Idempotent.

ALTER TABLE leads ADD COLUMN IF NOT EXISTS setup_fee_cents INTEGER;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS first_payment_cents INTEGER;

-- Which side of the demo funnel's qualifier split the lead landed on:
-- 'agency' (qualified, pitched the call) or 'web' (self-serve website + portal).
ALTER TABLE leads ADD COLUMN IF NOT EXISTS funnel_path TEXT;

-- GoHighLevel contact id, so later events update the same contact instead of
-- relying on email matching. Column already declared in the schema but never
-- written; the new lib/ghl.ts fills it in.
ALTER TABLE leads ADD COLUMN IF NOT EXISTS ghl_contact_id TEXT;

CREATE INDEX IF NOT EXISTS leads_funnel_path_idx ON leads (funnel_path);
