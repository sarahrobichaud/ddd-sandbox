import { COMMON_COLUMNS, core, users } from "#schema/index";
import { jsonb, unique, uuid } from "drizzle-orm/pg-core";
import { text } from "drizzle-orm/pg-core";

export const presence = core.table(
  "presence",
  {
    id: uuid("id").primaryKey(),
    status: text("status").notNull().default("Preparing for takeoff"),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    ...COMMON_COLUMNS,
  },
  (table) => [unique("unique_presence_user_id").on(table.userId)]
);
