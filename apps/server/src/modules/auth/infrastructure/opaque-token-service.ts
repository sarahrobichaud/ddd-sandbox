import { Token } from "@cavok/core/auth/domain/values/tokens.value";
import { RefreshTokenServicePort } from "node_modules/@cavok/core/src/identity/application/ports/outbound/refresh-token-service.port";
import { randomBytes } from "node:crypto";

export class OpaqueTokenService implements RefreshTokenServicePort {
  async generate(): Promise<Token> {
    const tokenValue = randomBytes(32).toString("base64url");

    return Token.create(tokenValue);
  }
}
