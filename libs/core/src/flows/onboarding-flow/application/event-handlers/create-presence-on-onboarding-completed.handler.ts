import { DomainEventHandler } from "#shared/events/domain-event-bus";
import type { OnboardingCompletedEvent } from "#shared/events/app-events";
import type { OnboardingServicePort } from "../ports/inbound/onboarding-service.port";
import type { DomainEventBus } from "#shared/events/domain-event-bus";
import type { PresenceServicePort } from "#presence/app/ports/inbound/presence-service";

type HandlerDependencies = {
  presenceService: PresenceServicePort;
  onboardingService: OnboardingServicePort;
  domainEventBus: DomainEventBus;
};

export const createPresenceOnOnboardingCompletedHandler = (
  deps: HandlerDependencies
): DomainEventHandler<OnboardingCompletedEvent> => {
  return async (event) => {
    const { userId, presenceData } = event.payload;

    console.log(`🚀 Creating user presence for user ${userId} after onboarding completion`);

    try {
      // Create the user's presence based on onboarding data
      await deps.presenceService.initialize(userId, {
        displayName: presenceData.displayName,
        firstName: presenceData.firstName,
        lastName: presenceData.lastName,
        pronouns: presenceData.pronouns || "",
        homeAirport: presenceData.homeAirport,
        skillLevel: presenceData.experienceLevel,
      });

      console.log(`✅ User presence created for user ${userId}`);
      await Promise.resolve(new Promise((resolve) => setTimeout(resolve, 5000)));

      // Mark the presence creation step as complete in onboarding
      await deps.onboardingService.markPresenceCreated(userId);

      console.log(`✅ Onboarding marked as ready for user ${userId}`);
    } catch (error) {
      console.error(`🚨 Error creating presence for user ${userId}:`, error);
      throw error;
    }
  };
};
