import type { AppDeps } from "#shared/types/dependencies";
import type { UseCase, UseCaseCtx, UseCaseCtxOld } from "#shared/application/use-case";
import type { AuthAwareAction } from "#shared/application/auth-aware-command";

export const MODULE_SUBJECT_LIST = ["IDENTITY", "PRESENCE", "ONBOARDING"] as const;
export type ModuleSubject = (typeof MODULE_SUBJECT_LIST)[number];

export type ModuleEntry = {
  LABEL: string;
  CODE: number;
};

export const MODULE_SUBJECT = {
  IDENTITY: {
    LABEL: "IDENTITY",
    CODE: 100,
  },
  PRESENCE: {
    LABEL: "PRESENCE",
    CODE: 200,
  },
  ONBOARDING: {
    LABEL: "ONBOARDING",
    CODE: 300,
  },
} satisfies Record<ModuleSubject, ModuleEntry>;

export type AnyRecord = Record<string, any>;
type AnyUseCaseFn = (ctx: UseCaseCtxOld<any, any, any>) => Promise<any>;
type AnyUseCaseFnV2 = (ctx: UseCaseCtx<any, any, any>) => Promise<any>;

type DepKeysOfFn<F> = F extends (ctx: UseCaseCtxOld<any, any, infer K>) => any ? K : never;
type DepKeysOfFnV2<F> = F extends (ctx: UseCaseCtx<any, any, infer K>) => any ? K : never;

type AllDepKeys<Features extends Record<string, AnyUseCaseFn>> = {
  [K in keyof Features]: DepKeysOfFn<Features[K]>;
}[keyof Features];
type AllDepKeysV2<Features extends Record<string, AnyUseCaseFnV2>> = {
  [K in keyof Features]: DepKeysOfFnV2<Features[K]>;
}[keyof Features];

export type RequiredDeps<Features extends Record<string, AnyUseCaseFn>> = Pick<AppDeps, AllDepKeys<Features>>;
export type RequiredDepsV2<Features extends Record<string, AnyUseCaseFnV2>> = Pick<AppDeps, AllDepKeysV2<Features>>;

export type BoundUseCases<Features extends Record<string, AnyUseCaseFn>> = {
  [K in keyof Features]: Features[K] extends (ctx: UseCaseCtxOld<infer I, any, any>) => Promise<infer R>
    ? (input: I) => Promise<R>
    : never;
};

export type BoundUseCasesV2<Features extends Record<string, AnyUseCaseFnV2>> = {
  [K in keyof Features]: Features[K] extends (ctx: UseCaseCtx<infer I, any, any>) => Promise<infer R>
    ? (input: I) => Promise<R>
    : never;
};

// The bound function type: (input) => Promise<result>
export type BoundUseCase<F> = F extends (ctx: UseCaseCtxOld<infer I, any, any>) => Promise<infer R>
  ? (input: I) => Promise<R>
  : never;

export type BoundUseCaseV2<F> = F extends (ctx: UseCaseCtx<infer I, any, any>) => Promise<infer R>
  ? (input: I) => Promise<R>
  : never;

export type Module<Features extends AnyRecord, Commands extends AnyRecord, Queries extends AnyRecord> = {
  useCases: Features;
  commands: Commands;
  queries: Queries;
};

export type ModuleV2<Features extends AnyRecord, Commands extends AnyRecord, Queries extends AnyRecord> = {
  useCases: Features;
  commands: Commands;
  queries: Queries;
};

export function buildModule<
  UseCases extends Record<string, AnyUseCaseFn>,
  Commands extends AnyRecord,
  Queries extends AnyRecord
>(
  config: {
    useCases: UseCases;
    commands: Commands;
    queries: Queries;
  },
  deps: RequiredDeps<UseCases>
): Module<BoundUseCases<UseCases>, Commands, Queries> {
  const boundUseCases: any = {};

  for (const key in config.useCases) {
    const fn = config.useCases[key];
    boundUseCases[key] = (input: any) =>
      (fn as any)({
        input,
        infra: deps,
      });
  }

  return {
    useCases: boundUseCases,
    commands: config.commands,
    queries: config.queries,
  };
}

export function buildModuleV2<
  UseCases extends Record<string, AnyUseCaseFnV2>,
  Commands extends AnyRecord,
  Queries extends AnyRecord
>(
  config: {
    useCases: UseCases;
    commands: Commands;
    queries: Queries;
  },
  deps: RequiredDepsV2<UseCases>
): ModuleV2<BoundUseCasesV2<UseCases>, Commands, Queries> {
  const boundUseCases: any = {};

  for (const key in config.useCases) {
    const fn = config.useCases[key];
    boundUseCases[key] = (input: any) =>
      (fn as any)({
        input,
        deps: deps,
      });
  }

  return {
    useCases: boundUseCases,
    commands: config.commands,
    queries: config.queries,
  };
}
