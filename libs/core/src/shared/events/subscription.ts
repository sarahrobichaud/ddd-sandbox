import type { AppEvents, EventName } from './app-events';
import type { DomainEventBus, DomainEventHandler } from './domain-event-bus';

export type EventSubscription = {
  [Name in EventName]: {
    name: Name;
    handler: DomainEventHandler<Extract<AppEvents, { name: Name }>>;
  };
}[EventName];

// optional helper for ergonomics
export function defineEventSubscriptions<S extends readonly EventSubscription[]>(subs: S) {
  return subs;
}

export const eventSubscriber = (bus: DomainEventBus, subscriptions: EventSubscription[]) => {
  for (const sub of subscriptions) {
    bus.subscribe(sub.name, sub.handler as any);
  }
};
