import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  integer,
  index,
} from "drizzle-orm/pg-core";

// Mirrored (read-only) in dashboard/src/db/external-schema.ts. Add new
// columns in both places and ship them via scripts/*.sql.

export const leads = pgTable(
  "leads",
  {
    // Primary key
    id: uuid("id").defaultRandom().primaryKey(),

    // Contact info
    email: text("email"),
    firstName: text("first_name"),
    lastName: text("last_name"),
    phone: text("phone"),
    firmName: text("firm_name"),
    websiteUrl: text("website_url"),
    firmType: text("firm_type"),

    // Qualification data (from QualificationProvider)
    usBased: boolean("us_based"),
    decisionRole: text("decision_role"),
    annualRevenue: text("annual_revenue"),
    goal: text("goal"),
    goalTag: text("goal_tag"),
    problemDuration: text("problem_duration"),
    budgetRange: text("budget_range"),
    timeline: text("timeline"),
    taxSavings: text("tax_savings"),
    taxSavingsTag: text("tax_savings_tag"),

    // Advisory funnel's last qualifier question — what they can invest per
    // month. Null on every other funnel, which has no budget question.
    budget: text("budget"),

    // Lead classification
    leadScore: text("lead_score"), // 'raw' | 'qualified' | 'disqualified'
    disqualifyReason: text("disqualify_reason"),

    // Source tracking
    formSource: text("form_source"), // 'qualification-gate' | 'free-guide' | 'audit' | 'revenue-calc' | 'roadmap' | 'advisory-qualifier' | 'vsl-booking' (older rows: 'foundation', 'foundation-preview')

    // Attribution (from cookies/localStorage)
    fbclid: text("fbclid"),
    fbp: text("fbp"),
    fbc: text("fbc"),
    utmSource: text("utm_source"),
    utmMedium: text("utm_medium"),
    utmCampaign: text("utm_campaign"),
    utmTerm: text("utm_term"),
    utmContent: text("utm_content"),
    landingPage: text("landing_page"),
    referrer: text("referrer"),

    // Meta CAPI tracking
    metaEventId: text("meta_event_id"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),

    // Consent
    marketingSmsOptIn: boolean("marketing_sms_opt_in").default(false),
    nonMarketingSmsOptIn: boolean("non_marketing_sms_opt_in").default(false),

    // CRM integration
    ghlContactId: text("ghl_contact_id"),

    // Demo funnel split: 'agency' (booking call) | 'web' (self-serve site + portal)
    funnelPath: text("funnel_path"),

    // Demo funnel stage tracking — which pages the lead actually reached.
    // Distinct from funnelPath: that is the pitch the qualifier ASSIGNED,
    // these are the pitches the lead was SHOWN. An agency lead may browse
    // /demo/offer, so the two are not interchangeable.
    demoViewedAt: timestamp("demo_viewed_at"),
    agencyPitchViewedAt: timestamp("agency_pitch_viewed_at"),
    webPitchViewedAt: timestamp("web_pitch_viewed_at"),

    // Lifecycle stage tracking
    bookedCallAt: timestamp("booked_call_at"),
    showedCallAt: timestamp("showed_call_at"),
    opportunityAt: timestamp("opportunity_at"),
    purchasedAt: timestamp("purchased_at"),

    // Low-ticket ($297 Advisory Pricing Calculator) purchase — kept separate
    // from the high-ticket purchased_at signal so Meta reporting stays clean.
    // Also the gate for the qualifier and the calendar: a Stripe session id in
    // a URL is a weak permanent credential, so entitlement is read from here.
    advisoryPurchasedAt: timestamp("advisory_purchased_at"),
    advisoryAmountCents: integer("advisory_amount_cents"),

    // Retired $97 roadmap funnel. Never written to (0 rows). Kept only because
    // nexli-portal's external-schema.ts still mirrors them and does a bare
    // select on leads — dropping them before that ships breaks the live portal.
    // TODO: drop after the portal PR removing them is deployed.
    roadmapPurchasedAt: timestamp("roadmap_purchased_at"),
    roadmapAmountCents: integer("roadmap_amount_cents"),
    stripeCheckoutSessionId: text("stripe_checkout_session_id"),
    stripePaymentIntentId: text("stripe_payment_intent_id"),

    // The Firm Foundation product ($497/mo website + portal) was retired on
    // 2026-11-19 (Marcel) and its 14 columns came out of this schema:
    // foundation_subscribed_at, stripe_customer_id, stripe_subscription_id,
    // subscription_status, subscription_current_period_end, provisioned_at,
    // provisioning_status, provisioning_error, setup_fee_cents,
    // first_payment_cents, onboarding_intake, kickoff_booked_at,
    // preview_token, preview_status. They are STILL IN THE DATABASE: the live
    // portal (nexli-portal's external-schema.ts) mirrors the leads table and
    // selects every column, so dropping them before the portal stops
    // mirroring them would break it. Drop them, and the site_previews table,
    // only after that portal change is deployed. Nothing here reads them.

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("leads_email_idx").on(table.email),
    index("leads_meta_event_id_idx").on(table.metaEventId),
    index("leads_lead_score_idx").on(table.leadScore),
    index("leads_created_idx").on(table.createdAt),
    index("leads_fbclid_idx").on(table.fbclid),
  ]
);
