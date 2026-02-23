import { COMMON_COLUMNS } from "#schema/common";
import { PROVIDER_TYPE_LIST } from "#schema/values";
import { uuid, text, unique, timestamp, index } from "drizzle-orm/pg-core";
import { authSchema } from "#schemas";
import { users } from "#schema/auth/users.schema";

export const authProviderType = authSchema.enum("auth_provider_type", PROVIDER_TYPE_LIST);

export const authProviders = authSchema.table(
  "auth_providers",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    providerType: authProviderType("provider_type").notNull(),
    providerUserId: text("provider_user_id").notNull(),
    email: text("email"),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    linkedAt: timestamp("linked_at").defaultNow().notNull(),
    ...COMMON_COLUMNS,
  },
  (table) => [
    // Prevent a user from linking the same provider type twice
    unique("unique_user_provider").on(table.userId, table.providerType),
    // Ensure provider user ID is unique per provider type globally
    unique("unique_provider_user_id").on(table.providerUserId, table.providerType),
    // Index for efficient lookups of user's providers
    index("idx_auth_providers_user_id").on(table.userId),
  ]
);
