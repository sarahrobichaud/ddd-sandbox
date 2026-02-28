import { z } from "zod";

export const getOnboardingStatus = z.object({
  userId: z.string(),
});

export type GetOnboardingStatusQuery = z.infer<typeof getOnboardingStatus>;
