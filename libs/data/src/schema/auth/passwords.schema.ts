import { text, uuid } from "drizzle-orm/pg-core";
import { authProviders } from "#schema/auth/auth-provider.schema";
import { COMMON_COLUMNS } from "#schema/common";
import { authSchema } from "#schemas";

export const passwords = authSchema.table("passwords", {
  authProviderId: uuid("auth_provider_id")
    .primaryKey()
    .references(() => authProviders.id),
  passwordHash: text("password_hash"),
  ...COMMON_COLUMNS,
});
