// libs/core/src/onboarding-flow/domain/onboarding-progress.entity.ts

import { Entity } from "#shared/domain/entity";
import { Identifier } from "#shared/domain/types";
import { DomainEvent } from "#shared/events/domain-event-bus";
import { EVENT } from "#shared/events/event-names";
import { OnboardingStep, VALUE } from "#values";
import { schema } from "@cavok/data";

import { DisplayName } from "#presence/domain/value-objects/display-name.vo";
import { HomeAirport } from "#presence/domain/value-objects/home-airport";
import {
  businessRuleError,
  DomainActionResult,
  entityCreated,
  EntityResult,
  success,
} from "#shared/application/errors/domain-errors";
import { failure } from "#shared/application/errors/domain-errors";
import { OnboardingPresenceData } from "#onboarding-flow/app/ports/outbound/presence-validator.port";
/**
 * Presences published language since we are collecting presence data
 */

/**
 * The values of the onboarding progress entity
 */
export type OnboardingProgressValues = {};
export type OnboardingProgressData = typeof schema.onboardingProgress.$inferSelect & {
  values: OnboardingProgressValues;
};
/**
 * The required data to create an onboarding progress entity
 */
export type RequiredOnboardingProgressData = {
  userId: Identifier;
};

//TODO: Change this to a state object
export class OnboardingProgress extends Entity<OnboardingProgressData> {
  #domainEvents: DomainEvent[] = [];

  /**
   * Initialize onboarding for a new user
   */
  static create(data: RequiredOnboardingProgressData): EntityResult<OnboardingProgress> {
    const progress = new OnboardingProgress({
      ...Entity.defaultValues,
      userId: data.userId,
      currentStep: "WELCOME",
      completedSteps: [],
      isCompleted: false,
      presenceData: null,
      startedAt: new Date(),
      completedAt: null,
      values: {},
    });

    return entityCreated(progress);
  }

  /**
   * Hydrate from database
   */
  static hydrate(data: OnboardingProgressData): OnboardingProgress {
    return new OnboardingProgress(data);
  }

  private raise(event: DomainEvent): void {
    this.#domainEvents.push(event);
  }

  public pullDomainEvents(): DomainEvent[] {
    const events = [...this.#domainEvents];
    this.#domainEvents = [];
    return events;
  }

  completeWelcomeStep(): DomainActionResult<OnboardingProgress> {
    if (this._props.isCompleted) {
      return failure({
        operation: "completeWelcomeStep",
        code: "ONBOARDING.COMPLETE_WELCOME_STEP",
        errors: [
          businessRuleError({
            code: "ONBOARDING.ALREADY_COMPLETED",
            message: "Onboarding has already been completed",
          }),
        ],
      });
    }

    // If already completed, return success without side effects
    const alreadyCompleted = this._props.completedSteps.includes(VALUE.ONBOARDING_STEP.WELCOME);

    if (alreadyCompleted) {
      // No-op: step already completed, return current state
      return success(this);
    }

    // Mark as completed and advance
    this._props.completedSteps.push(VALUE.ONBOARDING_STEP.WELCOME);
    this._props.currentStep = VALUE.ONBOARDING_STEP.PRESENCE;
    this.touch();

    this.raise({
      name: EVENT.ONBOARDING.STEP_COMPLETED,
      payload: {
        userId: this.userId,
        onboardingId: this.id,
        step: VALUE.ONBOARDING_STEP.WELCOME,
        data: null,
      },
      occurredAt: new Date(),
    });

    return success(this);
  }

  completePresenceStep(presenceData: OnboardingPresenceData): DomainActionResult<OnboardingProgress> {
    const failureResult = failure({
      operation: "completePresenceStep",
      code: "ONBOARDING.COMPLETE_PRESENCE_STEP",
      errors: [],
    });

    if (this._props.isCompleted) {
      failureResult.errors.push(
        businessRuleError({
          code: "ONBOARDING.ALREADY_COMPLETED",
          message: "Onboarding has already been completed",
        })
      );
      return failure(failureResult);
    }

    if (!this._props.completedSteps.includes(VALUE.ONBOARDING_STEP.WELCOME)) {
      failureResult.errors.push(
        businessRuleError({
          code: "ONBOARDING.INVALID_STEP_ORDER",
          message: "Welcome step must be completed before completing the presence step",
        })
      );
      return failure(failureResult);
    }

    const wasAlreadyCompleted = this._props.completedSteps.includes(VALUE.ONBOARDING_STEP.PRESENCE);

    // Check if data actually changed
    const dataChanged =
      !this._props.presenceData || JSON.stringify(this._props.presenceData) !== JSON.stringify(presenceData);

    // If step was completed AND data hasn't changed, return without side effects
    if (wasAlreadyCompleted && !dataChanged) {
      return success(this);
    }

    // Mark as completed if not already
    if (!wasAlreadyCompleted) {
      this._props.completedSteps.push(VALUE.ONBOARDING_STEP.PRESENCE);
    }

    // Update the data (either first time or changed)
    this._props.presenceData = presenceData;
    this._props.currentStep = VALUE.ONBOARDING_STEP.COMPLETED;
    this.touch();

    // Validate the presence data

    // Raise appropriate event based on whether this is new or update
    this.raise({
      name: wasAlreadyCompleted ? EVENT.ONBOARDING.STEP_UPDATED : EVENT.ONBOARDING.STEP_COMPLETED,
      payload: {
        userId: this.userId,
        onboardingId: this.id,
        step: VALUE.ONBOARDING_STEP.PRESENCE,
        data: presenceData,
      },
      occurredAt: new Date(),
    });

    return success(this);
  }

  completeOnboarding(): DomainActionResult<OnboardingProgress> {
    const failureResult = failure({
      operation: "completeOnboarding",
      code: "ONBOARDING.COMPLETE_ONBOARDING",
      errors: [],
    });

    if (this._props.isCompleted) {
      failureResult.errors.push(
        businessRuleError({
          code: "ONBOARDING.ALREADY_COMPLETED",
          message: "Onboarding has already been completed",
        })
      );
      return failure(failureResult);
    }

    if (
      !this._props.completedSteps.includes(VALUE.ONBOARDING_STEP.PRESENCE) ||
      !this._props.completedSteps.includes(VALUE.ONBOARDING_STEP.WELCOME) ||
      !this._props.presenceData
    ) {
      failureResult.errors.push(
        businessRuleError({
          code: "ONBOARDING.INVALID_STEP_ORDER",
          message: "Presence step must be completed before completing the onboarding",
        })
      );
      return failure(failureResult);
    }

    const alreadyCompleted = this._props.completedSteps.includes(VALUE.ONBOARDING_STEP.COMPLETED);

    if (alreadyCompleted && this._props.isCompleted) {
      // No-op: already fully completed
      return success(this);
    }

    if (!this._props.completedSteps.includes(VALUE.ONBOARDING_STEP.COMPLETED)) {
      this._props.completedSteps.push(VALUE.ONBOARDING_STEP.COMPLETED);
    }

    this._props.isCompleted = true;
    this._props.completedAt = new Date();
    this._props.currentStep = VALUE.ONBOARDING_STEP.SETUP_PRESENCE_CREATED;
    this.touch();

    this.raise({
      name: EVENT.ONBOARDING.STEP_COMPLETED,
      payload: {
        userId: this.userId,
        onboardingId: this.id,
        step: VALUE.ONBOARDING_STEP.COMPLETED,
        data: null,
      },
      occurredAt: new Date(),
    });

    this.raise({
      name: EVENT.ONBOARDING.COMPLETED,
      payload: {
        userId: this.userId,
        onboardingId: this.id,
        presenceData: this._props.presenceData,
      },
      occurredAt: new Date(),
    });

    return success(this);
  }

  markPresenceCreated(): DomainActionResult<OnboardingProgress> {
    if (!this._props.isCompleted) {
      return failure({
        operation: "markPresenceCreated",
        code: "ONBOARDING.MARK_PRESENCE_CREATED",
        errors: [
          businessRuleError({
            code: "ONBOARDING.NOT_COMPLETED",
            message: "Onboarding must be completed before marking presence as created",
          }),
        ],
      });
    }

    if (this._props.currentStep === VALUE.ONBOARDING_STEP.READY) {
      // Already ready, no-op
      return success(this);
    }

    if (!this._props.completedSteps.includes(VALUE.ONBOARDING_STEP.SETUP_PRESENCE_CREATED)) {
      this._props.completedSteps.push(VALUE.ONBOARDING_STEP.SETUP_PRESENCE_CREATED);
    }

    this._props.currentStep = VALUE.ONBOARDING_STEP.READY;
    this.touch();

    this.raise({
      name: EVENT.ONBOARDING.STEP_COMPLETED,
      payload: {
        step: VALUE.ONBOARDING_STEP.SETUP_PRESENCE_CREATED,
        data: null,
        userId: this.userId,
        onboardingId: this.id,
      },
      occurredAt: new Date(),
    });

    return success(this);
  }

  // Getters
  get userId(): Identifier {
    return this._props.userId;
  }

  get currentStep(): OnboardingStep {
    return this._props.currentStep;
  }

  get completedSteps(): OnboardingStep[] {
    return this._props.completedSteps;
  }

  get isCompleted(): boolean {
    return this._props.isCompleted;
  }

  get presenceData(): unknown | null {
    return this._props.presenceData;
  }

  get isAccountSetupCompleted(): boolean {
    return this._props.currentStep === VALUE.ONBOARDING_STEP.READY;
  }

  get isAccountSetup(): boolean {
    return this.completedSteps.length === 3 && this.currentStep === VALUE.ONBOARDING_STEP.SETUP_PRESENCE_CREATED;
  }

  get startedAt(): Date {
    return this._props.startedAt;
  }

  get completedAt(): Date | null {
    return this._props.completedAt;
  }
}
