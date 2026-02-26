import { UserPresence } from "#presence/domain/aggregates/user-presence.aggr";
import { PresenceDTO } from "#contracts/presence.contracts";

export class PresenceMapper {
  static toDTO(userPresence: UserPresence): PresenceDTO {
    return {
      id: userPresence.presence.id,
      status: userPresence.presence.status,
      userId: userPresence.presence.userId,
      profile: {
        id: userPresence.primaryProfile.id,
        displayName: userPresence.primaryProfile.displayName,
        firstName: userPresence.primaryProfile.firstName,
        lastName: userPresence.primaryProfile.lastName,
        pronouns: userPresence.primaryProfile.pronouns,
        homeAirport: userPresence.primaryProfile.homeAirport,
        skillLevel: userPresence.primaryProfile.skillLevel,
        aviationExperience: userPresence.primaryProfile.aviationExperience,
        simulatorType: userPresence.primaryProfile.simulatorType,
      },
    };
  }
}
