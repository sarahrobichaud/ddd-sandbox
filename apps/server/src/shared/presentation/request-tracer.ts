import type { Next } from "koa";
import type { Middleware } from "@koa/router";
import { randomUUID } from "crypto";
import type { AppContext, HorizonFSState } from "#types/koa";

/**
 * Request tracing middleware - MUST be first in the chain
 *
 * Responsibilities:
 * - Generate unique request ID
 * - Start performance timer
 * - Extract correlation IDs from headers
 */
export const requestTracer = (): Middleware<HorizonFSState, AppContext> => {
  return async (ctx: AppContext, next: Next) => {
    // Generate or extract request ID
    const requestId = (ctx.get("X-Request-ID") || randomUUID()) as string;

    // Store in state for access by other middleware/controllers
    ctx.state.requestId = requestId;
    ctx.state.requestStartTime = Date.now();

    // Set response header for client correlation
    ctx.set("X-Request-ID", requestId);

    await next();
  };
};
