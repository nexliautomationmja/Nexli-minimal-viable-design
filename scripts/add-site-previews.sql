-- Firm Foundation "see your new website" previews.
-- Owned by the marketing app. Run against Neon via the console, psql, or:
--   node scripts/demo/run-sql.mjs scripts/add-site-previews.sql --env .env.local
-- Idempotent.

CREATE TABLE IF NOT EXISTS site_previews (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token         TEXT NOT NULL UNIQUE,
  lead_id       UUID REFERENCES leads(id) ON DELETE SET NULL,
  source_url    TEXT,
  status        TEXT NOT NULL DEFAULT 'pending',   -- pending | generating | ready | failed
  config        JSONB,                             -- FirmSiteConfig once ready (or fallback scaffold on failure)
  theme         TEXT NOT NULL DEFAULT 'dark',      -- dark | light (last chosen by the visitor)
  extracted     JSONB,                             -- raw facts pulled from the firm's current site
  generated_by  TEXT,                              -- claude | template
  error         TEXT,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at    TIMESTAMP
);

CREATE INDEX IF NOT EXISTS site_previews_lead_idx ON site_previews (lead_id);
CREATE INDEX IF NOT EXISTS site_previews_status_idx ON site_previews (status);

-- Link from the lead to its latest preview.
ALTER TABLE leads ADD COLUMN IF NOT EXISTS preview_token TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS preview_status TEXT;
