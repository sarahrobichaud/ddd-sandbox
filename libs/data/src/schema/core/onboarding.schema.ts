import { uuid, text, boolean, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { COMMON_COLUMNS, onboardingStepEnum } from "#schema/common";
import { users } from "#schema/auth/users.schema";
import { core } from "#schemas";
import { OnboardingStep, SkillLevel } from "#schema/values";

export const onboardingProgress = core.table(
  "onboarding_progress",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),

    // Step tracking
    currentStep: onboardingStepEnum("current_step").notNull().default("WELCOME"),
    completedSteps: jsonb("completed_steps").$type<OnboardingStep[]>().notNull().default([]),
    isCompleted: boolean("is_completed").notNull().default(false),

    // Presence data collected during onboarding
    presenceData: jsonb("presence_data").$type<OnboardingPresenceData>(),

    // Timestamps
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),

    ...COMMON_COLUMNS,
  },
  (table) => [
    index("idx_onboarding_user_id").on(table.userId),
    index("idx_onboarding_completed").on(table.isCompleted),
    index("idx_onboarding_current_step").on(table.currentStep),
  ]
);

export type OnboardingPresenceData = {
  displayName: string;
  firstName: string;
  lastName: string;
  pronouns: string;
  experienceLevel: SkillLevel;
  homeAirport: string;
};
