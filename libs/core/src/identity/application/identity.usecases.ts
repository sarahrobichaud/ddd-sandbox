import { AuthenticationResult, Identity } from "#contracts/auth.contracts";
import {
  ExchangeRefreshTokenCommand,
  LoginWithEmailPasswordCommand,
  RegisterWithEmailPasswordCommand,
  RevokeSessionCommand,
} from "#identity/app/identity.commands";
import { GetActiveSessionsQuery, GetCurrentUserQuery } from "#identity/app/identity.queries";
import { IdentityArgs } from "#identity/app/identity.types";
import { UserAccount } from "#identity/domain/aggregates/user-account.aggr";
import { BUSINESS_ERROR, VALIDATION_ERROR } from "#shared/domain/domain-error";
import { UCResult as Result } from "#shared/application/use-case";
import { Token, TokenPair } from "#identity/domain/values/tokens.value";
import { AuthMapper } from "#identity/app/identity.mapper";
import { ko } from "zod/locales";
import { SessionDetails } from "#contracts/auth.contracts";

/**
 * Register with an email and password
 * @param ctx
 * @returns Auth Result
 */
export const registerWithEmailPassword = async (
  ctx: IdentityArgs<RegisterWithEmailPasswordCommand, "domainEventBus" | "hasher" | "userAccounts">
): Promise<Result<Identity>> => {
  const {
    input: { data, actor },
    infra,
  } = ctx;

  const existingUser = await infra.userAccounts.findByEmail(data.email);

  if (existingUser) {
    return {
      ok: false,
      kind: "conflict",
      errors: [BUSINESS_ERROR.IDENTITY.EMAIL_ALREADY_REGISTERED],
    };
  }

  const [accountError, account] = await UserAccount.createFromEmailPasswordStrategy({
    data: { email: data.email, password: data.password, username: data.username },
    hasher: infra.hasher,
  });

  if (accountError) {
    return {
      ok: false,
      kind: "validation",
      errors: accountError,
    };
  }

  await infra.userAccounts.create(account);
  await infra.domainEventBus.publishAll(account.pullDomainEvents());

  return {
    ok: true,
    data: AuthMapper.toIdentity(account),
  };
};

export const getCurrentUser = async (
  ctx: IdentityArgs<GetCurrentUserQuery, "userAccounts">
): Promise<Result<Identity>> => {
  const {
    infra,
    input: { data, actor },
  } = ctx;

  if (!actor.identity) {
    return {
      ok: false,
      kind: "unauthorized",
      errors: [BUSINESS_ERROR.IDENTITY.INVALID_CREDENTIALS],
    };
  }

  const user = await infra.userAccounts.findById(actor.identity.userId);

  if (!user) {
    return {
      ok: false,
      kind: "not_found",
      errors: [
        {
          kind: "domain",
          code: "IDENTITY.USER_NOT_FOUND",
          message: "User not found",
        },
      ],
    };
  }

  return {
    ok: true,
    data: AuthMapper.toIdentity(user),
  };
};

export const loginWithEmailPassword = async (
  ctx: IdentityArgs<
    LoginWithEmailPasswordCommand,
    "hasher" | "userAccounts" | "accessTokenService" | "refreshTokenService" | "domainEventBus"
  >
): Promise<Result<AuthenticationResult>> => {
  const {
    infra,
    input: { data },
  } = ctx;

  const account = await infra.userAccounts.findByEmail(data.email);

  const isValid = account
    ? await account.verifyPassword(data.password, infra.hasher)
    : await UserAccount.performDummyVerification(data.password, infra.hasher);

  if (!isValid || !account) {
    return {
      ok: false,
      kind: "unauthorized",
      errors: [BUSINESS_ERROR.IDENTITY.INVALID_CREDENTIALS],
    };
  }

  const identity = AuthMapper.toIdentity(account);
  const refreshToken = await infra.refreshTokenService.generate();

  const [sessionErrors, session] = account.createSession(
    refreshToken,
    new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    data.metadata.ipAddress,
    data.metadata.userAgent
  );

  if (sessionErrors) {
    return {
      ok: false,
      kind: "validation",
      errors: sessionErrors,
    };
  }

  const accessToken = await infra.accessTokenService.sign(identity, session.id);

  const tokens = new TokenPair({ accessToken, refreshToken, identity });

  await infra.userAccounts.update(account);
  await infra.domainEventBus.publishAll(account.pullDomainEvents());

  return {
    ok: true,
    data: AuthMapper.toAuthenticationResult(tokens, session.id),
  };
};

/**
 * Exchange a refresh token for a new access token
 * @param ctx - Use case context
 * @returns Use case result containing the new authentication result
 */
export const exchangeRefreshToken = async (
  ctx: IdentityArgs<
    ExchangeRefreshTokenCommand,
    "accessTokenService" | "refreshTokenService" | "userAccounts" | "domainEventBus"
  >
): Promise<Result<AuthenticationResult>> => {
  const {
    infra,
    input: { data },
  } = ctx;

  const account = await infra.userAccounts.findByRefreshToken(data.refreshToken);

  if (!account) {
    return {
      ok: false,
      kind: "unauthorized",
      errors: [BUSINESS_ERROR.IDENTITY.INVALID_CREDENTIALS],
    };
  }

  // find the active session by the refresh token
  const identity = AuthMapper.toIdentity(account);
  const session = account.findActiveSessionByRefreshToken(data.refreshToken);

  if (!session) {
    return {
      ok: false,
      kind: "unauthorized",
      errors: [BUSINESS_ERROR.IDENTITY.INVALID_CREDENTIALS],
    };
  }

  // generate a new refresh token
  const newRefreshToken = await infra.refreshTokenService.generate();
  const rotated = account.rotateSession(
    session.id,
    newRefreshToken,
    new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    data.metadata.ipAddress,
    data.metadata.userAgent
  );

  if (!rotated) {
    return {
      ok: false,
      kind: "unauthorized",
      errors: [BUSINESS_ERROR.IDENTITY.INVALID_CREDENTIALS],
    };
  }

  const accessToken = await infra.accessTokenService.sign(identity, rotated.id);
  const tokens = new TokenPair({ accessToken, refreshToken: newRefreshToken, identity });

  await infra.userAccounts.update(account);
  await infra.domainEventBus.publishAll(account.pullDomainEvents());

  return {
    ok: true,
    data: AuthMapper.toAuthenticationResult(tokens, session.id),
  };
};

export const revokeSession = async (
  ctx: IdentityArgs<RevokeSessionCommand, "userAccounts" | "domainEventBus">
): Promise<Result<void>> => {
  const {
    infra,
    input: { data },
  } = ctx;

  const account = await infra.userAccounts.findBySessionId(data.sessionId);

  if (!account) {
    return {
      ok: true,
      data: undefined,
    };
  }

  const revoked = account.revokeSession(data.sessionId);

  if (!revoked) {
    // Session already revoked or doesn't exist - still consider this success
    return {
      ok: true,
      data: undefined,
    };
  }

  await infra.userAccounts.update(account);
  await infra.domainEventBus.publishAll(account.pullDomainEvents());

  return {
    ok: true,
    data: undefined,
  };
};

export const getActiveSessions = async (
  ctx: IdentityArgs<GetActiveSessionsQuery, "userAccounts" | "domainEventBus">
): Promise<Result<SessionDetails[]>> => {
  const {
    infra,
    input: { data, actor },
  } = ctx;

  if (!actor.identity) {
    return {
      ok: false,
      kind: "unauthorized",
      errors: [BUSINESS_ERROR.IDENTITY.INVALID_CREDENTIALS],
    };
  }

  const account = await infra.userAccounts.findById(actor.identity.userId);

  if (!account) {
    return {
      ok: false,
      kind: "unauthorized",
      errors: [BUSINESS_ERROR.IDENTITY.INVALID_CREDENTIALS],
    };
  }

  const sessions = account.getActiveSessions();

  return {
    ok: true,
    data: AuthMapper.toSessionDetails(sessions),
  };
};
