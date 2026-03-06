import Router from "@koa/router";
import { AppContext, HorizonFSState } from "#types/koa";
import { createOnboardingMiddleware } from "#modules/onboarding/http/presentation/onboarding.middleware";
import { HorizonFSAuthHttp } from "#modules/auth/http/auth.http";
import { PresenceModule } from "@cavok/core/presence";
import { PresenceController } from "#modules/presence/http/presentation/presence.controller";

/**
 * Creates a router for the presence module
 * @param presence - The presence module
 * @param middleware - The presence middleware
 * @returns A router for the presence module
 */
export function createPresenceRouter({
  presence,
  authHttp,
  middleware,
}: {
  presence: PresenceModule;
  authHttp: HorizonFSAuthHttp;
  middleware: ReturnType<typeof createOnboardingMiddleware>;
}): Router<HorizonFSState, AppContext> {
  const controller = new PresenceController(presence);
  const router = new Router<HorizonFSState, AppContext>({ prefix: "/presence" });

  router.use(authHttp.middleware.requireIdentity);
  /**
   * User routes
   * Requires the identity of a user to be present in the context
   */
  router.get("/", controller.getUserPresence.bind(controller));

  return router;
}
