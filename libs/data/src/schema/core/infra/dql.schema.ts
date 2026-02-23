import { core } from "#schemas";
import { integer, jsonb, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const deadLetterQueue = core.table("dead_letter_queue", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventFingerprint: text("event_fingerprint").notNull().unique(),
  eventName: text("event_name").notNull(),
  payload: jsonb("payload").notNull(),
  error: text("error").notNull(),
  attemptCount: integer("attempt_count").notNull(),
  failedAt: timestamp("failed_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
  status: text("status").notNull().default("pending"), // pending, resolved, ignored
  retryCount: integer("retry_count").notNull().default(0),
});
