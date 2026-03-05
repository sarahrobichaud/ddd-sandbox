import Router from "@koa/router";
import { AuthController } from "./authentication.controller.js";
import { AppContext, HorizonFSState } from "#types/koa";
import { createAuthMiddleware } from "./authentication.middleware.js";
import { AuthModule } from "@cavok/core/auth";

/**
 * Creates a router for the authentication module
 * @param auth - The authentication module
 * @param middleware - The authentication middleware
 * @returns A router for the authentication module
 */
export function createAuthRouter({
  auth,
  middleware,
}: {
  auth: AuthModule;
  middleware: ReturnType<typeof createAuthMiddleware>;
}): Router<HorizonFSState, AppContext> {
  const controller = new AuthController(auth);
  const router = new Router<HorizonFSState, AppContext>({ prefix: "/identity" });

  router.use(middleware.getRefreshToken);

  /**
   * Authentication routes
   */
  router.post("/auth/sign-in", controller.login.bind(controller));
  router.post("/auth/sign-up", controller.register.bind(controller));

  /**
   * Session management routes
   */
  router.get("/session/active", middleware.requireIdentity, controller.getActiveSessions.bind(controller));
  router.post("/session/renew", middleware.identify, controller.refresh.bind(controller));
  router.post("/session/revoke/:sessionId", middleware.identify, controller.revokeSession.bind(controller));

  /**
   * User routes
   * Requires the identity of a user to be present in the context
   */

  router.get("/me", middleware.requireIdentity, controller.me.bind(controller));

  return router;
}
