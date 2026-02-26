import z from "zod";

export const loginWithEmailPassword = z.object({
  email: z.email(),
  password: z.string().min(6),
  metadata: z.object({
    ipAddress: z.string().default("unknown"),
    userAgent: z.string().default("unknown"),
  }),
});

export type LoginWithEmailPasswordCommand = z.infer<typeof loginWithEmailPassword>;

export const registerWithEmailPassword = z.object({
  username: z.string(),
  email: z.email(),
  password: z.string(),
});

export type RegisterWithEmailPasswordCommand = z.infer<typeof registerWithEmailPassword>;

export const exchangeRefreshToken = z.object({
  refreshToken: z.string(),
  metadata: z.object({
    ipAddress: z.string().default("unknown"),
    userAgent: z.string().default("unknown"),
  }),
});

export type ExchangeRefreshTokenCommand = z.infer<typeof exchangeRefreshToken>;

export const revokeSession = z.object({
  sessionId: z.string(),
});

export type RevokeSessionCommand = z.infer<typeof revokeSession>;
