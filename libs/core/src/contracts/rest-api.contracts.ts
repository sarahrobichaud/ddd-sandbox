import type { DomainErrorOld } from "@cavok/core/shared/domain/domain-error";
// libs/core/src/contracts/rest-api.contracts.ts
import type { DomainError } from "@cavok/core/shared/application/errors/domain-errors";
import type { UseCaseFailureKind } from "@cavok/core/shared/application/errors/use-case-result";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HTTP RESPONSE CONTRACTS (Transport Layer)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type { DomainError } from "#shared/application/errors/domain-errors";

/**
 * Structured error detail for HTTP response
 * Maps DomainError to transport format
 */
export interface HttpErrorDetail {
  kind: DomainError["kind"];
  code: string;
  message: string;
  field?: string;
  anchorField?: string;
  relatedFields?: string[];
  meta?: Record<string, any>;
}

/**
 * HTTP Error Response Structure
 */
export interface HttpErrorResponse {
  success: false;
  error: {
    kind: UseCaseFailureKind;
    message: string;
    errors: HttpErrorDetail[];
    operation?: string;
    meta?: Record<string, any>;
  };
}

/**
 * HTTP Success Response Structure
 */
export interface HttpSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Union type for all HTTP responses
 */
export type HttpResponse<T> = HttpSuccessResponse<T> | HttpErrorResponse;

/** @deprecated Use HttpSuccessResponse instead */
export interface ApiSuccessResponse<T> {
  status: "success";
  data: T;
  message?: string;
  meta: ResponseMeta;
  pagination?: PaginationMeta;
}

/** @deprecated Use HttpErrorResponse instead */
export interface ApiErrorResponse {
  status: "error";
  error: ErrorDetail;
  meta: ResponseMeta;
}

/**
 * Metadata attached to every API response
 */
export interface ResponseMeta {
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Request duration in milliseconds */
  duration: number;
  /** API endpoint path */
  path: string;
  /** Unique request identifier for tracing */
  requestId: string;
}

/**
 * Pagination metadata for list responses
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Success response envelope
 */
export interface ApiSuccessResponse<T> {
  status: "success";
  data: T;
  message?: string;
  meta: ResponseMeta;
  pagination?: PaginationMeta;
}

/**
 * Error detail following RFC 7807 Problem Details
 */
export interface ErrorDetail {
  /** Error type identifier */
  type: "validation_error" | "not_found" | "unauthorized" | "conflict" | "internal_error";
  /** Short, human-readable summary */
  title: string;
  /** Detailed explanation */
  detail?: string;
  /** Domain-specific errors */
  errors?: DomainErrorOld[];
}

/**
 * Error response envelope
 */
export interface ApiErrorResponse {
  status: "error";
  error: ErrorDetail;
  meta: ResponseMeta;
}

/**
 * Union type for all API responses
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
