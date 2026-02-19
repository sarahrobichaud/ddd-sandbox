export const EVENT = {
  AUTH: {
    USER_ACCOUNT_CREATED: "auth.user_account_created",
    SESSION_CREATED: "auth.session_created",
    SESSION_REVOKED: "auth.session_revoked",
    SESSION_ROTATED: "auth.session_rotated",
    PRIMARY_PROFILE_LINKED: "auth.primary_profile_linked",
  },
  ECONOMY: {
    WALLET_CREATED: "economy.wallet_created",
  },
  ONBOARDING: {
    STARTED: "onboarding.started",
    STEP_UPDATED: "onboarding.step_updated",
    STEP_COMPLETED: "onboarding.step_completed",
    COMPLETED: "onboarding.completed",
    SETUP_STARTED: "onboarding.setup_started",
    SETUP_COMPLETED: "onboarding.setup_completed",
  },
} as const;

type LeafValues<T> = {
  [K in keyof T]: T[K][keyof T[K]];
}[keyof T];

export type EventName = LeafValues<typeof EVENT>;
