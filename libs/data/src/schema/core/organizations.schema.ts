import { uuid, text } from "drizzle-orm/pg-core";
import { COMMON_COLUMNS } from "#schema/common";
import { users } from "#schema/auth/users.schema";
import { core } from "#schemas";

export const organizations = core.table("organizations", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  ownerUserId: uuid("owner_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  ...COMMON_COLUMNS,
});
