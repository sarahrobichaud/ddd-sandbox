import { AppContext, HorizonFSState } from "#types/koa";
import { Middleware } from "koa";

/**
 * Creates a middleware for the presence module
 * @returns The middleware for the presence module
 */
export function createPresenceMiddleware() {
  return {} satisfies Record<string, Middleware<HorizonFSState, AppContext>>;
}
