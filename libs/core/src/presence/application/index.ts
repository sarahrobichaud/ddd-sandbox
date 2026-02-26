import { BoundUseCases, buildModule, Module, RequiredDeps } from "#shared/application/module";

import * as commands from "#presence/app/presence.commands";
import * as useCases from "#presence/app/presence.usecases";
import * as queries from "#presence/app/presence.queries";

export type PresenceModuleDeps = RequiredDeps<typeof useCases>;

export type PresenceModule = Module<BoundUseCases<typeof useCases>, typeof commands, typeof queries>;

export function createPresenceModule(deps: PresenceModuleDeps): PresenceModule {
  return buildModule(
    {
      useCases,
      commands,
      queries,
    },
    deps
  );
}

export type * from "#presence/app/ports/outbound/user-presence-repository.port";
export type * from "#presence/app/ports/inbound/presence-service";
export * from "#presence/app/adapter/profile.validator.onboarding";
export * from "#presence/app/presence.service";
