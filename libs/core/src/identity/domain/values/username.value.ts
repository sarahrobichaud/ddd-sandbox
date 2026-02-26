import { VALIDATION_ERROR, ValidationErrorOld } from "#shared/domain/domain-error";
import { FactoryResult } from "#shared/domain/types";

export class Username {
  readonly #value: string;

  static readonly #MIN_LENGTH: number = 3;
  static readonly #MAX_LENGTH: number = 28;

  private constructor(value: string) {
    this.#value = value;
  }

  static fromPersistence(value: string): Username {
    return new Username(value);
  }

  static create(value: string): FactoryResult<Username> {
    const errors: ValidationErrorOld[] = [];

    // Usernames must be between 3 and 32 characters long and can only contain letters, numbers, underscores, and hyphens
    const usernameRegex = /^[a-zA-Z0-9_-]{3,32}$/;
    if (!usernameRegex.test(value)) {
      errors.push({
        ...VALIDATION_ERROR.IDENTITY.USERNAME.INVALID_FORMAT,
        message: VALIDATION_ERROR.IDENTITY.USERNAME.INVALID_FORMAT.message
          .replace("{{minLength}}", this.#MIN_LENGTH.toString())
          .replace("{{maxLength}}", this.#MAX_LENGTH.toString()),
        meta: { minLength: this.#MIN_LENGTH, maxLength: this.#MAX_LENGTH },
      });
    }

    if (errors.length > 0) {
      return [errors, null];
    }

    return [null, new Username(value)];
  }

  get value() {
    return this.#value;
  }
}
