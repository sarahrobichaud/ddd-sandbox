import {
  PasswordHasherPort,
  IdentityPresencePort,
  SignableTokenServicePort,
  UserAccountRepositoryPort,
} from "#identity/app/index";
import { IdentityServicePort } from "#identity/app/ports/inbound/identity-service.port";
import { RefreshTokenServicePort } from "#identity/app/ports/outbound/refresh-token-service.port";
import { OnboardingServicePort } from "#onboarding-flow/app/index";
import { PresenceServicePort } from "#presence/app/ports/inbound/presence-service";
import { UserPresenceRepositoryPort } from "#presence/app/ports/outbound/user-presence-repository.port";
import { DomainEventBus } from "#shared/events/domain-event-bus";
import { UUIDGenerator } from "../identity/uuid-generator.port";
import { Clock } from "../time/clock.port";

export type SystemPorts = {
  clock: Clock;
  uuid: UUIDGenerator;
  domainEventBus: DomainEventBus;
};

export type IdentityPorts = {
  hasher: PasswordHasherPort;
  accessTokenService: SignableTokenServicePort;
  refreshTokenService: RefreshTokenServicePort;
  userAccounts: UserAccountRepositoryPort;
};

export type OnboardingPorts = {
  onboardingService: OnboardingServicePort;
};

export type PresencePorts = {
  identity: IdentityServicePort;
  userPresence: UserPresenceRepositoryPort;
};

export type AppDeps = SystemPorts;
export type IdentityDeps = AppDeps & IdentityPorts;
export type OnboardingDeps = AppDeps & OnboardingPorts;
export type PresenceDeps = AppDeps & PresencePorts;

export type BaseCtx<Key extends string, Payload, D> = {
  [K in Key]: Payload;
} & D;
