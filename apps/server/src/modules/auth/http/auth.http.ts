import Router from "@koa/router";
import { AppContext, HorizonFSState } from "#types/koa";
import { createAuthModule } from "@cavok/core/auth";
import { RootDependencies } from "#root/init";

import { createAuthRouter } from "#modules/auth/http/presentation/authentication.routes";
import { createAuthMiddleware } from "#modules/auth/http/presentation/authentication.middleware";

export type HorizonFSAuthHttp = {
  router: Router<HorizonFSState, AppContext>;
  middleware: ReturnType<typeof createAuthMiddleware>;
};

export class AuthHttpAdapter {
  static build({ system, infrastructure: { identity } }: RootDependencies) {
    const authModule = createAuthModule({
      domainEventBus: system.eventBus,
      hasher: identity.passwordHasher,
      accessTokenService: identity.accessTokenService,
      refreshTokenService: identity.refreshTokenService,
      userAccounts: identity.userAccountRepository,
    });

    const middleware = createAuthMiddleware(identity.accessTokenService);
    const router = createAuthRouter({ auth: authModule, middleware });

    return {
      middleware,
      router,
    } satisfies HorizonFSAuthHttp;
  }
}
