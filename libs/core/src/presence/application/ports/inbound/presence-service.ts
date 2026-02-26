import { UserPresence } from "#presence/domain/aggregates/user-presence.aggr";
import { SkillLevel } from "#values";

export interface PresenceServicePort {
  initialize(
    userId: string,
    data: {
      displayName: string;
      firstName: string;
      lastName: string;
      homeAirport: string;
      skillLevel: SkillLevel;
      pronouns: string;
    }
  ): Promise<UserPresence>;
}
