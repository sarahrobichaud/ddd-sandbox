import { BoundUseCases, buildModule, Module, RequiredDeps } from "#shared/application/module";

import * as commands from "#identity/app/identity.commands";
import * as queries from "#identity/app/identity.queries";
import * as useCases from "#identity/app/identity.usecases";

export type AuthModuleDeps = RequiredDeps<typeof useCases>;

export type AuthModule = Module<BoundUseCases<typeof useCases>, typeof commands, typeof queries>;

export function createAuthModule(deps: AuthModuleDeps): AuthModule {
  return buildModule(
    {
      useCases,
      commands,
      queries,
    },
    deps
  );
}

export type * from "#identity/app/ports/index";
