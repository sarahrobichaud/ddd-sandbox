import { integer, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "#schema/auth/users.schema";
import { COMMON_COLUMNS } from "#schema/common";
import { sql } from "drizzle-orm";
import { authSchema } from "#schemas";

export const sessions = authSchema.table("sessions", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),

  refreshToken: text("refresh_token").notNull(),
  tokenVersion: integer("token_version").notNull().default(1),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }).default(sql`NULL`),
  user_agent: text("user_agent"),
  ip_address: text("ip_address"),
  ...COMMON_COLUMNS,
});
