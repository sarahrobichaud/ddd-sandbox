// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SERVICE (Business Logic Layer)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// libs/core/src/presence/application/presence.service.ts

import { PresenceServicePort } from "#presence/app/ports/inbound/presence-service";
import { UserPresenceRepositoryPort } from "#presence/app/ports/outbound/user-presence-repository.port";
import { UserPresence } from "#presence/domain/aggregates/user-presence.aggr";
import { InvariantViolationException } from "#shared/application/errors/domain-errors";
import { DomainEventBus } from "#shared/events/domain-event-bus";
import { MODULE_SUBJECT } from "#shared/application/module";
import { Service } from "#shared/application/service";
import { SkillLevel } from "#values";

export type PresenceServiceDeps = {
  presenceRepository: UserPresenceRepositoryPort;
  domainEventBus: DomainEventBus;
};

/**
 * The presence service implementation
 */
export class PresenceService extends Service implements PresenceServicePort {
  #presenceRepository: UserPresenceRepositoryPort;
  #domainEventBus: DomainEventBus;

  constructor(deps: PresenceServiceDeps) {
    super();
    this.#presenceRepository = super.proxyRepository(deps.presenceRepository);
    this.#domainEventBus = deps.domainEventBus;
  }

  /**
   * Initialize user presence for a new user
   * @param userId - The ID of the user to initialize presence for
   * @param data - The presence and profile data
   * @returns The created UserPresence aggregate
   * @throws InvariantViolationException if presence already exists
   * @throws ValidationException if the presence fails validation
   * @throws PersistenceException if an error occurs while persisting
   */
  async initialize(
    userId: string,
    data: {
      displayName: string;
      firstName: string;
      lastName: string;
      homeAirport: string;
      skillLevel: SkillLevel;
      pronouns: string;
    }
  ): Promise<UserPresence> {
    // Check if user already has a presence
    const existingPresence = await this.#presenceRepository.findByUserId(userId);

    if (existingPresence) {
      throw new InvariantViolationException(
        "Attempted to initialize presence for a user that already has a presence",
        MODULE_SUBJECT.PRESENCE
      );
    }

    // Create the UserPresence aggregate
    const userPresence = super.unwrapOrThrow(
      UserPresence.create(userId, {
        displayName: data.displayName,
        firstName: data.firstName,
        lastName: data.lastName,
        pronouns: data.pronouns || "",
        homeAirport: data.homeAirport,
        skillLevel: data.skillLevel,
      })
    );

    // Persist the aggregate
    await this.#presenceRepository.create(userPresence);
    await this.#domainEventBus.publishAll(userPresence.pullDomainEvents());

    return userPresence;
  }
}
