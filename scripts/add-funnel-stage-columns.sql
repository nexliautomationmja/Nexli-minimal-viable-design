-- Demo funnel stage tracking: which pages a lead actually reached.
-- Run against Neon via the console, psql, or:
--   node scripts/demo/run-sql.mjs scripts/add-funnel-stage-columns.sql --env .env.local
-- Idempotent.

-- Reached /demo (the sandbox). Opting in and never opening it were previously
-- indistinguishable in the CRM.
ALTER TABLE leads ADD COLUMN IF NOT EXISTS demo_viewed_at TIMESTAMP;

-- Reached /demo/call and /demo/offer. Kept separate from funnel_path: that
-- column records which pitch the qualifier ASSIGNED, these record which pitch
-- the lead was actually SHOWN. An agency lead may browse /demo/offer, so the
-- two are not interchangeable.
ALTER TABLE leads ADD COLUMN IF NOT EXISTS agency_pitch_viewed_at TIMESTAMP;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS web_pitch_viewed_at TIMESTAMP;
