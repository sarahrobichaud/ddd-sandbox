import type { DomainErrorOld } from "@cavok/core/shared/domain/domain-error";

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

/**
 * HTTP status code mapping from use case result kinds
 */
export const UC_RESULT_STATUS_MAP = {
  validation: 400,
  not_found: 404,
  unauthorized: 401,
  conflict: 409,
} as const;

/**
 * Error type mapping from use case result kinds
 */
export const UC_RESULT_ERROR_TYPE_MAP = {
  validation: "validation_error",
  not_found: "not_found",
  unauthorized: "unauthorized",
  conflict: "conflict",
} as const;

/**
 * Error title mapping
 */
export const ERROR_TITLES = {
  validation_error: "Validation Failed",
  not_found: "Resource Not Found",
  unauthorized: "Unauthorized",
  conflict: "Resource Conflict",
  internal_error: "Internal Server Error",
} as const;
