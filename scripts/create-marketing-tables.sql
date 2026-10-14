-- Marketing-site tables, missing from the production Neon branch.
-- Generated from the working tables; safe to re-run (IF NOT EXISTS throughout).
-- Run against the branch Vercel's production DATABASE_URL points at
-- (endpoint ep-orange-boat-ahqbz6yx).

-- ── leads ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "leads" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "email" text,
  "first_name" text,
  "last_name" text,
  "phone" text,
  "firm_name" text,
  "website_url" text,
  "firm_type" text,
  "us_based" boolean,
  "decision_role" text,
  "annual_revenue" text,
  "goal" text,
  "goal_tag" text,
  "problem_duration" text,
  "budget_range" text,
  "timeline" text,
  "tax_savings" text,
  "tax_savings_tag" text,
  "lead_score" text,
  "disqualify_reason" text,
  "form_source" text,
  "fbclid" text,
  "fbp" text,
  "fbc" text,
  "utm_source" text,
  "utm_medium" text,
  "utm_campaign" text,
  "utm_term" text,
  "utm_content" text,
  "landing_page" text,
  "referrer" text,
  "meta_event_id" text,
  "ip_address" text,
  "user_agent" text,
  "marketing_sms_opt_in" boolean DEFAULT false,
  "non_marketing_sms_opt_in" boolean DEFAULT false,
  "ghl_contact_id" text,
  "booked_call_at" timestamp,
  "showed_call_at" timestamp,
  "opportunity_at" timestamp,
  "purchased_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "roadmap_purchased_at" timestamp,
  "roadmap_amount_cents" integer,
  "stripe_checkout_session_id" text,
  "stripe_payment_intent_id" text,
  "foundation_subscribed_at" timestamp,
  "stripe_customer_id" text,
  "stripe_subscription_id" text,
  "subscription_status" text,
  "subscription_current_period_end" timestamp,
  "provisioned_at" timestamp,
  "provisioning_status" text,
  "provisioning_error" text,
  "onboarding_intake" jsonb,
  "kickoff_booked_at" timestamp,
  "preview_token" text,
  "preview_status" text,
  "setup_fee_cents" integer,
  "first_payment_cents" integer,
  "funnel_path" text,
  "demo_viewed_at" timestamp,
  "agency_pitch_viewed_at" timestamp,
  "web_pitch_viewed_at" timestamp,
  "advisory_purchased_at" timestamp,
  "advisory_amount_cents" integer,
  CONSTRAINT "leads_pkey" PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS leads_email_idx ON public.leads USING btree (email);
CREATE INDEX IF NOT EXISTS leads_meta_event_id_idx ON public.leads USING btree (meta_event_id);
CREATE INDEX IF NOT EXISTS leads_lead_score_idx ON public.leads USING btree (lead_score);
CREATE INDEX IF NOT EXISTS leads_created_idx ON public.leads USING btree (created_at);
CREATE INDEX IF NOT EXISTS leads_fbclid_idx ON public.leads USING btree (fbclid);
CREATE INDEX IF NOT EXISTS leads_tax_savings_tag_idx ON public.leads USING btree (tax_savings_tag);
CREATE UNIQUE INDEX IF NOT EXISTS leads_stripe_checkout_session_idx ON public.leads USING btree (stripe_checkout_session_id) WHERE (stripe_checkout_session_id IS NOT NULL);
CREATE INDEX IF NOT EXISTS leads_roadmap_purchased_idx ON public.leads USING btree (roadmap_purchased_at);
CREATE UNIQUE INDEX IF NOT EXISTS leads_stripe_subscription_idx ON public.leads USING btree (stripe_subscription_id) WHERE (stripe_subscription_id IS NOT NULL);
CREATE INDEX IF NOT EXISTS leads_stripe_customer_idx ON public.leads USING btree (stripe_customer_id);
CREATE INDEX IF NOT EXISTS leads_foundation_subscribed_idx ON public.leads USING btree (foundation_subscribed_at) WHERE (foundation_subscribed_at IS NOT NULL);
CREATE INDEX IF NOT EXISTS leads_funnel_path_idx ON public.leads USING btree (funnel_path);
CREATE INDEX IF NOT EXISTS leads_advisory_purchased_idx ON public.leads USING btree (advisory_purchased_at) WHERE (advisory_purchased_at IS NOT NULL);

-- ── vsl_tracking ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "vsl_tracking" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "session_id" text NOT NULL,
  "email" text,
  "event_type" text NOT NULL,
  "video_position" real DEFAULT 0 NOT NULL,
  "video_duration" real DEFAULT 0 NOT NULL,
  "completion_percentage" real DEFAULT 0 NOT NULL,
  "milestone" integer,
  "user_agent" text,
  "ip_address" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "vsl_tracking_pkey" PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS vsl_tracking_session_idx ON public.vsl_tracking USING btree (session_id);
CREATE INDEX IF NOT EXISTS vsl_tracking_email_idx ON public.vsl_tracking USING btree (email);
CREATE INDEX IF NOT EXISTS vsl_tracking_created_idx ON public.vsl_tracking USING btree (created_at);

-- ── firm_sites ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "firm_sites" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "owner_user_id" uuid NOT NULL,
  "slug" text NOT NULL,
  "domain" text,
  "status" text DEFAULT 'draft'::text NOT NULL,
  "config" jsonb NOT NULL,
  "preview_token" text NOT NULL,
  "generated_by" text DEFAULT 'template'::text NOT NULL,
  "generation_notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "published_at" timestamp,
  CONSTRAINT "firm_sites_pkey" PRIMARY KEY (id),
  CONSTRAINT "firm_sites_owner_user_id_key" UNIQUE (owner_user_id),
  CONSTRAINT "firm_sites_slug_key" UNIQUE (slug),
  CONSTRAINT "firm_sites_domain_key" UNIQUE (domain),
  CONSTRAINT "firm_sites_preview_token_key" UNIQUE (preview_token)
);
CREATE INDEX IF NOT EXISTS firm_sites_status_idx ON public.firm_sites USING btree (status);

-- ── site_previews ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "site_previews" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "token" text NOT NULL,
  "lead_id" uuid,
  "source_url" text,
  "status" text DEFAULT 'pending'::text NOT NULL,
  "config" jsonb,
  "theme" text DEFAULT 'dark'::text NOT NULL,
  "extracted" jsonb,
  "generated_by" text,
  "error" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "expires_at" timestamp,
  CONSTRAINT "site_previews_pkey" PRIMARY KEY (id),
  CONSTRAINT "site_previews_token_key" UNIQUE (token)
);
CREATE INDEX IF NOT EXISTS site_previews_lead_idx ON public.site_previews USING btree (lead_id);
CREATE INDEX IF NOT EXISTS site_previews_status_idx ON public.site_previews USING btree (status);

