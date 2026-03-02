import type { Clock } from '@cavok/core/shared/time/clock.port';

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
  nowIso(): string {
    return new Date().toISOString();
  }
}
