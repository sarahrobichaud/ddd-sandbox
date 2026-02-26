import { AuthAwareAction } from "#shared/application/auth-aware-command";
import { UseCaseCtxOld } from "#shared/application/use-case";
import { IdentityDeps } from "#shared/types/dependencies";

export type IdentityArgs<Input, K extends keyof IdentityDeps = never> = UseCaseCtxOld<
  AuthAwareAction<Input>,
  IdentityDeps,
  K
>;
