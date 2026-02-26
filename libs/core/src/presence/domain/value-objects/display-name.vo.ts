import {
  validationError,
  valueCreated,
  ValueResult,
  valueFailure,
  ValidationError,
  validationFailure,
} from "#shared/application/errors/domain-errors";

export class DisplayName {
  #value: string;

  static readonly MIN_LENGTH: number = 3;
  static readonly MAX_LENGTH: number = 30;

  private constructor(value: string) {
    this.#value = value;
  }

  static create(value: unknown, context?: string): ValueResult<DisplayName> {
    const fieldName = (name: string) => (context ? `${context}.${name}` : name);

    if (!value || typeof value !== "string") {
      return valueFailure([
        validationError({
          field: fieldName("displayName"),
          code: "DISPLAY_NAME.INVALID_TYPE",
          message: "Must be a string",
        }),
      ]);
    }

    const errors = [] as ValidationError[];

    if (value.length < this.MIN_LENGTH) {
      errors.push(
        validationError({
          field: fieldName("displayName"),
          code: "DISPLAY_NAME.TOO_SHORT",
          message: "Must be at least {{minLength}} characters",
          meta: { minLength: this.MIN_LENGTH },
        })
      );
    }

    if (value.length >= this.MAX_LENGTH) {
      errors.push(
        validationError({
          field: fieldName("displayName"),
          code: "DISPLAY_NAME.TOO_LONG",
          message: "Must be less than {{maxLength}} characters",
          meta: { maxLength: this.MAX_LENGTH },
        })
      );
    }

    if (errors.length > 0) {
      return valueFailure(errors);
    }

    return valueCreated(new DisplayName(value));
  }

  static fromTrusted(value: string): DisplayName {
    return new DisplayName(value);
  }

  get value(): string {
    return this.#value;
  }
}
