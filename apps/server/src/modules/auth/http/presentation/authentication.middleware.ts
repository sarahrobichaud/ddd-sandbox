import { mapUseCaseResult } from "#root/lib/http-response-mapper";
import { AppContext, HorizonFSState } from "#types/koa";
import { SignableTokenServicePort } from "@cavok/core/auth";
import { Middleware } from "koa";

/**
 * Creates a middleware for the authentication module
 * @param tokens - The signable token service
 * @returns The middleware for the authentication module
 */
export function createAuthMiddleware(tokens: SignableTokenServicePort) {
  return {
    /**
     * Reads the the identity of a user from the authorization header
     * @param ctx - The Koa context
     * @param next - The next middleware function
     * @returns The next middleware function
     */
    identify: async (ctx, next) => {
      const authHeader = ctx.headers["authorization"];

      const token = authHeader?.slice("Bearer ".length);
      const identity = token ? await tokens.verify(token) : null;

      if (identity) {
        ctx.state.identity = {
          sessionId: identity.sessionId,
          email: identity.email,
          profileId: identity.profileId,
          username: identity.username,
          userId: identity.userId,
          isOnboarded: identity.isOnboarded,
        };
      }
      console.log(ctx.state.identity);

      return next();
    },
    /**
     * Requires the identity of a user to be present in the context
     * @param ctx - The Koa context
     * @param next - The next middleware function
     * @returns The next middleware function
     */
    requireIdentity: async (ctx, next) => {
      const authHeader = ctx.headers["authorization"];

      if (!authHeader?.startsWith("Bearer ")) {
        return next();
      }

      const token = authHeader.slice("Bearer ".length);
      const identity = await tokens.verify(token);

      if (!identity) {
        return mapUseCaseResult(ctx, {
          ok: false,
          kind: "unauthorized",
          errors: [
            {
              kind: "domain",
              code: "EDGE.UNAUTHORIZED",
              message: "Unauthorized",
            },
          ],
        });
      }

      ctx.state.identity = {
        sessionId: identity.sessionId,
        email: identity.email,
        username: identity.username,
        profileId: identity.profileId,
        userId: identity.userId,
        isOnboarded: identity.isOnboarded,
      };

      return next();
    },
    /**
     * Gets the refresh token from the request
     * @param ctx - The Koa context
     * @param next - The next middleware function
     * @returns The next middleware function
     */
    getRefreshToken: async (ctx, next) => {
      const authType = ctx.headers["X-Auth-Method"] ?? "cookie";
      ctx.state.auth = {} as HorizonFSState["auth"];

      if (authType === "cookie") {
        ctx.state.auth.type = "cookie";
        ctx.state.auth.refreshToken = ctx.cookies.get("refresh_token") ?? null;
      }

      if (authType === "body") {
        ctx.state.auth.type = "body";
        ctx.state.auth.refreshToken = ctx.body.refreshToken;
      }

      return next();
    },
  } satisfies Record<string, Middleware<HorizonFSState, AppContext>>;
}
