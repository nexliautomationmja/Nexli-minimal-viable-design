/**
 * READ-ONLY MIRROR of the `firm_sites` table, which is OWNED BY THE DASHBOARD
 * APP (dashboard/src/db/schema.ts). Both apps share one Neon database.
 *
 * The marketing app only reads this table to render /sites/<slug> and custom
 * domains at request time. Never generate migrations from this file; the
 * migration lives at dashboard/scripts/add-firm-sites.sql. Keep the columns
 * in sync with the dashboard definition.
 */
import { pgTable, text, timestamp, uuid, jsonb, index } from "drizzle-orm/pg-core";
import type { FirmSiteConfig } from "./firm-sites/types";

export const firmSites = pgTable(
  "firm_sites",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerUserId: uuid("owner_user_id").notNull().unique(),
    slug: text("slug").notNull().unique(),
    domain: text("domain").unique(),
    status: text("status").notNull().default("draft"), // 'draft' | 'published'
    config: jsonb("config").$type<FirmSiteConfig>().notNull(),
    previewToken: text("preview_token").notNull().unique(),
    generatedBy: text("generated_by").notNull().default("template"), // 'claude' | 'template' | 'manual'
    generationNotes: text("generation_notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    publishedAt: timestamp("published_at"),
  },
  (table) => [index("firm_sites_status_idx").on(table.status)]
);

export type FirmSiteRow = typeof firmSites.$inferSelect;
