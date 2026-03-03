import { createOnboardingSubscriptions } from "#modules/onboarding/events/onboarding.subscriptions";
import { RootDependencies } from "#root/init";

export const registerEventSubscriptions = (dependencies: RootDependencies) => {
  const subscriptions = [...createOnboardingSubscriptions(dependencies)];

  for (const subscription of subscriptions) {
    console.log(`[Event Subscription Registry] Registering event subscription for ${subscription.name}`);
    dependencies.system.eventBus.subscribe(subscription.name, subscription.handler as any);
  }
};
