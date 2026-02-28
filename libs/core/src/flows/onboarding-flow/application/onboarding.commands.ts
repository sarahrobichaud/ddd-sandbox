import { VALUE } from "#values";
import { z } from "zod";

export const initializeOnboardindSchema = z.object({
  userId: z.uuid(),
});

export const completeWelcomeStepSchema = z.object({
  userId: z.uuid(),
});

export const completePresenceStepSchema = z.object({
  userId: z.uuid(),
  presenceData: z.object({
    displayName: z.string().min(3).max(30).trim(),
    firstName: z.string().max(64).trim(),
    lastName: z.string().max(64).trim(),
    pronouns: z.string().max(20).trim(),
    experienceLevel: z.enum(VALUE.SKILL_LEVEL_LIST),
    homeAirport: z.string().length(4).trim(),
  }),
});

export const completeOnboardingSchema = z.object({
  userId: z.uuid(),
});

export type InitializeOnboardingCommand = z.infer<typeof initializeOnboardindSchema>;
export type CompleteWelcomeStepCommand = z.infer<typeof completeWelcomeStepSchema>;
export type CompletePresenceStepCommand = z.infer<typeof completePresenceStepSchema>;
export type CompleteOnboardingCommand = z.infer<typeof completeOnboardingSchema>;
