import { AuthAwareAction } from "#shared/application/auth-aware-command";
import { UseCaseCtx } from "#shared/application/use-case";
import { OnboardingDeps } from "#shared/types/dependencies";

export type OnboardingArgs<Input, K extends keyof OnboardingDeps = never> = UseCaseCtx<
  AuthAwareAction<Input>,
  OnboardingDeps,
  K
>;
