import type { Server } from "node:http";
import { type ErrorCallback, retry } from "async";
import Koa from "koa";

import bodyParser from "koa-bodyparser";
import type { AppContext } from "./types/koa.js";
import type { HorizonFSState } from "./types/koa.js";
import Router from "@koa/router";
import { AuthHttpAdapter } from "#modules/auth/http/auth.http";
import { RootDependencies } from "./init.js";
import { responseWrapper } from "#shared/presentation/response-wrapper.middleware";
import cors from "@koa/cors";
import { requestTracer } from "#shared/presentation/request-tracer";
import { OnboardingHttpAdapter } from "#modules/onboarding/http/onboarding.http";
import { PresenceHttpAdapter } from "#modules/presence/http/presence.http";
import { AdminHttpAdapter } from "#modules/admin/admin.http";

export class AppServer {
  private app: Koa<HorizonFSState, AppContext>;
  private server: Server | undefined;

  constructor(app: Koa<HorizonFSState, AppContext>) {
    this.app = app;
  }

  public listen(port: number): Server {
    this.server = this.app.listen(port);
    return this.server;
  }

  public getServer(): Server {
    if (this.server === undefined) {
      throw new Error("SERVER_NOT_INITIALIZED");
    }

    return this.server;
  }

  public closeServer(): Promise<void> {
    if (this.server === undefined) {
      throw new Error("SERVER_NOT_INITIALIZED");
    }

    const checkPendingRequests = (callback: ErrorCallback<Error | undefined>) => {
      if (this.server === undefined) {
        throw new Error("SERVER_NOT_INITIALIZED");
      }

      this.server.getConnections((err: Error | null, pendingRequests: number) => {
        if (err) {
          callback(err);
        } else if (pendingRequests > 0) {
          callback(Error(`Number of pending requests: ${pendingRequests}`));
        } else {
          callback(undefined);
        }
      });
    };

    return new Promise<void>((resolve, reject) => {
      retry(
        { times: 10, interval: 1000 },
        checkPendingRequests.bind(this),
        ((error: Error | undefined | null) => {
          if (error) {
            this.getServer().close(() => reject(error));
          } else {
            this.getServer().close(() => resolve());
          }
        }).bind(this),
      );
    });
  }
}

export function createServer(deps: RootDependencies): AppServer {
  const app = new Koa<HorizonFSState, AppContext>();
  const server = new AppServer(app);

  // CORS configuration
  app.use(
    cors({
      origin: "*",
      credentials: true,
    }),
  );

  // Register global middlewares
  app.use(bodyParser());
  app.use(requestTracer());
  app.use(responseWrapper());

  // Register root API router
  const httpRouter = new Router<HorizonFSState, AppContext>({ prefix: "/v1" });

  // Register modules
  const authHTTP = AuthHttpAdapter.build(deps);
  const onboardingHTTP = OnboardingHttpAdapter.build(deps, authHTTP);
  const presenceHTTP = PresenceHttpAdapter.build(deps, authHTTP);
  const adminHTTP = AdminHttpAdapter.build(deps, authHTTP);

  const httpModules = [authHTTP, onboardingHTTP, presenceHTTP, adminHTTP];

  // Register module routes
  for (const httpModule of httpModules) {
    httpRouter.use(httpModule.router.routes(), httpModule.router.allowedMethods());
  }

  app.use(httpRouter.routes());
  app.use(httpRouter.allowedMethods());

  return server;
}
