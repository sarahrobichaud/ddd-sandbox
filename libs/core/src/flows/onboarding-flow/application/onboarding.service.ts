// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SERVICE (Business Logic Layer)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// libs/core/src/flows/onboarding-flow/application/onboarding.service.ts

import { OnboardingRepositoryPort } from "./ports/outbound/onboarding-repository.port";
import { DomainEventBus } from "#shared/events/domain-event-bus";
import { OnboardingProgress } from "#onboarding-flow/domain/onboarding-progress.entity";
import {
  EntityNotFoundException,
  DomainException,
  InvariantViolationException,
} from "#shared/application/errors/domain-errors";
import { OnboardingServicePort } from "#onboarding-flow/app/ports";
import { MODULE_SUBJECT } from "#shared/application/module";
import { Service } from "#shared/application/service";
import {
  OnboardingPresenceData,
  OnboardingPresenceValidatorPort,
} from "#onboarding-flow/app/ports/outbound/presence-validator.port";
import { CompletePresenceStepCommand } from "#contracts/onboarding.contracts";

export type OnboardingServiceDeps = {
  onboardingRepository: OnboardingRepositoryPort;
  domainEventBus: DomainEventBus;
  presenceValidator: OnboardingPresenceValidatorPort;
};

/**
 * The onboarding service implementation
 */
export class OnboardingService extends Service implements OnboardingServicePort {
  #onboardingRepository: OnboardingRepositoryPort;
  #domainEventBus: DomainEventBus;
  #presenceValidator: OnboardingPresenceValidatorPort;

  constructor(deps: OnboardingServiceDeps) {
    super();
    this.#onboardingRepository = super.proxyRepository(deps.onboardingRepository);
    this.#domainEventBus = deps.domainEventBus;
    this.#presenceValidator = deps.presenceValidator;
  }

  /**
   * Initialize onboarding for a new user
   * @param userId - The ID of the user to initialize onboarding for
   * @returns The onboarding progress DTO
   * @throws InvariantViolationException if onboarding is already in progress
   * @throws ValidationException if the onboarding fails to be created
   * @throws PersistenceException If an error occurs while persisting the onboarding
   */
  async initialize(userId: string): Promise<OnboardingProgress> {
    // Check if already exists
    const existing = await this.#onboardingRepository.findByUserId(userId);

    if (existing && !existing.isCompleted) {
      throw new InvariantViolationException(
        "Attempted to initialize onboarding for a user that already has an onboarding in progress",
        MODULE_SUBJECT.ONBOARDING
      );
    }

    // Create new onboarding
    const newProgress = super.unwrapOrThrow(OnboardingProgress.create({ userId }));

    // Persist the onboarding progress
    await this.#onboardingRepository.create(newProgress);
    await this.#domainEventBus.publishAll(newProgress.pullDomainEvents());

    return newProgress;
  }

  async getStatus(userId: string): Promise<OnboardingProgress> {
    const progress = await this.#onboardingRepository.findByUserId(userId);

    if (!progress) {
      throw new EntityNotFoundException("OnboardingProgress", userId);
    }

    return progress;
  }
  async completeWelcomeStep(userId: string): Promise<OnboardingProgress> {
    const progress = await this.#onboardingRepository.findByUserId(userId);

    if (!progress) {
      throw new EntityNotFoundException("OnboardingProgress", userId);
    }

    const result = super.unwrapOrThrow(progress.completeWelcomeStep());

    await this.#onboardingRepository.update(result);

    await this.#domainEventBus.publishAll(result.pullDomainEvents());

    return result;
  }

  async completePresenceStep(data: CompletePresenceStepCommand): Promise<OnboardingProgress> {
    const { userId, presenceData } = data;
    const progress = await this.#onboardingRepository.findByUserId(userId);

    if (!progress) {
      throw new EntityNotFoundException("OnboardingProgress", userId);
    }

    const validatedPresenceData = super.unwrapOrThrow(this.#presenceValidator.validatePresenceData(presenceData));
    const result = super.unwrapOrThrow(progress.completePresenceStep(validatedPresenceData));

    await this.#onboardingRepository.update(result);

    await this.#domainEventBus.publishAll(result.pullDomainEvents());

    return result;
  }

  async completeOnboarding(userId: string): Promise<OnboardingProgress> {
    const progress = await this.#onboardingRepository.findByUserId(userId);

    if (!progress) {
      throw new EntityNotFoundException("OnboardingProgress", userId);
    }

    const result = super.unwrapOrThrow(progress.completeOnboarding());

    await this.#onboardingRepository.update(result);

    await this.#domainEventBus.publishAll(result.pullDomainEvents());

    return result;
  }

  async markPresenceCreated(userId: string): Promise<OnboardingProgress> {
    const progress = await this.#onboardingRepository.findByUserId(userId);

    if (!progress) {
      throw new EntityNotFoundException("OnboardingProgress", userId);
    }

    const result = super.unwrapOrThrow(progress.markPresenceCreated());

    await this.#onboardingRepository.update(result);

    await this.#domainEventBus.publishAll(result.pullDomainEvents());

    return result;
  }
}
