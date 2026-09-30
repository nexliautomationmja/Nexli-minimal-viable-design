import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // `leads` is owned by the marketing app (repo root, lib/leads-schema.ts) and
  // lives in the same Neon database. Excluding it here guarantees drizzle-kit
  // push/generate can never drop or alter the marketing app's columns.
  tablesFilter: ["!leads"],
});
