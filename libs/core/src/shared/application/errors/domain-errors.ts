// libs/core/src/shared/application/errors/domain-errors.ts

import { MODULE_SUBJECT, ModuleEntry, ModuleSubject } from "#shared/application/module";
/**
 * Returned when we need to validate that a business rule is met
 */
export interface BusinessRuleError {
  kind: "business_rule";
  field?: string;
  relatedFields?: string[];
  code: string;
  message: string;
  meta?: Record<string, any>;
}

export interface SystemError {
  kind: "system";
  code: string;
  message: string;
  meta?: Record<string, any>;
}

/**
 * Returned values which requires multiple fields to be validated and combined to determine if the value is valid
 */
export interface CrossFieldValidationError {
  kind: "cross_field_validation";
  anchorField: string;
  relatedFields?: string[];
  code: string;
  message: string;
  meta?: Record<string, any>;
}

/**
 * Returned from value objects and basic validation of a single field
 */
export interface ValidationError {
  kind: "validation";
  code: string;
  field: string;
  message: string;
  meta?: Record<string, any>;
}

export type DomainError = ValidationError | CrossFieldValidationError | BusinessRuleError | SystemError;

/**
 * Result from entity action/operation
 */
export interface DomainActionFailureResult {
  ok: false;
  operation: string; // What action was attempted
  code: string;
  errors: DomainError[]; // ALL errors (can mix types!)
}

export interface DomainActionSuccess<T> {
  ok: true;
  type: "domain_action_success";
  instance: T;
}

export interface ValueObjectCreated<T> {
  ok: true;
  type: "value_object_created";
  instance: T;
}

export interface ValueObjectFailureResult {
  ok: false;
  type: "value_object_failure";
  errors: DomainError[];
}

export interface EntityCreated<T> {
  ok: true;
  type: "entity_created";
  instance: T;
}

export interface EntityFailureResult {
  ok: false;
  type: "entity_created_failure";
  errors: DomainError[];
}

export interface DataValidated<T> {
  ok: true;
  type: "data_validated";
  instance: T;
}

export interface DataValidationFailureResult {
  ok: false;
  type: "data_validation_failure";
  errors: DomainError[];
}

export type DomainActionResult<T> = DomainActionSuccess<T> | DomainActionFailureResult;
export type ValueResult<T> = ValueObjectCreated<T> | ValueObjectFailureResult;
export type EntityResult<T> = EntityCreated<T> | EntityFailureResult;
export type ValidationResult<T> = DataValidated<T> | DataValidationFailureResult;

export function validationCreated<T>(instance: T): ValidationResult<T> {
  return { ok: true, type: "data_validated", instance };
}
export function valueCreated<T>(instance: T): ValueObjectCreated<T> {
  return { ok: true, type: "value_object_created", instance };
}
export function entityCreated<T>(instance: T): EntityCreated<T> {
  return { ok: true, type: "entity_created", instance };
}
export function success<T>(instance: T): DomainActionSuccess<T> {
  return { ok: true, type: "domain_action_success", instance };
}

export function valueFailure(errors: DomainError[]): ValueObjectFailureResult {
  return { ok: false, type: "value_object_failure", errors };
}
export function entityFailure(errors: DomainError[]): EntityFailureResult {
  return { ok: false, type: "entity_created_failure", errors };
}
export function validationFailure(errors: DomainError[]): DataValidationFailureResult {
  return { ok: false, type: "data_validation_failure", errors };
}

export function failure({ operation, errors }: Omit<DomainActionFailureResult, "ok">): DomainActionFailureResult {
  const errorArray = Array.isArray(errors) ? errors : [errors];

  return {
    ok: false,
    operation,
    code: operation.toUpperCase() + ".FAILURE",
    errors: errorArray,
  };
}

export function validationError(args: Omit<ValidationError, "kind">): ValidationError {
  return { kind: "validation", ...args };
}

export function crossFieldValidationError(args: Omit<CrossFieldValidationError, "kind">): CrossFieldValidationError {
  return { kind: "cross_field_validation", ...args };
}

export function businessRuleError(args: Omit<BusinessRuleError, "kind">): BusinessRuleError {
  return { kind: "business_rule", ...args };
}

export function systemError(args: Omit<SystemError, "kind">): SystemError {
  return { kind: "system", ...args };
}

export function getValidationErrors(result: DomainActionFailureResult): ValidationError[] {
  return result.errors.filter((e): e is ValidationError => e.kind === "validation");
}

export function getCrossFieldErrors(result: DomainActionFailureResult): CrossFieldValidationError[] {
  return result.errors.filter((e): e is CrossFieldValidationError => e.kind === "cross_field_validation");
}

export function getBusinessRuleErrors(result: DomainActionFailureResult): BusinessRuleError[] {
  return result.errors.filter((e): e is BusinessRuleError => e.kind === "business_rule");
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BASE DOMAIN EXCEPTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Base class for all domain exceptions
 * Thrown by services when business operations fail
 */
export class DomainException extends Error {
  public readonly errors: DomainError[];
  public readonly cause?: Error;

  constructor(errors: DomainError | DomainError[], cause?: Error) {
    const errorArray = Array.isArray(errors) ? errors : [errors];
    const primaryError = errorArray[0];

    super(primaryError.message);
    this.name = "DomainException";
    this.errors = errorArray;
    this.cause = cause;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DomainException);
    }
  }

  /**
   * Get the primary error code
   */
  get code(): string {
    return this.errors[0].code;
  }

  /**
   * Get the primary error kind
   */
  get kind(): string {
    return this.errors[0].kind;
  }

  /**
   * Check if this exception contains validation errors
   */
  hasValidationErrors(): boolean {
    return this.errors.some((e) => e.kind === "validation");
  }

  /**
   * Check if this exception contains business rule errors
   */
  hasBusinessRuleErrors(): boolean {
    return this.errors.some((e) => e.kind === "business_rule");
  }

  /**
   * Get all validation errors
   */
  getValidationErrors(): ValidationError[] {
    return this.errors.filter((e): e is ValidationError => e.kind === "validation");
  }

  /**
   * Get all business rule errors
   */
  getBusinessRuleErrors(): BusinessRuleError[] {
    return this.errors.filter((e): e is BusinessRuleError => e.kind === "business_rule");
  }

  /**
   * Get all cross-field validation errors
   */
  getCrossFieldErrors(): CrossFieldValidationError[] {
    return this.errors.filter((e): e is CrossFieldValidationError => e.kind === "cross_field_validation");
  }

  getSystemErrors(): SystemError[] {
    return this.errors.filter((e): e is SystemError => e.kind === "system");
  }

  //TODO Fix this
  static throwAppropriate(errors: DomainError[]): never {
    const errorArray = Array.isArray(errors) ? errors : [errors];

    // Check what types of errors we have
    const hasValidation = errorArray.some((e) => e.kind === "validation" || e.kind === "cross_field_validation");
    const hasBusinessRule = errorArray.some((e) => e.kind === "business_rule");

    // If ANY validation errors → ValidationException (with all errors)
    // Rationale: User needs to fix input first
    if (hasValidation) {
      throw new ValidationException(errorArray);
    }

    // Only business rules → BusinessRuleException
    if (hasBusinessRule) {
      throw new BusinessRuleException(errorArray);
    }

    // Shouldn't happen, but fallback to generic
    throw new DomainException(errorArray);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VALIDATION EXCEPTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Thrown when user input fails validation
 * Maps to 400 Bad Request in HTTP
 *
 * @example
 * throw new ValidationException(
 *   validationError({
 *     code: "EMAIL.INVALID",
 *     field: "email",
 *     message: "Email must be valid"
 *   })
 * );
 */
export class ValidationException extends DomainException {
  constructor(errors: ValidationError | ValidationError[] | DomainError[], cause?: Error) {
    super(errors, cause);
    this.name = "ValidationException";
  }

  /**
   * Create from a single field validation
   */
  static fromField(field: string, code: string, message: string, meta?: Record<string, any>): ValidationException {
    return new ValidationException(validationError({ field, code, message, meta }));
  }

  /**
   * Create from factory errors (tuple result)
   */
  static fromFactory(errors: DomainError[]): ValidationException {
    return new ValidationException(errors);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BUSINESS RULE EXCEPTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Thrown when a business rule is violated
 * Maps to 409 Conflict in HTTP
 *
 * @example
 * throw new BusinessRuleException(
 *   businessRuleError({
 *     code: "ONBOARDING.ALREADY_COMPLETED",
 *     anchorField: "userId",
 *     message: "User has already completed onboarding"
 *   })
 * );
 */
export class BusinessRuleException extends DomainException {
  constructor(errors: BusinessRuleError | BusinessRuleError[] | DomainError[], cause?: Error) {
    super(errors, cause);
    this.name = "BusinessRuleException";
  }

  /**
   * Create from a single business rule
   */
  static fromRule(
    anchorField: string,
    code: string,
    message: string,
    options?: {
      relatedFields?: string[];
      meta?: Record<string, any>;
    }
  ): BusinessRuleException {
    return new BusinessRuleException(
      businessRuleError({
        code,
        message,
        relatedFields: options?.relatedFields,
        meta: options?.meta,
      })
    );
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ENTITY NOT FOUND EXCEPTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Thrown when an entity cannot be found
 * Maps to 404 Not Found in HTTP
 *
 * @example
 * throw new EntityNotFoundException("User", userId);
 */
export class EntityNotFoundException extends DomainException {
  public readonly entityName: string;
  public readonly entityId: string;

  constructor(entityName: string, entityId: string) {
    const error = businessRuleError({
      code: `${entityName.toUpperCase()}.NOT_FOUND`,
      message: `${entityName} with ID '${entityId}' not found`,
      meta: { entityName, entityId },
    });

    super(error);
    this.name = "EntityNotFoundException";
    this.entityName = entityName;
    this.entityId = entityId;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INVARIANT VIOLATION EXCEPTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Thrown when an invariant is violated (programming error)
 * Maps to 409 Conflict in HTTP
 *
 * These should be prevented by service-layer checks.
 * If they occur in production, it's a bug that needs fixing.
 *
 * @example
 * throw new InvariantViolationException(
 *   "User already has primary profile",
 *   MODULE_SUBJECT.IDENTITY
 * );
 */
export class InvariantViolationException extends DomainException {
  public readonly module: ModuleEntry;

  constructor(
    message: string,
    moduleSubject: ModuleEntry,
    options?: {
      anchorField?: string;
      meta?: Record<string, any>;
    }
  ) {
    const error = businessRuleError({
      code: `${moduleSubject.LABEL}.INVARIANT_VIOLATION`,
      message: `Invariant Violation: ${message}`,
      meta: {
        ...options?.meta,
        module: moduleSubject,
        isInvariant: true,
      },
    });

    super(error);
    this.name = "InvariantViolationException";
    this.module = moduleSubject;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PERSISTENCE EXCEPTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Thrown when a persistence operation fails
 * Maps to 500 Internal Server Error in HTTP
 *
 * @example
 * throw new PersistenceException("Failed to save user", dbError);
 */
export class PersistenceException extends DomainException {
  public readonly originalError: unknown;

  constructor(message: string, originalError: unknown, meta?: Record<string, any>) {
    const error = systemError({
      code: "PERSISTENCE.FAILURE",
      message: `Persistence Error: ${message}`,
      meta: {
        ...meta,
        errorType: originalError?.constructor?.name || "unknown",
        isPersistenceError: true,
      },
    });

    super(error);
    this.name = "PersistenceException";
    this.originalError = originalError;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AUTHORIZATION EXCEPTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Thrown when user is not authenticated
 * Maps to 401 Unauthorized in HTTP
 *
 * @example
 * throw new UnauthorizedException("You must be logged in");
 */
export class UnauthorizedException extends DomainException {
  constructor(message: string = "Authentication required") {
    const error = businessRuleError({
      code: "AUTH.UNAUTHORIZED",
      message,
    });

    super(error);
    this.name = "UnauthorizedException";
  }
}

/**
 * Thrown when user is authenticated but not authorized
 * Maps to 403 Forbidden in HTTP
 *
 * @example
 * throw new ForbiddenException("You cannot access this resource");
 */
export class ForbiddenException extends DomainException {
  constructor(message: string = "Access denied") {
    const error = businessRuleError({
      code: "AUTH.FORBIDDEN",
      message,
    });

    super(error);
    this.name = "ForbiddenException";
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Check if an error is a domain exception
 */
export function isDomainException(error: unknown): error is DomainException {
  return error instanceof DomainException;
}

/**
 * Check if an error is a validation exception
 */
export function isValidationException(error: unknown): error is ValidationException {
  return error instanceof ValidationException;
}

/**
 * Check if an error is a business rule exception
 */
export function isBusinessRuleException(error: unknown): error is BusinessRuleException {
  return error instanceof BusinessRuleException;
}

/**
 * Check if an error is an entity not found exception
 */
export function isEntityNotFoundException(error: unknown): error is EntityNotFoundException {
  return error instanceof EntityNotFoundException;
}

/**
 * Check if an error is an invariant violation exception
 */
export function isInvariantViolationException(error: unknown): error is InvariantViolationException {
  return error instanceof InvariantViolationException;
}

/**
 * Check if an error is a persistence exception
 */
export function isPersistenceException(error: unknown): error is PersistenceException {
  return error instanceof PersistenceException;
}

/**
 * Check if an error is an authorization exception (unauthorized or forbidden)
 */
export function isAuthorizationException(error: unknown): error is UnauthorizedException | ForbiddenException {
  return error instanceof UnauthorizedException || error instanceof ForbiddenException;
}
