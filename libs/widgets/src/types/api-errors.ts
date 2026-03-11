// Import domain types from @core
import type { HttpErrorResponse, HttpErrorDetail } from "@cavok/core/contracts/rest-api.contracts";

import type { UseCaseFailureKind } from "@cavok/core/shared/application/errors/use-case-result";

// Re-export for convenience
export type { HttpErrorResponse, HttpErrorDetail, UseCaseFailureKind };

/**
 * Parsed form error (domain-aware)
 */
export interface DomainFormError {
  kind: HttpErrorDetail["kind"];
  code: string;
  message: string;
  field?: string;
  meta?: Record<string, any>;
}

/**
 * Complete error summary
 */
export interface DomainErrorSummary {
  failureKind: UseCaseFailureKind;
  message: string;
  fieldErrors: Map<string, DomainFormError[]>; // Grouped by field
  generalErrors: DomainFormError[]; // Cross-field, business rules, etc.
  operation?: string;
}
