import { DomainEventHandler } from "#shared/events/domain-event-bus";
import type { DomainEventBus } from "#shared/events/domain-event-bus";
import type { UserRegisteredEvent } from "#shared/events/app-events";
import { OnboardingServicePort } from "../ports";
import { InvariantViolationException } from "#shared/application/errors/domain-errors";

type HandlerDependencies = {
  onboardingService: OnboardingServicePort;
  domainEventBus: DomainEventBus;
};

export const createInitializeOnUserCreatedHandler = (
  deps: HandlerDependencies
): DomainEventHandler<UserRegisteredEvent> => {
  return async (event) => {
    const { accountId } = event.payload;

    console.log(`🚀 Auto-initializing onboarding for user ${accountId}`);

    try {
      await deps.onboardingService.initialize(accountId);

      console.log(`✅ Onboarding initialized for user ${accountId}`);
    } catch (error) {
      console.log(`🚨 Error initializing onboarding for user ${accountId}:`);
      if (error instanceof InvariantViolationException) {
        console.warn(
          `⚠️ Onboarding already exists for ${accountId} - ` +
            `this could be: (1) legitimate retry, or (2) duplicate event bug`
        );
        return;
      }
      throw error;
    }
  };
};
