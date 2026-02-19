import { AuthAwareAction } from "#shared/application/auth-aware-command";
import { DomainErrorOld } from "#shared/domain/domain-error";
import { AppDeps } from "#shared/types/dependencies";

export type UseCaseCtxOld<I, D = AppDeps, K extends keyof D = never> = {
  input: I;
  infra: Pick<D, K>;
};

export type UseCaseCtx<I, D = AppDeps, K extends keyof D = never> = {
  input: I;
  deps: Pick<D, K>;
};

export type UseCase<Input, Result, D = AppDeps, K extends keyof D = never> = (
  ctx: UseCaseCtxOld<AuthAwareAction<Input>, D, K>
) => Promise<UCResult<Result>>;

type UseCaseFailureKind = "validation" | "conflict" | "not_found" | "unauthorized";
type UseCaseFailure = {
  ok: false;
  kind: UseCaseFailureKind;
  errors: DomainErrorOld[];
};

export type UCResult<T> = UseCaseFailure | { ok: true; data: T };
