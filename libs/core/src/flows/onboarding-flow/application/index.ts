import { BoundUseCasesV2, buildModuleV2, ModuleV2, RequiredDepsV2 } from "#shared/application/module";

import * as commands from "#onboarding-flow/app/onboarding.commands";
import * as useCases from "#onboarding-flow/app/onboarding.usecases";
import * as queries from "#onboarding-flow/app/onboarding.queries";

export type OnboardingModuleDeps = RequiredDepsV2<typeof useCases>;

export type OnboardingModule = ModuleV2<BoundUseCasesV2<typeof useCases>, typeof commands, typeof queries>;

export function createOnboardingModule(deps: OnboardingModuleDeps): OnboardingModule {
  return buildModuleV2(
    {
      useCases,
      commands,
      queries,
    },
    deps
  );
}

export type * from "#onboarding-flow/app/ports/index";
export * from "#onboarding-flow/app/event-handlers/initialize-on-user-created.handler";
export * from "#onboarding-flow/app/event-handlers/create-presence-on-onboarding-completed.handler";
export * from "#onboarding-flow/app/onboarding.service";
