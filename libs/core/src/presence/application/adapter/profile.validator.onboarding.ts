import {
  OnboardingPresenceData,
  OnboardingPresenceValidatorPort,
} from "#onboarding-flow/app/ports/outbound/presence-validator.port";
import { UserPresenceRepositoryPort } from "#presence/app/ports/outbound/user-presence-repository.port";
import { UserPresence } from "#presence/domain/aggregates/user-presence.aggr";
import { validationCreated, validationFailure, ValidationResult } from "#shared/application/errors/domain-errors";

/**
 * Identity profile validator
 * Validates that a profile exists for a user
 * @param presences - The user presence repository
 * @returns The identity profile validator
 */
export class OnboardingPresenceValidator implements OnboardingPresenceValidatorPort {
  constructor(private readonly presences: UserPresenceRepositoryPort) {}

  static readonly FAKE_UUID = "00000000-0000-0000-0000-000000000000";

  validatePresenceData(data: OnboardingPresenceData): ValidationResult<OnboardingPresenceData> {
    const presence = UserPresence.create(
      OnboardingPresenceValidator.FAKE_UUID,
      {
        firstName: data.firstName,
        lastName: data.lastName,
        pronouns: data.pronouns,
        displayName: data.displayName,
        homeAirport: data.homeAirport,
        skillLevel: data.experienceLevel,
      },
      "presenceData"
    );

    if (!presence.ok) {
      return validationFailure(presence.errors);
    }

    return validationCreated({
      displayName: data.displayName,
      firstName: data.firstName,
      lastName: data.lastName,
      pronouns: data.pronouns,
      experienceLevel: data.experienceLevel,
      homeAirport: data.homeAirport,
    });
  }

  /**
   * Check if a profile exists for a user
   * @param profileId - The ID of the profile to check
   * @param userId - The ID of the user to check
   * @returns True if the profile exists in the user's presence, false otherwise
   */
  async profileExistsForUser(profileId: string, userId: string): Promise<boolean> {
    const presence = await this.presences.findByUserId(userId);

    if (!presence) {
      return false;
    }

    return presence.hasProfileWithId(profileId);
  }
}
