import { AppContext } from "#types/koa";
import { AuthModule } from "@cavok/core/auth";
import { Controller } from "#root/lib/http";
import { VALUE } from "@cavok/core/values";
import { mapUseCaseResult } from "#root/lib/http-response-mapper";

/**
 * Authentication controller
 * @extends Controller<AuthModule>
 */
export class AuthController extends Controller<AuthModule> {
  /**
   * Login a user with email and password
   * @param ctx - The Koa context
   * @returns AuthenticationResult
   */
  async login(ctx: AppContext) {
    // Get the IP address and user agent from the request
    const ipAddress = ctx.request.ip || ctx.ip || "unknown";
    const userAgent = ctx.request.get("user-agent") || "unknown";

    // Parse the request body
    const parsed = this.commands.loginWithEmailPassword.safeParse({
      ...(ctx.request.body as Record<string, unknown>),
      metadata: { ipAddress, userAgent },
    });

    // If the request body is invalid, return a 400 error
    if (parsed.error) {
      ctx.status = 400;
      ctx.body = { error: "email and password are required" };
      return;
    }

    // Get the email and password from the request body
    const { email, password } = parsed.data;

    // Execute the login use case
    const result = await this.useCases.loginWithEmailPassword({
      actor: { type: VALUE.ACTOR.GUEST },
      data: { email, password, metadata: { ipAddress, userAgent } },
    });

    if (!result.ok) {
      return mapUseCaseResult(ctx, result);
    }

    // If the authentication result is successful, set the refresh token in a cookie
    if (ctx.state.auth.type === "cookie") {
      ctx.cookies.set("refresh_token", result.data.tokens.refresh_token);
    }

    return mapUseCaseResult(ctx, result, { successStatus: 200, successMessage: "Successfuly Logged In" });
  }

  /**
   * Register a new user with email and password
   * @param ctx - The Koa context
   * @returns AuthenticationResult
   */
  async register(ctx: AppContext) {
    const parsed = this.commands.registerWithEmailPassword.safeParse(ctx.request.body);

    if (parsed.error) {
      ctx.status = 400;
      ctx.body = { error: "Email, password and username are required" };
      return;
    }
    const { email, password, username } = parsed.data;

    const result = await this.useCases.registerWithEmailPassword({
      actor: { type: VALUE.ACTOR.GUEST },
      data: {
        email,
        password,
        username,
      },
    });

    return mapUseCaseResult(ctx, result, { successStatus: 201, successMessage: "Successfully Registered" });
  }

  /**
   * Exchange a refresh token for a new access token
   * @param ctx - The Koa context
   * @returns AuthenticationResult
   */
  async refresh(ctx: AppContext) {
    const ipAddress = ctx.request.ip || ctx.ip || "unknown";
    const userAgent = ctx.request.get("user-agent") || "unknown";

    const parsed = this.commands.exchangeRefreshToken.safeParse({
      refreshToken: ctx.state.auth.refreshToken,
      metadata: { ipAddress, userAgent },
    });

    if (parsed.error) {
      ctx.status = 400;
      ctx.body = { error: "refreshToken is required" };
      return;
    }

    const { refreshToken } = parsed.data;

    const result = await this.useCases.exchangeRefreshToken({
      actor: { type: VALUE.ACTOR.GUEST },
      data: { refreshToken, metadata: { ipAddress, userAgent } },
    });

    if (!result.ok) {
      return mapUseCaseResult(ctx, result);
    }

    if (ctx.state.auth.type === "cookie") {
      ctx.cookies.set("refresh_token", result.data.tokens.refresh_token);
    }

    return mapUseCaseResult(ctx, result, { successStatus: 200, successMessage: "Successfully Refreshed Session" });
  }

  /**
   * Get the current user
   * @param ctx - The Koa context
   * @returns Identity
   */
  async me(ctx: AppContext) {
    if (!ctx.state.identity) {
      ctx.status = 401;
      return;
    }

    const result = await this.useCases.getCurrentUser({
      actor: { type: VALUE.ACTOR.USER, identity: ctx.state.identity },
      data: undefined,
    });

    return mapUseCaseResult(ctx, result, { successStatus: 200, successMessage: "Retrieved current user" });
  }

  /**
   * Revoke a session
   * @param ctx - The Koa context
   * @returns void
   */
  async revokeSession(ctx: AppContext) {
    const identity = ctx.state.identity;
    const sessionId = ctx.params.sessionId;

    const parsed = this.commands.revokeSession.safeParse({
      sessionId: sessionId || null,
    });

    if (parsed.error) {
      return mapUseCaseResult(ctx, {
        ok: false,
        kind: "validation",
        errors: parsed.error.issues.map((issue) => ({
          kind: "domain",
          code: `EDGE.BAD_REQUEST.${String(issue.path[0])}`,
          message: issue.message,
          field: issue.path[0] as string,
        })),
      });
    }

    const result = await this.useCases.revokeSession({
      actor: { type: VALUE.ACTOR.GUEST },
      data: { sessionId },
    });

    if (!result.ok) {
      return mapUseCaseResult(ctx, result);
    }

    // Clear the cookie regardless of whether revocation succeeded
    if (ctx.state.auth.type === "cookie") {
      ctx.cookies.set("refresh_token");
    }

    // Even if revocation failed, return success since local state is cleared
    return mapUseCaseResult(ctx, result, {
      successStatus: 200,
      successMessage: "Successfully logged out",
    });
  }

  /**
   * Get the active sessions for the current user
   * @param ctx - The Koa context
   * @returns SessionDetails[]
   */
  async getActiveSessions(ctx: AppContext) {
    if (!ctx.state.identity) {
      ctx.status = 401;
      return;
    }

    const result = await this.useCases.getActiveSessions({
      actor: { type: VALUE.ACTOR.USER, identity: ctx.state.identity },
      data: undefined,
    });

    return mapUseCaseResult(ctx, result, { successStatus: 200, successMessage: "Retrieved active sessions" });
  }
}
