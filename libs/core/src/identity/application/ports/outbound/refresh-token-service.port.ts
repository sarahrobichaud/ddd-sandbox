import { Token } from "#identity/domain/values/tokens.value";

export interface RefreshTokenServicePort {
  /**
   * Generate a cryptographically secure random token
   */
  generate(): Promise<Token>;
}
