import { SignableTokenServicePort } from "@cavok/core/auth";
import { Token } from "@cavok/core/auth/domain/values/tokens.value";
import { ActiveIdentity, Identity } from "@cavok/core/contracts/auth.contracts";
import jwt from "jsonwebtoken";
import { HorizonFSConfig } from "src/init";

export type JwtConfig = {
  accessTokenSecret: string;
  refreshTokenSecret: string;
  accessTokenTtlSec: number;
  refreshTokenTtlSec: number;
};

type AccessTokenPayload = ActiveIdentity & {
  type: "access";
};

export class JWTTokenService implements SignableTokenServicePort {
  #config: HorizonFSConfig["security"];

  constructor(config: HorizonFSConfig["security"]) {
    this.#config = config;
  }
  async sign(identity: Identity, sessionId: string): Promise<Token> {
    const accessPayload: AccessTokenPayload = {
      ...identity,
      sessionId,
      type: "access",
    };

    const accessToken = jwt.sign(accessPayload, this.#config.accessToken.secret, {
      expiresIn: this.#config.accessToken.ttlSec,
    });

    return Token.create(accessToken);
  }

  async verify(token: string): Promise<ActiveIdentity | null> {
    try {
      const decoded = jwt.verify(token, this.#config.accessToken.secret) as AccessTokenPayload;

      const { type, ...identity } = decoded;
      if (type !== "access") {
        return null;
      }

      return identity;
    } catch {
      return null;
    }
  }
}
