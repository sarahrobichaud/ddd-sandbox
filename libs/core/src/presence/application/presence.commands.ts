import z from "zod";

export const updateStatusSchema = z.object({
  userId: z.string(),
  status: z.string(),
});

export type UpdateStatusCommand = z.infer<typeof updateStatusSchema>;
