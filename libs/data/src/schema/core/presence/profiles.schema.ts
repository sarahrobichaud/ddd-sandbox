import { uuid, text, foreignKey, unique, index } from "drizzle-orm/pg-core";
import {
  aviationExperienceEnum,
  COMMON_COLUMNS,
  profileKindEnum,
  simulatorTypeEnum,
  skillLevelEnum,
} from "#schema/common";
import { core } from "#schemas";
import { presence } from "#schema/core/presence/presence.schema";

export const profiles = core.table(
  "profiles",
  {
    // Relationships
    id: uuid("id").primaryKey(),
    userPresenceId: uuid("user_presence_id")
      .notNull()
      .references(() => presence.id, { onDelete: "cascade" }),

    profileKind: profileKindEnum("profile_kind").notNull(),
    organizationId: uuid("organization_id"),

    // Details
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    pronouns: text("pronouns").notNull().default(""),
    displayName: text("username").notNull(),
    homeAirport: text("home_airport").notNull(),
    aviationExperience: aviationExperienceEnum("aviation_experience").notNull(),
    simulatorType: simulatorTypeEnum("simulator_type").notNull(),
    skillLevel: skillLevelEnum("skill_level").notNull(),

    // References
    ...COMMON_COLUMNS,
  },
  (table) => [
    unique("unique_display_name_per_org").on(table.organizationId, table.displayName),

    index("idx_profiles_user_presence_id").on(table.userPresenceId),
    index("idx_profiles_organization_id").on(table.organizationId),
  ]
);

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
