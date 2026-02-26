import { AuthAwareAction } from "#shared/application/auth-aware-command";
import { UseCaseCtxOld } from "#shared/application/use-case";
import { PresenceDeps } from "#shared/types/dependencies";
import { SKILL_LEVEL_LIST, VALUE } from "#values";
import z from "zod";

export type PresenceArgs<Input, K extends keyof PresenceDeps = never> = UseCaseCtxOld<
  AuthAwareAction<Input>,
  PresenceDeps,
  K
>;

export const onboardingPresenceDataSchema = z.object({
  userId: z.uuid(),
  displayName: z.string(),
  homeAirport: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  pronouns: z.string(),
  experienceLevel: z.enum(VALUE.SKILL_LEVEL_LIST),
});
