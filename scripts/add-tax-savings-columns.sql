-- Migration: Add tax-planning value columns to the leads table
-- Adds the answer + derived segment tag from the qualification gate's
-- "What's the most you've ever saved a single client through tax planning?" step.
-- Idempotent — safe to re-run. Run against your Neon PostgreSQL database via
-- the Neon console or psql.

ALTER TABLE leads ADD COLUMN IF NOT EXISTS tax_savings TEXT;       -- e.g. '100k-plus' | '50k-100k' | '10k-50k' | 'under-10k'
ALTER TABLE leads ADD COLUMN IF NOT EXISTS tax_savings_tag TEXT;   -- e.g. 'taxplan_elite' | 'taxplan_strong' | 'taxplan_developing' | 'taxplan_compliance'

-- Optional: index the segment tag if you plan to filter/report on it
CREATE INDEX IF NOT EXISTS leads_tax_savings_tag_idx ON leads (tax_savings_tag);
