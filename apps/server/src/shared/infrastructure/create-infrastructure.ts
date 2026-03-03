// apps/server/src/shared/infrastructure/create-infrastructure.ts
import { RootDependencies } from "#root/init";
import { DrizzleUserAccountRepository } from "#modules/auth/infrastructure/user-account-repository";
import { Argon2PasswordHasher } from "#modules/auth/infrastructure/passwork-hasher.argon2";
import { JWTTokenService } from "#modules/auth/infrastructure/signable-token-service.jwt";
import { OpaqueTokenService } from "#modules/auth/infrastructure/opaque-token-service";
import { IdentityPresenceAdapter } from "#modules/auth/infrastructure/identity-presence.adapter";
import { DrizzleOnboardingRepository } from "#modules/onboarding/infrastructure/onboarding-repository.drizzle";
import { DrizzleUserPresenceRepository } from "#modules/presence/infrastructure/user-presence.drizzle";
import { OnboardingPresenceValidator, PresenceService, PresenceServicePort } from "@cavok/core/presence";
import { OnboardingService, OnboardingServicePort } from "@cavok/core/onboarding-flow";
import { ProfileValidatorPort } from "@cavok/core/auth";

export type AppInfrastructure = {
  // Auth/Identity infrastructure

  identity: {
    userAccountRepository: DrizzleUserAccountRepository;
    passwordHasher: Argon2PasswordHasher;
    accessTokenService: JWTTokenService;
    refreshTokenService: OpaqueTokenService;
  };

  onboarding: {
    onboardingRepository: DrizzleOnboardingRepository;
    onboardingService: OnboardingServicePort;
  };

  presence: {
    presenceRepository: DrizzleUserPresenceRepository;
    presenceService: PresenceServicePort;
  };
};

export const createInfrastructure = (deps: Omit<RootDependencies, "infrastructure">): AppInfrastructure => {
  /**
   * Data Access
   */

  const onboardingRepository = new DrizzleOnboardingRepository(deps.system.db.app);
  const presenceRepository = new DrizzleUserPresenceRepository(deps.system.db.app);
  const userAccountRepository = new DrizzleUserAccountRepository(deps.system.db.app, deps.system.uuid);

  /**
   * Identity Setup
   */

  // Utils
  const passwordHasher = new Argon2PasswordHasher();
  const accessTokenService = new JWTTokenService(deps.config.security);
  const refreshTokenService = new OpaqueTokenService();

  const onboardingPresenceValidator = new OnboardingPresenceValidator(presenceRepository);
  return {
    // Auth/Identity
    identity: {
      userAccountRepository,
      passwordHasher,
      accessTokenService,
      refreshTokenService,
    },
    onboarding: {
      onboardingRepository,
      onboardingService: new OnboardingService({
        presenceValidator: onboardingPresenceValidator,
        onboardingRepository: onboardingRepository,
        domainEventBus: deps.system.eventBus,
      }),
    },
    presence: {
      presenceRepository,
      presenceService: new PresenceService({
        presenceRepository: presenceRepository,
        domainEventBus: deps.system.eventBus,
      }),
    },
  };
};
