// libs/core/src/shared/application/use-case.ts

import { AuthAwareAction } from "#shared/application/auth-aware-command";
import { DomainError } from "#shared/application/errors/domain-errors";
import { AppDeps } from "#shared/types/dependencies";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// USE CASE CONTEXT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type UseCaseCtx<I, D = AppDeps, K extends keyof D = never> = {
  input: I;
  deps: Pick<D, K>;
};

export type UseCase<Input, Result, D = AppDeps, K extends keyof D = never> = (
  ctx: UseCaseCtx<AuthAwareAction<Input>, D, K>
) => Promise<UseCaseResult<Result>>;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// USE CASE RESULTS (New System)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Maps to HTTP status codes:
 * - validation -> 400 Bad Request
 * - unauthorized -> 401 Unauthorized
 * - forbidden -> 403 Forbidden
 * - not_found -> 404 Not Found
 * - conflict -> 409 Conflict
 * - internal_error -> 500 Internal Server Error
 */
export type UseCaseFailureKind =
  | "validation" // User input doesn't meet requirements
  | "unauthorized" // Not authenticated
  | "forbidden" // Authenticated but not authorized
  | "not_found" // Entity doesn't exist
  | "conflict" // Business rule violation / invariant
  | "internal_error"; // Unexpected error (persistence, etc.)

export type UseCaseSuccess<T> = {
  ok: true;
  data: T;
};

export type UseCaseFailure = {
  ok: false;
  kind: UseCaseFailureKind;
  errors: DomainError[];
  operation?: string; // Optional: what operation failed
  meta?: Record<string, any>; // Optional: additional context
};

export type UseCaseResult<T> = UseCaseSuccess<T> | UseCaseFailure;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Create a successful use case result
 */
export function useCaseSuccess<T>(data: T): UseCaseSuccess<T> {
  return { ok: true, data };
}

/**
 * Create a failed use case result
 */
export function useCaseFailure(
  kind: UseCaseFailureKind,
  errors: DomainError[],
  options?: { operation?: string; meta?: Record<string, any> }
): UseCaseFailure {
  return {
    ok: false,
    kind,
    errors,
    operation: options?.operation,
    meta: options?.meta,
  };
}

/**
 * Map a single DomainError to UseCaseFailure
 */
export function singleErrorFailure(
  kind: UseCaseFailureKind,
  error: DomainError,
  options?: { operation?: string; meta?: Record<string, any> }
): UseCaseFailure {
  return useCaseFailure(kind, [error], options);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DEPRECATED (Keep for migration)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** @deprecated Use UseCaseResult instead */
export type UCResult<T> = UseCaseResult<T>;

/** @deprecated Use UseCaseCtx instead */
export type UseCaseCtxOld<I, D = AppDeps, K extends keyof D = never> = {
  input: I;
  infra: Pick<D, K>;
};
