export type AnyDomainEvent = Readonly<{
  name: string;
  occurredAt: Date;
  payload: unknown;
  meta?: Record<string, unknown>;
}>;
