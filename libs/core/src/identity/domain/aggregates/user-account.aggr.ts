import { User } from "#identity/domain/entities/user.entity";
import { AuthProvider } from "#identity/domain/entities/auth-provider.entity";
import { Session } from "#identity/domain/entities/session.entity";
import { BehaviorResult, FactoryError, FactoryResult, Identifier } from "#shared/domain/types";
import { VALIDATION_ERROR, ValidationErrorOld } from "#shared/domain/domain-error";
import { DomainEvent } from "#shared/events/app-events";
import { EVENT } from "#shared/events/event-names";
import { PasswordHasherPort } from "#identity/app/index";
import { Password } from "#identity/domain/values/password.value";
import { VALUE } from "#values";
import { validateGroup } from "#shared/application/validation";
import { email } from "zod";
import { Token } from "../values/tokens.value";

export type UserAccountData = {
  user: User;
  sessions: Session[];
  providers: AuthProvider[];
};

export type RequiredUserAccountData = {
  user: User;
  initialProvider: AuthProvider;
};

export class UserAccount {
  #user: User;
  #providers: Map<Identifier, AuthProvider>;
  #sessions: Map<Identifier, Session>;
  #domainEvents: DomainEvent[] = [];

  private constructor(data: UserAccountData) {
    this.#user = data.user;
    this.#providers = new Map(data.providers.map((provider) => [provider.id, provider]));
    this.#sessions = new Map(data.sessions.map((session) => [session.id, session]));
  }

  static async createFromEmailPasswordStrategy({
    data,
    hasher,
  }: {
    data: { email: string; password: string; username: string };
    hasher: PasswordHasherPort;
  }): Promise<FactoryResult<UserAccount>> {
    const [validationErrors, validated] = validateGroup({
      password: Password.create(data.password),
      user: User.create({ email: data.email, username: data.username }),
    });

    if (validationErrors) {
      return [validationErrors, null];
    }

    // TODO: Handle error
    const hashedPassword = await hasher.hash(validated.password);

    const [providerErrors, provider] = AuthProvider.create({
      userId: validated.user.id,
      providerType: VALUE.PROVIDER_TYPE.EMAIL_PASSWORD,
      providerUserId: data.email,
      email: data.email,
      password: hashedPassword,
      accessToken: null,
      refreshToken: null,
    });

    if (providerErrors) {
      return [providerErrors, null];
    }

    return UserAccount.create({
      user: validated.user,
      initialProvider: provider,
    });
  }

  protected static create(data: RequiredUserAccountData): FactoryResult<UserAccount> {
    const errors: ValidationErrorOld[] = [];

    if (data.initialProvider.userId !== data.user.id) {
      errors.push(VALIDATION_ERROR.IDENTITY.USER_ACCOUNT.PROVIDER_USER_ID_MISMATCH);
    }

    if (errors.length > 0) {
      return [errors, null];
    }

    const account = new UserAccount({
      user: data.user,
      providers: [data.initialProvider],
      sessions: [],
    });

    account.raise({
      name: EVENT.AUTH.USER_ACCOUNT_CREATED,
      payload: {
        accountId: account.id,
      },
      occurredAt: new Date(),
    });

    return [null, account];
  }

  static hydrate(data: UserAccountData) {
    return new UserAccount(data);
  }

  private raise(event: DomainEvent): void {
    this.#domainEvents.push(event);
  }

  public pullDomainEvents(): DomainEvent[] {
    const events = [...this.#domainEvents];
    this.#domainEvents = [];
    return events;
  }

  get id(): Identifier {
    return this.#user.id;
  }

  get user(): User {
    return this.#user;
  }

  get providers() {
    return Array.from(this.#providers.values());
  }

  get sessions() {
    return Array.from(this.#sessions.values());
  }

  linkPrimaryProfile(profileId: string): BehaviorResult<UserAccount> {
    const [errors, updatedUser] = this.#user.updatePrimaryProfileId(profileId);

    if (errors) {
      return [errors, null];
    }

    this.#user = updatedUser;

    this.raise({
      name: EVENT.AUTH.PRIMARY_PROFILE_LINKED,
      payload: {
        userId: this.id,
        profileId: profileId,
      },
      occurredAt: new Date(),
    });

    return [null, this];
  }

  async verifyPassword(plainPassword: string, hasher: PasswordHasherPort): Promise<boolean> {
    // Find the email/password provider
    const emailProvider = this.providers.find((p) => p.providerType === VALUE.PROVIDER_TYPE.EMAIL_PASSWORD);

    if (!emailProvider || !emailProvider.password) {
      return false;
    }

    const [errors, password] = Password.create(plainPassword);

    if (errors) {
      return false;
    }

    return await hasher.compare(password, emailProvider.password);
  }
  static async performDummyVerification(plainPassword: string, hasher: PasswordHasherPort): Promise<false> {
    const DUMMY_HASH =
      process.env.DUMMY_PASSWORD_HASH || "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

    const [errors, password] = Password.create(plainPassword);

    if (errors) {
      return false;
    }

    await hasher.compare(password, Password.fromHash(DUMMY_HASH));
    return false;
  }

  createSession(
    refreshToken: Token,
    expiresAt: Date,
    ipAddress: string = "unknown",
    userAgent: string = "unknown"
  ): FactoryResult<Session> {
    const [errors, session] = Session.create({
      userId: this.id,
      refreshToken: refreshToken.value,
      expiresAt,
      user_agent: userAgent,
      ip_address: ipAddress,
    });

    if (errors) {
      return [errors, null];
    }

    this.#sessions.set(session.id, session);

    this.raise({
      name: EVENT.AUTH.SESSION_CREATED,
      payload: {
        accountId: this.id,
        sessionId: session.id,
      },
      occurredAt: new Date(),
    });

    return [null, session];
  }

  /**
   * Find an active session by refresh token
   */
  findActiveSessionByRefreshToken(refreshToken: string): Session | null {
    for (const session of this.#sessions.values()) {
      if (session.refreshToken === refreshToken && session.isActive) {
        return session;
      }
    }
    return null;
  }

  /**
   * Rotate a session's refresh token
   */
  rotateSession(
    sessionId: Identifier,
    newRefreshToken: Token,
    newExpiresAt: Date,
    ipAddress: string,
    userAgent: string
  ): Session | null {
    const session = this.#sessions.get(sessionId);

    if (!session || !session.isActive) {
      return null;
    }

    session.rotate(newRefreshToken, newExpiresAt, ipAddress, userAgent);

    this.raise({
      name: EVENT.AUTH.SESSION_ROTATED,
      payload: {
        accountId: this.id,
        sessionId: session.id,
      },
      occurredAt: new Date(),
    });

    return session;
  }

  /**
   * Revoke a session
   */
  revokeSession(sessionId: Identifier): boolean {
    const session = this.#sessions.get(sessionId);

    if (!session) {
      return false;
    }

    session.revoke();

    this.raise({
      name: EVENT.AUTH.SESSION_REVOKED,
      payload: {
        accountId: this.id,
        sessionId: session.id,
      },
      occurredAt: new Date(),
    });

    return true;
  }

  /**
   * Revoke a session by refresh token
   */
  revokeSessionByRefreshToken(refreshToken: string): boolean {
    for (const session of this.#sessions.values()) {
      if (session.refreshToken === refreshToken) {
        return this.revokeSession(session.id);
      }
    }
    return false;
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): Session[] {
    return Array.from(this.#sessions.values()).filter((s) => s.isActive);
  }

  /**
   * Revoke all sessions except the specified one
   */
  revokeAllSessionsExcept(sessionId: Identifier): void {
    for (const session of this.#sessions.values()) {
      if (session.id !== sessionId && session.isActive) {
        this.revokeSession(session.id);
      }
    }
  }

  /**
   * Clean up expired sessions (removes them from memory)
   */
  cleanupExpiredSessions(): void {
    for (const [id, session] of this.#sessions.entries()) {
      if (session.isExpired) {
        this.#sessions.delete(id);
      }
    }
  }
}
