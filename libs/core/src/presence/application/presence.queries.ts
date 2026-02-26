import z from "zod";

export const getUserPresenceSchema = z.object({
  userId: z.string(),
});

export type GetUserPresenceQuery = z.infer<typeof getUserPresenceSchema>;
