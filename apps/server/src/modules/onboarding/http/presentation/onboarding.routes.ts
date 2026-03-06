import Router from "@koa/router";
import { OnboardingController } from "#modules/onboarding/http/presentation/onboarding.controller";
import { AppContext, HorizonFSState } from "#types/koa";
import { createOnboardingMiddleware } from "#modules/onboarding/http/presentation/onboarding.middleware";
import { OnboardingModule } from "@cavok/core/onboarding-flow";
import { HorizonFSAuthHttp } from "#modules/auth/http/auth.http";

/**
 * Creates a router for the onboarding module
 * @param onboarding - The onboarding module
 * @param middleware - The authentication middleware
 * @returns A router for the onboarding module
 */
export function createOnboardingRouter({
  onboarding,
  authHttp,
  middleware,
}: {
  onboarding: OnboardingModule;
  authHttp: HorizonFSAuthHttp;
  middleware: ReturnType<typeof createOnboardingMiddleware>;
}): Router<HorizonFSState, AppContext> {
  const controller = new OnboardingController(onboarding);
  const router = new Router<HorizonFSState, AppContext>({ prefix: "/onboarding" });

  router.use(authHttp.middleware.requireIdentity);
  /**
   * User routes
   * Requires the identity of a user to be present in the context
   */
  router.get("/status/:userId", controller.getOnboardingStatus.bind(controller));
  router.post("/complete/welcome/:userId", controller.completeWelcomeStep.bind(controller));
  router.post("/complete/presence/:userId", controller.completePresenceStep.bind(controller));
  router.post("/complete/:userId", controller.completeOnboarding.bind(controller));

  return router;
}
