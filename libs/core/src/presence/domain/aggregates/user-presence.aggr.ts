import { Profile } from "#presence/domain/entities/profile.entity";
import { SkillLevel } from "#values";
import { DomainEvent } from "#shared/events/domain-event-bus";
import { Presence } from "#presence/domain/entities/presence.entity";
import {
  entityCreated,
  entityFailure,
  EntityResult,
  InvariantViolationException,
} from "#shared/application/errors/domain-errors";
import { MODULE_SUBJECT } from "#shared/application/module";
import { groupValidationResults } from "#shared/application/validation";

export type UserPresenceData = {
  presence: Presence;
  profiles: Profile[];
};

export class UserPresence {
  #presence: Presence;
  #profiles: Profile[] = [];
  #domainEvents: DomainEvent[] = [];

  private constructor(data: UserPresenceData) {
    this.#presence = data.presence;
    this.#profiles = data.profiles;
  }

  static create(
    userId: string,
    {
      displayName,
      firstName,
      lastName,
      pronouns,
      homeAirport,
      skillLevel,
    }: {
      displayName: string;
      firstName: string;
      lastName: string;
      pronouns: string;
      homeAirport: string;
      skillLevel: SkillLevel;
    },
    dataContext?: string
  ): EntityResult<UserPresence> {
    const presenceResult = Presence.createInitial({ userId });

    if (!presenceResult.ok) {
      return presenceResult;
    }

    const presence = presenceResult.instance;

    const profileResult = Profile.createPrimary(presence.id, {
      displayName,
      firstName,
      lastName,
      pronouns,
      homeAirport,
      skillLevel,
    });

    const [errors, validated] = groupValidationResults(
      {
        presence: presenceResult,
        profile: profileResult,
      },
      dataContext
    );

    if (errors) {
      return entityFailure(errors);
    }

    const userPresence = new UserPresence({ presence: validated.presence, profiles: [validated.profile] });

    return entityCreated(userPresence);
  }

  static hydrate(data: UserPresenceData) {
    return new UserPresence(data);
  }

  get presence(): Presence {
    return this.#presence;
  }

  get profiles(): Profile[] {
    return this.#profiles;
  }

  get primaryProfile(): Profile {
    const primaryProfile = this.#profiles.find((profile) => profile.isPrimary);
    if (!primaryProfile) {
      throw new InvariantViolationException("A user must have a primary profile", MODULE_SUBJECT.PRESENCE);
    }
    return primaryProfile;
  }

  get profileCount(): number {
    return this.#profiles.length;
  }

  hasProfileWithId(profileId: string): boolean {
    return this.#profiles.some((profile) => profile.id === profileId);
  }

  private raise(event: DomainEvent): void {
    this.#domainEvents.push(event);
  }

  public pullDomainEvents(): DomainEvent[] {
    const events = [...this.#domainEvents];
    this.#domainEvents = [];
    return events;
  }
}
