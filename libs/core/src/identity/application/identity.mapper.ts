import { ActiveIdentity, AuthenticationResult, Identity, SessionDetails } from "#contracts/auth.contracts";
import { UserAccount } from "#identity/domain/aggregates/user-account.aggr";
import { Session } from "#identity/domain/entities/session.entity";
import { UserId } from "#identity/domain/values/ids.value";
import { TokenPair } from "#identity/domain/values/tokens.value";

export class AuthMapper {
  static toIdentity(account: UserAccount): Identity {
    return {
      email: account.user.primaryEmail,
      profileId: account.user.primaryProfileId,
      isOnboarded: account.user.isOnboarded,
      userId: account.user.id as UserId,
      username: {
        value: account.user.username,
      discriminator: account.user.usernameDiscriminator,
      }
    };
  }

  static toActiveIdentity(account: UserAccount, sessionId: string): ActiveIdentity {
    return {
      sessionId,
      email: account.user.primaryEmail,
      profileId: account.user.primaryProfileId,
      isOnboarded: account.user.isOnboarded,
      userId: account.user.id as UserId,
      username: {
        value: account.user.username,
      discriminator: account.user.usernameDiscriminator,
      }
    };
  }

  static toAuthenticationResult(tokens: TokenPair, sessionId: string): AuthenticationResult {
    return {
      identity: {
        ...tokens.identity,
        sessionId,
      },
      tokens: {
        access_token: tokens.accessToken.value,
        refresh_token: tokens.refreshToken.value,
        token_type: "Bearer",
        expires_in: 3600,
      },
    };
  }

  static toSessionDetails(sessions: Session[]): SessionDetails[] {
    return sessions.map((session) => ({
      id: session.id,
      user_agent: session.userAgent,
      ip_address: session.ipAddress,
    }));
  }
}
