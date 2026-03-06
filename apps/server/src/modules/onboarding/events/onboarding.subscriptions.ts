import { defineEventSubscriptions } from "@cavok/core/shared/events/subscription";
import { EVENT } from "@cavok/core/shared/events/event-names";
import {
  createInitializeOnUserCreatedHandler,
  createPresenceOnOnboardingCompletedHandler,
} from "@cavok/core/onboarding-flow";
import type { RootDependencies } from "#root/init";

export const createOnboardingSubscriptions = ({
  infrastructure: { onboarding, presence },
  system,
}: RootDependencies) => {
  return defineEventSubscriptions([
    {
      name: EVENT.AUTH.USER_ACCOUNT_CREATED,
      handler: createInitializeOnUserCreatedHandler({
        onboardingService: onboarding.onboardingService,
        domainEventBus: system.eventBus,
      }),
    },
    {
      name: EVENT.ONBOARDING.COMPLETED,
      handler: createPresenceOnOnboardingCompletedHandler({
        presenceService: presence.presenceService,
        onboardingService: onboarding.onboardingService,
        domainEventBus: system.eventBus,
      }),
    },
  ]);
};
