import { UserPresence } from "#presence/domain/aggregates/user-presence.aggr";

export interface UserPresenceRepositoryPort {
  findById(id: string): Promise<UserPresence | null>;
  findByUserId(userId: string): Promise<UserPresence | null>;
  create(presence: UserPresence): Promise<UserPresence>;
  update(presence: UserPresence): Promise<UserPresence>;
}
