import { UserAccountRepositoryPort } from "@cavok/core/auth";
import { and, Database, eq, inArray, isNull, tables } from "#db";

// Import domain types from node_modules since they're not exported via package.json exports
import { UserAccount } from "@cavok/core/auth/domain/aggregates/user-account.aggr";
import { User } from "@cavok/core/auth/domain/entities/user.entity";
import { UUIDGenerator } from "@cavok/core/shared/identity/uuid-generator.port";
import { AuthProvider } from "@cavok/core/auth/domain/entities/auth-provider.entity";
import { Session } from "@cavok/core/auth/domain/entities/session.entity";
import { Password } from "@cavok/core/auth/domain/values/password.value";
import { VALUE } from "@cavok/core/values";
import { Username } from "@cavok/core/auth/domain/values/username.value";

/**
 * Drizzle implementation of UserAccount repository.
 * Handles persistence of UserAccount aggregate root with all child entities.
 *
 * Responsibilities:
 * - Load UserAccount with all related entities (providers, sessions)
 * - Atomically persist aggregate root and child entities
 * - Handle optimistic locking via version field
 */
export class DrizzleUserAccountRepository implements UserAccountRepositoryPort {
  #db: Database;
  #uuid: UUIDGenerator;

  constructor(db: Database, uuid: UUIDGenerator) {
    this.#db = db;
    this.#uuid = uuid;
  }
  async findBySessionId(sessionId: string): Promise<UserAccount | null> {
    const [sessionRow] = await this.#db
      .select()
      .from(tables.sessions)
      .where(and(eq(tables.sessions.id, sessionId), isNull(tables.sessions.revokedAt)));

    if (!sessionRow) {
      return null;
    }

    return this.findById(sessionRow.userId);
  }

  /**
   * Find a user account via a refresh token
   * @param refreshToken - The refresh token to search for (needs to be a valid refresh token)
   * @returns The user account if found, null otherwise
   */
  async findByRefreshToken(refreshToken: string): Promise<UserAccount | null> {
    const [sessionRow] = await this.#db
      .select()
      .from(tables.sessions)
      .where(and(eq(tables.sessions.refreshToken, refreshToken), isNull(tables.sessions.revokedAt)));

    if (!sessionRow) {
      return null;
    }

    return this.findById(sessionRow.userId);
  }

  /**
   * Find a user account by ID.
   * Loads the complete aggregate with all child entities.
   */
  async findById(id: string): Promise<UserAccount | null> {
    // Load user
    const [userRow] = await this.#db.select().from(tables.users).where(eq(tables.users.id, id));

    if (!userRow) {
      return null;
    }

    // Load providers for this user
    const providerRows = await this.#db.select().from(tables.authProviders).where(eq(tables.authProviders.userId, id));

    // Load sessions for this user
    const sessionRows = await this.#db
      .select()
      .from(tables.sessions)
      .where(and(eq(tables.sessions.userId, id), isNull(tables.sessions.revokedAt)));

    // Get passwords of email password providers
    const providers = [];

    for (const provider of providerRows) {
      let password: Password | null = null;
      if (provider.providerType === VALUE.PROVIDER_TYPE.EMAIL_PASSWORD) {
        const passwordRows = await this.#db
          .select()
          .from(tables.passwords)
          .where(eq(tables.passwords.authProviderId, provider.id));
        password = Password.fromHash(passwordRows[0].passwordHash ?? "");
      }

      if (password) {
        providers.push(AuthProvider.hydrate({ ...provider, values: { password } }));
      } else {
        providers.push(AuthProvider.hydrate({ ...provider, values: { password: null } }));
      }
    }

    const username = Username.fromPersistence(userRow.username);
    // Hydrate domain entities
    const user = User.hydrate({ ...userRow, values: { username } });
    const sessions = sessionRows.map((row) => Session.hydrate({ ...row, values: {} }));

    // Reconstruct the aggregate
    return UserAccount.hydrate({
      user,
      providers,
      sessions,
    });
  }

  /**
   * Find a user account by email.
   * Searches through auth providers to find email match.
   */
  async findByEmail(email: string): Promise<UserAccount | null> {
    // Find provider with matching email
    const [providerRow] = await this.#db
      .select()
      .from(tables.authProviders)
      .where(eq(tables.authProviders.email, email));

    if (!providerRow) {
      return null;
    }

    // Load the user account by the userId from the provider
    return this.findById(providerRow.userId);
  }

  /**
   * Create a new user account.
   * Persists the aggregate root and all child entities atomically.
   * The transaction should be managed by the calling code.
   */
  async create(account: UserAccount): Promise<UserAccount> {
    const user = account.user;
    const providers = account.providers;
    const sessions = account.sessions;

    // Insert user
    const [insertedUser] = await this.#db.insert(tables.users).values(user.toPersistence()).returning();

    if (!insertedUser) {
      throw new Error("Failed to create user");
    }

    for (const provider of providers) {
      if (provider.isEmailPassword() && provider.password) {
        const date = new Date();
        await this.#db.insert(tables.authProviders).values(provider.toPersistence());
        await this.#db.insert(tables.passwords).values({
          authProviderId: provider.id,
          passwordHash: provider.password.hash,
          createdAt: date,
          updatedAt: date,
          deletedAt: null,
          version: this.#uuid.generate(),
        });
      }
    }

    for (const session of sessions) {
      await this.#db.insert(tables.sessions).values(session.toPersistence());
    }

    return account;
  }

  /**
   * Update an existing user account.
   * Handles optimistic locking by checking version field.
   * Updates the aggregate root and all child entities.
   */
  async update(account: UserAccount): Promise<UserAccount> {
    const { user, sessions, providers } = account;
    const currentVersion = user.version;
    const newVersion = this.#uuid.generate();

    // Update user with version check (optimistic locking)
    const [updatedUser] = await this.#db
      .update(tables.users)
      .set({
        ...user.toPersistence(),
        version: newVersion,
      })
      .where(and(eq(tables.users.id, user.id), eq(tables.users.version, currentVersion)))
      .returning();

    if (!updatedUser) {
      throw new Error("User account not found or version mismatch");
    }

    await this.#syncProviders(user.id, providers);
    await this.#syncSessions(user.id, sessions);

    return account;
  }

  /**
   * Check if email is already registered.
   * Used for validation before creating new accounts.
   */
  async existsByEmail(email: string): Promise<boolean> {
    const [provider] = await this.#db.select().from(tables.authProviders).where(eq(tables.authProviders.email, email));

    return !!provider;
  }

  async #syncProviders(userId: string, newProviders: AuthProvider[]) {
    // Get existing providers
    const existingRows = await this.#db
      .select()
      .from(tables.authProviders)
      .where(eq(tables.authProviders.userId, userId));

    const existingIds = new Set(existingRows.map((p) => p.id));
    const newIds = new Set(newProviders.map((p) => p.id));

    // Find what to delete, update, and insert
    const toDelete = existingRows.filter((p) => !newIds.has(p.id));
    const toUpdate = newProviders.filter((p) => existingIds.has(p.id));
    const toInsert = newProviders.filter((p) => !existingIds.has(p.id));

    // Execute changes
    if (toDelete.length > 0) {
      await this.#db.delete(tables.authProviders).where(
        inArray(
          tables.authProviders.id,
          toDelete.map((p) => p.id),
        ),
      );
    }

    for (const provider of toUpdate) {
      await this.#db
        .update(tables.authProviders)
        .set(provider.toPersistence())
        .where(eq(tables.authProviders.id, provider.id));
    }

    if (toInsert.length > 0) {
      await this.#db.insert(tables.authProviders).values(toInsert.map((p) => p.toPersistence()));
    }
  }

  async #syncSessions(userId: string, newSessions: Session[]) {
    const existingRows = await this.#db.select().from(tables.sessions).where(eq(tables.sessions.userId, userId));

    const existingIds = new Set(existingRows.map((p) => p.id));
    const newIds = new Set(newSessions.map((p) => p.id));

    // Find what to delete, update, and insert
    const toDelete = existingRows.filter((s) => !newIds.has(s.id));
    const toUpdate = newSessions.filter((s) => existingIds.has(s.id));
    const toInsert = newSessions.filter((s) => !existingIds.has(s.id));

    // Execute changes
    if (toDelete.length > 0) {
      await this.#db.delete(tables.sessions).where(
        inArray(
          tables.sessions.id,
          toDelete.map((s) => s.id),
        ),
      );
    }

    for (const session of toUpdate) {
      await this.#db.update(tables.sessions).set(session.toPersistence()).where(eq(tables.sessions.id, session.id));
    }

    if (toInsert.length > 0) {
      await this.#db.insert(tables.sessions).values(toInsert.map((s) => s.toPersistence()));
    }
  }
}
