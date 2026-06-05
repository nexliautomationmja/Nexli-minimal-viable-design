import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  index,
} from "drizzle-orm/pg-core";

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

    // Lead classification
    leadScore: text("lead_score"), // 'raw' | 'qualified' | 'disqualified'
    disqualifyReason: text("disqualify_reason"),

    // Source tracking
    formSource: text("form_source"), // 'qualification-gate' | 'free-guide' | 'audit' | 'revenue-calc'

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

    // Lifecycle stage tracking
    bookedCallAt: timestamp("booked_call_at"),
    showedCallAt: timestamp("showed_call_at"),
    opportunityAt: timestamp("opportunity_at"),
    purchasedAt: timestamp("purchased_at"),

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
