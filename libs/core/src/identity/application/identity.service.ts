import { DomainEventBus } from "#shared/events/domain-event-bus";
import { UserAccountRepositoryPort } from ".";
import { IdentityServicePort } from "./ports/inbound/identity-service.port";
import { ProfileValidatorPort } from "./ports/outbound/profile-validator.port";

export class IdentityService implements IdentityServicePort {
  constructor(
    private readonly userAccounts: UserAccountRepositoryPort,
    private readonly profileValidator: ProfileValidatorPort,
    private readonly domainEventBus: DomainEventBus
  ) {}

  async linkPrimaryProfile(userId: string, profileId: string): Promise<void> {
    // // Load aggregate
    // const userAccount = await this.userAccounts.findById(userId);
    // if (!userAccount) {
    //   throw new EntityNotFoundException("UserAccount", userId);
    // }
    // if (!(await this.profileValidator.profileExistsForUser(profileId, userId))) {
    //   throw new InvariantViolationException(
    //     `Profile ${profileId} does not exist or does not belond to user ${userId}`,
    //     "IDENTITY.PROFILE_LINKING_INVALID_PROFILE"
    //   );
    // }
    // const [error, updatedAccount] = userAccount.linkPrimaryProfile(profileId);
    // if (error) {
    //   throw DomainException.from(error);
    // }
    // // Persist
    // try {
    //   await this.userAccounts.update(updatedAccount);
    //   await this.domainEventBus.publishAll(updatedAccount.pullDomainEvents());
    // } catch (err) {
    //   throw new Error(`Failed to persist user account: ${err instanceof Error ? err.message : "Unknown error"}`);
    // }
  }

  async isUserOnboarded(userId: string): Promise<boolean> {
    throw new Error("Not implemented");
  }
}
