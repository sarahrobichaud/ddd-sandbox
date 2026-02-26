import z from "zod";

export const getCurrentUser = z.undefined();

export type GetCurrentUserQuery = z.infer<typeof getCurrentUser>;

export const getActiveSessions = z.undefined();

export type GetActiveSessionsQuery = z.infer<typeof getActiveSessions>;
