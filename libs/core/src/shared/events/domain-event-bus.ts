import type { AppEvents } from './app-events';

export type DomainEvent = AppEvents;
export type DomainEventHandler<E extends DomainEvent> = (event: E) => Promise<void>;

export interface DomainEventBus<Events extends DomainEvent = DomainEvent> {
  publish<Name extends Events['name']>(event: Extract<Events, { name: Name }>): Promise<void>;

  publishAll(events: Events[]): Promise<void>;

  subscribe<Name extends Events['name']>(
    name: Name,
    handler: DomainEventHandler<Extract<Events, { name: Name }>>
  ): () => void;
}
