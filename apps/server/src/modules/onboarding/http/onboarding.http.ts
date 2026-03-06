import Router from "@koa/router";
import { AppContext, HorizonFSState } from "#types/koa";
import { RootDependencies } from "#root/init";

import { createOnboardingModule } from "@cavok/core/onboarding-flow";
import { HorizonFSAuthHttp } from "#modules/auth/http/auth.http";
import { createOnboardingMiddleware } from "#modules/onboarding/http/presentation/onboarding.middleware";
import { createOnboardingRouter } from "#modules/onboarding/http/presentation/onboarding.routes";

export type HorizonFSOnboarding = {
  router: Router<HorizonFSState, AppContext>;
  middleware: ReturnType<typeof createOnboardingMiddleware>;
};

export class OnboardingHttpAdapter {
  static build({ infrastructure: { onboarding } }: RootDependencies, auth: HorizonFSAuthHttp) {
    const onboardingModule = createOnboardingModule({
      onboardingService: onboarding.onboardingService,
    });

    const middleware = createOnboardingMiddleware();
    const router = createOnboardingRouter({ onboarding: onboardingModule, authHttp: auth, middleware });

    return {
      router,
      middleware,
    } satisfies HorizonFSOnboarding;
  }
}
