import { uuid, PgColumn, pgEnum, timestamp } from "drizzle-orm/pg-core";
import {
  ACTOR_TYPE_LIST,
  REFERENCE_TYPE_LIST,
  PROFILE_KIND_LIST,
  AVIATION_EXPERIENCE_LIST,
  SIMULATOR_TYPE_LIST,
  SKILL_LEVEL_LIST,
  ONBOARDING_STEP_LIST,
} from "#schema/values";
import { GetColumnData, sql } from "drizzle-orm";

export const COMMON_COLUMNS = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", {
    mode: "date",
    withTimezone: true,
  }),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
  version: uuid("version").notNull().defaultRandom(),
};

export const aliasedColumn = <T extends PgColumn>(column: T, alias: string) => {
  return sql<GetColumnData<T>>`${column}`.as(alias);
};

export const userAccountTypeEnum = pgEnum("user_account_type", PROFILE_KIND_LIST);
export const actorTypeEnum = pgEnum("account_type", ACTOR_TYPE_LIST);
export const refTypeEnum = pgEnum("ref_type", REFERENCE_TYPE_LIST);
export const profileKindEnum = pgEnum("profile_kind", PROFILE_KIND_LIST);
export const aviationExperienceEnum = pgEnum("aviation_experience", AVIATION_EXPERIENCE_LIST);
export const simulatorTypeEnum = pgEnum("simulator_type", SIMULATOR_TYPE_LIST);
export const skillLevelEnum = pgEnum("skill_level", SKILL_LEVEL_LIST);
export const onboardingStepEnum = pgEnum("onboarding_step", ONBOARDING_STEP_LIST);
