import {
  DomainException,
  ValidationException,
  EntityNotFoundException,
  PersistenceException,
  InvariantViolationException,
  DomainError,
  validationError,
  businessRuleError,
  systemError,
} from "#shared/application/errors/domain-errors";
import { useCaseFailure, type UseCaseFailure } from "#shared/application/errors/use-case-result";

/**
 * Maps service exceptions to use case failure results
 *
 * Usage in use cases:
 *
 * try {
 *   const result = await deps.onboardingService.initialize(userId);
 *   return useCaseSuccess(result);
 * } catch (error) {
 *   return mapExceptionToUseCaseFailure(error);
 * }
 *  */
export function mapExceptionToUseCaseFailure(error: unknown): UseCaseFailure {
  // Validation errors from service (user input issues)
  if (error instanceof ValidationException) {
    return useCaseFailure("validation", error.errors, {
      operation: "validation",
    });
  }

  // Entity not found
  if (error instanceof EntityNotFoundException) {
    return useCaseFailure("not_found", error.errors, {
      operation: "entity_lookup",
    });
  }

  // Invariant violations (business rule violations)
  if (error instanceof InvariantViolationException) {
    return useCaseFailure("conflict", error.errors, {
      operation: "invariant_check",
    });
  }

  // Persistence failures (database issues, etc.)
  if (error instanceof PersistenceException) {
    // Log the actual error for debugging
    console.error("Persistence error in use case:", error);
    return useCaseFailure(
      "internal_error",
      [
        systemError({
          code: "SYSTEM.INTERNAL_ERROR",
          message: "Internal Server Error: Contact support if the problem persists",
        }),
      ],
      { operation: "HIDDEN_OPERATION" }
    );
  }

  // Generic domain exception
  if (error instanceof DomainException) {
    return useCaseFailure("conflict", error.errors);
  }

  // Unexpected error - this should be logged and monitored
  console.error("Unexpected error in use case:", error);

  return useCaseFailure(
    "internal_error",
    [
      businessRuleError({
        code: "SYSTEM.UNEXPECTED_ERROR",
        message: "An unexpected error occurred",
      }),
    ],
    {
      meta: {
        errorType: error?.constructor?.name || "unknown",
        errorMessage: error instanceof Error ? error.message : String(error),
      },
    }
  );
}

/**
 * Create an unauthorized failure (not authenticated)
 */
export function unauthorizedFailure(message?: string): UseCaseFailure {
  return useCaseFailure(
    "unauthorized",
    [
      businessRuleError({
        code: "AUTH.UNAUTHORIZED",
        message: message || "You must be authenticated to perform this action",
      }),
    ],
    { operation: "authorization" }
  );
}

/**
 * Create a forbidden failure (authenticated but not authorized)
 */
export function forbiddenFailure(message?: string): UseCaseFailure {
  return useCaseFailure(
    "forbidden",
    [
      businessRuleError({
        code: "AUTH.FORBIDDEN",
        message: message || "You are not authorized to perform this action",
      }),
    ],
    { operation: "authorization" }
  );
}
