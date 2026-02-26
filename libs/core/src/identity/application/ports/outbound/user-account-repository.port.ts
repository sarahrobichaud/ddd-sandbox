import { UserAccount } from "#identity/domain/aggregates/user-account.aggr";

/**
 * Repository port for UserAccount aggregate root.
 *
 * This is an OUTBOUND port - the domain defines what it needs,
 * infrastructure implements how to persist it.
 *
 * Responsibilities:
 * - Persist UserAccount aggregate
 * - Load UserAccount with all child entities (auth providers, sessions)
 * - Handle optimistic locking via version field
 */
export interface UserAccountRepositoryPort {
  /**
   * Find a user account by ID.
   * Must load the aggregate with all child entities.
   */
  findById(id: string): Promise<UserAccount | null>;

  /**
   * Find a user account by email.
   * Searches through auth providers to find email match.
   */
  findByEmail(email: string): Promise<UserAccount | null>;

  /**
   * Create a new user account.
   * Must persist the aggregate root and all child entities atomically.
   */
  create(account: UserAccount): Promise<UserAccount>;

  /**
   * Update an existing user account.
   * Must check version for optimistic locking.
   * Returns updated account or throws if version mismatch.
   */
  update(account: UserAccount): Promise<UserAccount>;

  /**
   * Check if email is already registered.
   * Used for validation before creating new accounts.
   */
  existsByEmail(email: string): Promise<boolean>;

  /**
   * Find a user account via a refresh token
   * @param refreshToken - The refresh token to search for
   * @returns The user account if found, null otherwise
   */
  findByRefreshToken(refreshToken: string): Promise<UserAccount | null>;

  /**
   * Find a user account by session ID
   * @param sessionId - The session ID to find the user account by
   * @returns The user account if found, null otherwise
   */
  findBySessionId(sessionId: string): Promise<UserAccount | null>;
}
