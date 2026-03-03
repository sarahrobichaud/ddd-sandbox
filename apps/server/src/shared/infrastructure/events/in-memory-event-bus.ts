import { DomainEvent } from '@cavok/core/shared/events/app-events';
import { DomainEventBus, DomainEventHandler } from '@cavok/core/shared/events/domain-event-bus';

export class InMemoryEventBus<E extends DomainEvent = DomainEvent> implements DomainEventBus<E> {
  private handlers = new Map<E['name'], Set<DomainEventHandler<any>>>();

  subscribe<N extends E['name']>(name: N, handler: DomainEventHandler<Extract<E, { name: N }>>) {
    if (!this.handlers.has(name)) this.handlers.set(name, new Set());
    this.handlers.get(name)!.add(handler as DomainEventHandler<any>);

    return () => this.handlers.get(name)!.delete(handler as DomainEventHandler<any>);
  }

  async publish(event: E) {
    const set = this.handlers.get(event.name);
    if (!set || set.size === 0) return;

    for (const handler of set) {
      try {
        await handler(event);
      } catch (err) {
        // safe bus: doesn't kill publisher
        console.error(`[event-bus] handler failed for ${event.name}`, err);
      }
    }
  }

  async publishAll(events: E[]) {
    for (const e of events) await this.publish(e);
  }
}
