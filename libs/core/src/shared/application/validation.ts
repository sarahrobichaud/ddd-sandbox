import { FactoryError, FactoryResult } from "#shared/domain/types";
import { DomainError, EntityResult, ValidationResult, ValueResult } from "#shared/application/errors/domain-errors";

export function validateGroup<T extends Record<string, FactoryResult<any>>>(
  results: T
): FactoryResult<{
  [K in keyof T]: T[K] extends FactoryResult<infer U> ? U : never;
}> {
  const errors: FactoryError = [];
  const values: Record<string, any> = {};

  // Collect all results
  for (const [key, result] of Object.entries(results)) {
    const [err, value] = result;
    if (err) {
      errors.push(...err.map((err) => ({ field: key, ...err })));
    } else {
      values[key] = value;
    }
  }

  // If any errors, return them all
  if (errors.length > 0) {
    return [errors, null];
  }

  // Otherwise return validated values (all non-null)
  return [null, values as any];
}

/**
 * Groups ValueResult and EntityResult types, collecting all errors or returning validated instances.
 *
 * @example
 * const displayName = DisplayName.create(data.displayName);
 * const homeAirport = HomeAirport.create(data.homeAirport);
 *
 * const [errors, validated] = groupValidationResults({ displayName, homeAirport });
 * if (errors) {
 *   return entityFailure(errors);
 * }
 * // validated.displayName is DisplayName, validated.homeAirport is HomeAirport
 */
export function groupValidationResults<
  T extends Record<string, ValueResult<any> | EntityResult<any> | ValidationResult<any>>
>(
  results: T,
  dataContext?: string
):
  | [DomainError[], null]
  | [null, { [K in keyof T]: T[K] extends ValueResult<infer U> ? U : T[K] extends EntityResult<infer U> ? U : never }] {
  const errors: DomainError[] = [];
  const values: Record<string, any> = {};

  // Collect all results
  for (const [key, result] of Object.entries(results)) {
    if (!result.ok) {
      // Both ValueObjectFailureResult and EntityFailureResult have errors array
      errors.push(
        ...result.errors.map((err) => {
          // Add field context if not already present
          console.log({ err, dataContext, key });
          if (err.kind === "validation") {
            return {
              ...err,
              field: dataContext ? `${dataContext}.${err.field}` : err.field ? err.field : key,
              key: key,
            };
          }
          return err;
        })
      );
    } else {
      values[key] = result.instance;
    }
  }

  // If any errors, return them all
  if (errors.length > 0) {
    return [errors, null];
  }

  // Otherwise return validated values (all non-null)
  return [null, values as any];
}
