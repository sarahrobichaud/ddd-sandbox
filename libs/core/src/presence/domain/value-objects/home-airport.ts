import {
  valueFailure,
  valueCreated,
  ValueResult,
  validationError,
  ValidationError,
} from "#shared/application/errors/domain-errors";

export class HomeAirport {
  #value: string;

  private constructor(value: string) {
    this.#value = value;
  }

  static create(value: unknown): ValueResult<HomeAirport> {
    if (!value || typeof value !== "string") {
      return valueFailure([
        validationError({
          field: "homeAirport",
          code: "PRESENCE.HOME_AIRPORT.INVALID_TYPE",
          message: "Must be a string",
        }),
      ]);
    }
    const errors = [] as ValidationError[];

    if (value.length !== 4) {
      errors.push(
        validationError({
          field: "homeAirport",
          code: "PRESENCE.HOME_AIRPORT.INVALID_LENGTH",
          message: "Must be a valid 4-letter ICAO code",
        })
      );
    }

    if (value !== value.toUpperCase()) {
      errors.push(
        validationError({
          field: "homeAirport",
          code: "PRESENCE.HOME_AIRPORT.NOT_UPPERCASE",
          message: "Must be in uppercase",
        })
      );
    }

    if (errors.length > 0) {
      return valueFailure(errors);
    }
    return valueCreated(new HomeAirport(value));
  }

  static fromTrusted(value: string): HomeAirport {
    return new HomeAirport(value);
  }

  get value(): string {
    return this.#value;
  }
}
