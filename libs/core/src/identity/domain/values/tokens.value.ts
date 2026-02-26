import { Identity } from "#contracts/auth.contracts";

export class Token {
  readonly #value: string;

  private constructor(value: string) {
    this.#value = value;
  }

  static create(value: string): Token {
    return new Token(value);
  }

  get value(): string {
    return this.#value;
  }

  equals(other: Token): boolean {
    return this.#value === other.#value;
  }
}

export class TokenPair {
  readonly #accessToken: Token;
  readonly #refreshToken: Token;
  readonly #identity: Identity;

  constructor(props: { accessToken: Token; refreshToken: Token; identity: Identity }) {
    this.#accessToken = props.accessToken;
    this.#refreshToken = props.refreshToken;
    this.#identity = props.identity;
  }

  get accessToken(): Token {
    return this.#accessToken;
  }

  get refreshToken(): Token {
    return this.#refreshToken;
  }

  get identity(): Identity {
    return this.#identity;
  }
}
