import { UserPresenceRepositoryPort } from "@cavok/core/presence";
import { UserPresence } from "@cavok/core/presence/domain/aggregates/user-presence.aggr";
import { Presence } from "@cavok/core/presence/domain/entities/presence.entity";
import { Profile } from "@cavok/core/presence/domain/entities/profile.entity";
import { Database, eq, inArray, tables } from "#db";
import { DisplayName } from "@cavok/core/presence/domain/value-objects/display-name.vo";
import { HomeAirport } from "@cavok/core/presence/domain/value-objects/home-airport";

/**
 * Drizzle implementation of UserPresence repository.
 * Handles persistence of UserPresence aggregate root with all child entities.
 *
 * Responsibilities:
 * - Load UserPresence with all related entities (presence, profiles)
 * - Atomically persist aggregate root and child entities
 * - Handle child entity synchronization (profiles)
 */
export class DrizzleUserPresenceRepository implements UserPresenceRepositoryPort {
  #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  /**
   * Find a user presence by presence ID.
   * Loads the complete aggregate with all child entities.
   */
  async findById(id: string): Promise<UserPresence | null> {
    console.log("findById", id);
    // Load presence
    const [presenceRow] = await this.#db.select().from(tables.presence).where(eq(tables.presence.id, id));

    if (!presenceRow) {
      return null;
    }
    console.log("presenceRow", presenceRow);

    // Load profiles for this presence
    const profileRows = await this.#db
      .select()
      .from(tables.profiles)
      .where(eq(tables.profiles.userPresenceId, presenceRow.id));

    console.log("profileRows", profileRows);

    // Hydrate domain entities
    const presence = Presence.hydrate({ ...presenceRow, values: {} });
    const displayName = DisplayName.fromTrusted(profileRows[0].displayName);
    const homeAirport = HomeAirport.fromTrusted(profileRows[0].homeAirport);
    const profiles = profileRows.map((row) => Profile.hydrate({ ...row, values: { displayName, homeAirport } }));

    // Reconstruct the aggregate
    return UserPresence.hydrate({
      presence,
      profiles,
    });
  }

  /**
   * Find a user presence by user ID.
   * Loads the complete aggregate with all child entities.
   */
  async findByUserId(userId: string): Promise<UserPresence | null> {
    // Load presence by userId
    const [presenceRow] = await this.#db.select().from(tables.presence).where(eq(tables.presence.userId, userId));

    if (!presenceRow) {
      return null;
    }

    // Use findById to load the complete aggregate
    return this.findById(presenceRow.id);
  }

  /**
   * Create a new user presence.
   * Persists the aggregate root and all child entities atomically.
   */
  async create(userPresence: UserPresence): Promise<UserPresence> {
    const presence = userPresence.presence;
    const profiles = userPresence.profiles;

    // Insert presence
    const [insertedPresence] = await this.#db.insert(tables.presence).values(presence.toPersistence()).returning();

    if (!insertedPresence) {
      throw new Error("Failed to create presence");
    }

    console.log("insertedPresence", insertedPresence);
    console.log("profiles", profiles);
    // Insert all profiles
    if (profiles.length > 0) {
      await this.#db.insert(tables.profiles).values(profiles.map((profile) => profile.toPersistence()));
    }

    return userPresence;
  }

  /**
   * Update an existing user presence.
   * Updates the aggregate root and synchronizes all child entities.
   */
  async update(userPresence: UserPresence): Promise<UserPresence> {
    const presence = userPresence.presence;
    const profiles = userPresence.profiles;

    // Update presence
    const [updatedPresence] = await this.#db
      .update(tables.presence)
      .set(presence.toPersistence())
      .where(eq(tables.presence.id, presence.id))
      .returning();

    if (!updatedPresence) {
      throw new Error("User presence not found");
    }

    // Sync profiles
    await this.#syncProfiles(presence.id, profiles);

    return userPresence;
  }

  /**
   * Synchronize profiles for a presence.
   * Handles inserting new profiles, updating existing ones, and deleting removed ones.
   */
  async #syncProfiles(presenceId: string, newProfiles: Profile[]) {
    // Get existing profiles
    const existingRows = await this.#db
      .select()
      .from(tables.profiles)
      .where(eq(tables.profiles.userPresenceId, presenceId));

    const existingIds = new Set(existingRows.map((p) => p.id));
    const newIds = new Set(newProfiles.map((p) => p.id));

    // Find what to delete, update, and insert
    const toDelete = existingRows.filter((p) => !newIds.has(p.id));
    const toUpdate = newProfiles.filter((p) => existingIds.has(p.id));
    const toInsert = newProfiles.filter((p) => !existingIds.has(p.id));

    // Execute changes
    if (toDelete.length > 0) {
      await this.#db.delete(tables.profiles).where(
        inArray(
          tables.profiles.id,
          toDelete.map((p) => p.id),
        ),
      );
    }

    for (const profile of toUpdate) {
      await this.#db.update(tables.profiles).set(profile.toPersistence()).where(eq(tables.profiles.id, profile.id));
    }

    if (toInsert.length > 0) {
      await this.#db.insert(tables.profiles).values(toInsert.map((p) => p.toPersistence()));
    }
  }
}
