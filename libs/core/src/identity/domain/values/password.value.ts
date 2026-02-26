import { VALIDATION_ERROR, ValidationErrorOld } from "#shared/domain/domain-error";
import { FactoryResult } from "#shared/domain/types";

export class Password {
  readonly #hash: string;

  static readonly #MIN_LENGTH: number = 8;
  static readonly #MAX_LENGTH: number = 128;

  private constructor(hash: string) {
    this.#hash = hash;
  }

  static create(plaintext: string): FactoryResult<Password> {
    const errors: ValidationErrorOld[] = [];

    if (plaintext.length < 8) {
      errors.push({
        ...VALIDATION_ERROR.IDENTITY.PASSWORD.TOO_SHORT,
        message: VALIDATION_ERROR.IDENTITY.PASSWORD.TOO_SHORT.message.replace(
          "{{minLength}}",
          this.#MIN_LENGTH.toString()
        ),
        meta: { minLength: this.#MIN_LENGTH },
      });
    }

    if (errors.length > 0) {
      return [errors, null];
    }

    return [null, new Password(plaintext)];
  }

  static fromHash(hash: string) {
    return new Password(hash);
  }

  equals(other: Password): boolean {
    return this.#hash === other.#hash;
  }

  get hash() {
    return this.#hash;
  }
}
