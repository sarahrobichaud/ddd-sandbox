export interface Clock {
  now(): Date;
  nowIso?(): string;
}
