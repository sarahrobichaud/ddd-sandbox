import { AppContext, HorizonFSState } from "#types/koa";
import { Middleware } from "koa";

/**
 * Creates a middleware for the authentication module
 * @param tokens - The signable token service
 * @returns The middleware for the authentication module
 */
export function createOnboardingMiddleware() {
  return {} satisfies Record<string, Middleware<HorizonFSState, AppContext>>;
}
