import Router from "@koa/router";
import { AppContext, HorizonFSState } from "#types/koa";
import { RootDependencies } from "#root/init";

import { HorizonFSAuthHttp } from "#modules/auth/http/auth.http";
import { createPresenceMiddleware } from "#modules/presence/http/presentation/presence.middleware";
import { createPresenceRouter } from "#modules/presence/http/presentation/presence.routes";
import { createPresenceModule } from "@cavok/core/presence";

export type HorizonFSPresence = {
  router: Router<HorizonFSState, AppContext>;
  middleware: ReturnType<typeof createPresenceMiddleware>;
};

export class PresenceHttpAdapter {
  static build({ infrastructure: { presence } }: RootDependencies, auth: HorizonFSAuthHttp) {
    const presenceModule = createPresenceModule({
      userPresence: presence.presenceRepository,
    });

    const middleware = createPresenceMiddleware();
    const router = createPresenceRouter({ presence: presenceModule, authHttp: auth, middleware });

    return {
      router,
      middleware,
    } satisfies HorizonFSPresence;
  }
}
