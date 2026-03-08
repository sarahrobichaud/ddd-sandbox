import Router from "@koa/router";
import { AppContext, HorizonFSState } from "#types/koa";
import { RootDependencies } from "#root/init";
import { HorizonFSAuthHttp } from "#modules/auth/http/auth.http";
import { createAdminRouter } from "#modules/admin/presentation/admin.routes";

export type HorizonFSAdmin = {
  router: Router<HorizonFSState, AppContext>;
};

/**
 * Admin HTTP Adapter
 * Provides administrative endpoints for system management
 */
export class AdminHttpAdapter {
  static build(deps: RootDependencies, auth: HorizonFSAuthHttp): HorizonFSAdmin {
    const router = createAdminRouter({
      dlqRepo: deps.system.dlqRepository,
      eventBus: deps.system.eventBus,
      authHttp: auth,
    });

    return {
      router,
    } satisfies HorizonFSAdmin;
  }
}
