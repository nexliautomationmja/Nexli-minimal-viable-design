import { pgTable, text, timestamp, uuid, real, integer, index } from "drizzle-orm/pg-core";

export const vslTracking = pgTable(
  "vsl_tracking",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionId: text("session_id").notNull(),
    email: text("email"),
    eventType: text("event_type").notNull(),
    videoPosition: real("video_position").default(0).notNull(),
    videoDuration: real("video_duration").default(0).notNull(),
    completionPercentage: real("completion_percentage").default(0).notNull(),
    milestone: integer("milestone"),
    userAgent: text("user_agent"),
    ipAddress: text("ip_address"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("vsl_tracking_session_idx").on(table.sessionId),
    index("vsl_tracking_email_idx").on(table.email),
    index("vsl_tracking_created_idx").on(table.createdAt),
  ]
);
