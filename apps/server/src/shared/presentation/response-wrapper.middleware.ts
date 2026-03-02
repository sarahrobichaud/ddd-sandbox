import type { Next } from "koa";
import type { Middleware } from "@koa/router";
import type { AppContext, HorizonFSState } from "#types/koa";
import type { ApiResponse, ResponseMeta } from "#shared/presentation/response-types";
import { ERROR_TITLES } from "#shared/presentation/response-types";

/**
 * Response wrapper middleware - MUST be registered AFTER request tracer
 *
 * Responsibilities:
 * - Add meta fields to all responses
 * - Handle 404/405 routing errors
 * - Ensure consistent response envelope
 */
export const responseWrapper = (): Middleware<HorizonFSState, AppContext> => {
  return async (ctx: AppContext, next: Next) => {
    await next();

    // Build response metadata
    const meta: ResponseMeta = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - (ctx.state.requestStartTime || Date.now()),
      path: ctx.path,
      requestId: ctx.state.requestId || "unknown",
    };

    // CASE 1: No body set - check for routing errors
    if (!ctx.body) {
      if (ctx.status === 404) {
        ctx.status = 404;
        ctx.body = {
          status: "error",
          error: {
            type: "not_found",
            title: ERROR_TITLES.not_found,
            detail: `Route ${ctx.method} ${ctx.path} not found`,
          },
          meta,
        } satisfies ApiResponse<never>;
        return;
      }

      if (ctx.status === 405) {
        ctx.status = 405;
        ctx.body = {
          status: "error",
          error: {
            type: "not_found",
            title: "Method Not Allowed",
            detail: `Method ${ctx.method} not allowed for ${ctx.path}`,
          },
          meta,
        } satisfies ApiResponse<never>;
        return;
      }
    }

    // CASE 2: Body exists - add meta field
    if (ctx.body && typeof ctx.body === "object" && !Array.isArray(ctx.body)) {
      ctx.body = {
        ...ctx.body,
        meta,
      };
    }
  };
};
