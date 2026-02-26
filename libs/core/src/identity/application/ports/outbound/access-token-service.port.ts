import { ActiveIdentity, Identity } from "#contracts/auth.contracts";
import { Token } from "#identity/domain/values/tokens.value";

export interface SignableTokenServicePort {
  /**
   * Sign a fresh token
   */
  sign(identity: Identity, sessionId: string): Promise<Token>;

  /**
   * Validate an access token string and return the user, or null if invalid/expired.
   */
  verify(token: string): Promise<ActiveIdentity | null>;
}
