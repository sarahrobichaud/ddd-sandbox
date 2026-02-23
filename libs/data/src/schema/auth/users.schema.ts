import { uuid, text, unique } from "drizzle-orm/pg-core";
import { COMMON_COLUMNS } from "#schema/common";
import { profiles } from "#schema/core/presence/profiles.schema";
import { authSchema } from "#schemas";

export const users = authSchema.table(
  "users",
  {
    id: uuid("id").primaryKey(),
    primaryProfileId: uuid("primary_profile_id"),
    status: text("status").default("ACTIVE"),
    primaryEmail: text("primary_email").notNull().unique(),
    username: text("username").notNull(),
    usernameDiscriminator: text("username_discriminator").notNull(),
    ...COMMON_COLUMNS,
  },
  (table) => [unique("unique_username_per_discriminator").on(table.username, table.usernameDiscriminator)]
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
