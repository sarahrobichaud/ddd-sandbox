import { EVENT } from "./event-names";

export type UserRegisteredEvent = {
  name: typeof EVENT.AUTH.USER_ACCOUNT_CREATED;
  payload: { accountId: string };
  occurredAt: Date;
};

export type WalletCreatedEvent = {
  name: typeof EVENT.ECONOMY.WALLET_CREATED;
  payload: { walletId: string; ownerId: string };
  occurredAt: Date;
};

export type SessionCreatedEvent = {
  name: typeof EVENT.AUTH.SESSION_CREATED;
  payload: { accountId: string; sessionId: string };
  occurredAt: Date;
};

export type PrimaryProfileLinkedEvent = {
  name: typeof EVENT.AUTH.PRIMARY_PROFILE_LINKED;
  payload: { userId: string; profileId: string };
  occurredAt: Date;
};

export type SessionRevokedEvent = {
  name: typeof EVENT.AUTH.SESSION_REVOKED;
  payload: { accountId: string; sessionId: string };
  occurredAt: Date;
};

export type SessionRotatedEvent = {
  name: typeof EVENT.AUTH.SESSION_ROTATED;
  payload: { accountId: string; sessionId: string };
  occurredAt: Date;
};

export type OnboardingStartedEvent = {
  name: typeof EVENT.ONBOARDING.STARTED;
  payload: { userId: string };
  occurredAt: Date;
};

export type OnboardingStepCompletedEvent = {
  name: typeof EVENT.ONBOARDING.STEP_COMPLETED;
  payload: { userId: string; onboardingId: string; step: string; data: any };
  occurredAt: Date;
};

export type OnboardingStepUpdatedEvent = {
  name: typeof EVENT.ONBOARDING.STEP_UPDATED;
  payload: { userId: string; onboardingId: string; step: string; data: any };
  occurredAt: Date;
};

export type OnboardingCompletedEvent = {
  name: typeof EVENT.ONBOARDING.COMPLETED;
  payload: { userId: string; onboardingId: string; presenceData: any };
  occurredAt: Date;
};

// union of all events in the system
export type AppEvents =
  | UserRegisteredEvent
  | WalletCreatedEvent
  | SessionCreatedEvent
  | SessionRevokedEvent
  | SessionRotatedEvent
  | PrimaryProfileLinkedEvent
  | OnboardingStartedEvent
  | OnboardingStepCompletedEvent
  | OnboardingStepUpdatedEvent
  | OnboardingCompletedEvent;

export type EventName = AppEvents["name"];
export type DomainEvent = AppEvents;
