-- Migration: Create leads table for Meta lead-quality feedback system
-- Run this against your Neon PostgreSQL database via Neon console or psql.

CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Contact info
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  firm_name TEXT,
  website_url TEXT,
  firm_type TEXT,

  -- Qualification data (from QualificationProvider)
  us_based BOOLEAN,
  decision_role TEXT,
  annual_revenue TEXT,
  goal TEXT,
  goal_tag TEXT,
  problem_duration TEXT,
  budget_range TEXT,
  timeline TEXT,

  -- Lead classification
  lead_score TEXT,           -- 'raw' | 'qualified' | 'disqualified'
  disqualify_reason TEXT,

  -- Source tracking
  form_source TEXT,          -- 'qualification-gate' | 'free-guide' | 'audit' | 'revenue-calc'

  -- Attribution (from cookies/localStorage)
  fbclid TEXT,
  fbp TEXT,
  fbc TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  landing_page TEXT,
  referrer TEXT,

  -- Meta CAPI tracking
  meta_event_id TEXT,
  ip_address TEXT,
  user_agent TEXT,

  -- Consent
  marketing_sms_opt_in BOOLEAN DEFAULT FALSE,
  non_marketing_sms_opt_in BOOLEAN DEFAULT FALSE,

  -- CRM integration
  ghl_contact_id TEXT,

  -- Lifecycle stage tracking
  booked_call_at TIMESTAMP,
  showed_call_at TIMESTAMP,
  opportunity_at TIMESTAMP,
  purchased_at TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS leads_email_idx ON leads (email);
CREATE INDEX IF NOT EXISTS leads_meta_event_id_idx ON leads (meta_event_id);
CREATE INDEX IF NOT EXISTS leads_lead_score_idx ON leads (lead_score);
CREATE INDEX IF NOT EXISTS leads_created_idx ON leads (created_at);
CREATE INDEX IF NOT EXISTS leads_fbclid_idx ON leads (fbclid);
