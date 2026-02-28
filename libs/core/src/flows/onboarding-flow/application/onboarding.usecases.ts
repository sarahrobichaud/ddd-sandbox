// libs/core/src/onboarding-flow/application/onboarding.service.ts

import type {
  InitializeOnboardingCommand,
  CompleteWelcomeStepCommand,
  CompletePresenceStepCommand,
  CompleteOnboardingCommand,
} from "#onboarding-flow/app/onboarding.commands";
import { OnboardingArgs } from "#onboarding-flow/app/onboarding.types";
import { OnboardingProgressDTO } from "#contracts/onboarding.contracts";
import { GetOnboardingStatusQuery } from "#onboarding-flow/app/onboarding.queries";
import {
  forbiddenFailure,
  mapExceptionToUseCaseFailure,
  unauthorizedFailure,
} from "#shared/application/errors/use-case-error-mapper";
import { UseCaseResult, useCaseSuccess } from "#shared/application/errors/use-case-result";
import { OnboardingMapper } from "#onboarding-flow/app/onboarding.mapper";

/**
 * Initialize onboarding for a new user
 * @param ctx - The context of the use case
 * @returns The onboarding progress DTO
 */
export async function initializeOnboarding(
  ctx: OnboardingArgs<InitializeOnboardingCommand, "onboardingService">
): Promise<UseCaseResult<OnboardingProgressDTO>> {
  const {
    deps,
    input: {
      data: { userId },
    },
  } = ctx;

  try {
    const newProgress = await deps.onboardingService.initialize(userId);
    return useCaseSuccess(OnboardingMapper.toDTO(newProgress));
  } catch (error) {
    return mapExceptionToUseCaseFailure(error);
  }
}

/**
 * Get the status of the onboarding for a user
 * @param ctx - The context of the use case
 * @returns The onboarding progress DTO
 */
export async function getOnboardingStatus(
  ctx: OnboardingArgs<GetOnboardingStatusQuery, "onboardingService">
): Promise<UseCaseResult<OnboardingProgressDTO>> {
  const {
    deps,
    input: {
      data: { userId },
      actor,
    },
  } = ctx;

  try {
    if (!userId || !actor.identity || userId !== actor.identity.userId) {
      return unauthorizedFailure("You can only get your own onboarding status");
    }

    const progress = await deps.onboardingService.getStatus(userId);
    return useCaseSuccess(OnboardingMapper.toDTO(progress));
  } catch (error) {
    return mapExceptionToUseCaseFailure(error);
  }
}

/**
 * Complete the welcome step of the onboarding for a user
 * @param ctx - The context of the use case
 * @returns The onboarding progress DTO
 */
export async function completeWelcomeStep(
  ctx: OnboardingArgs<CompleteWelcomeStepCommand, "onboardingService">
): Promise<UseCaseResult<OnboardingProgressDTO>> {
  const {
    deps,
    input: {
      data: { userId },
      actor,
    },
  } = ctx;

  try {
    if (!userId || !actor.identity || userId !== actor.identity.userId) {
      return forbiddenFailure("You can only complete your own onboarding");
    }

    const progress = await deps.onboardingService.completeWelcomeStep(userId);
    return useCaseSuccess(OnboardingMapper.toDTO(progress));
  } catch (error) {
    return mapExceptionToUseCaseFailure(error);
  }
}

/**
 * Complete the presence step of the onboarding for a user
 * @param ctx - The context of the use case
 * @returns The onboarding progress DTO
 */
export async function completePresenceStep(
  ctx: OnboardingArgs<CompletePresenceStepCommand, "onboardingService">
): Promise<UseCaseResult<OnboardingProgressDTO>> {
  const {
    deps,
    input: { data, actor },
  } = ctx;

  try {
    if (!data.userId || !actor.identity || data.userId !== actor.identity.userId) {
      return unauthorizedFailure("You can only complete your own onboarding");
    }

    const progress = await deps.onboardingService.completePresenceStep(data);
    return useCaseSuccess(OnboardingMapper.toDTO(progress));
  } catch (error) {
    return mapExceptionToUseCaseFailure(error);
  }
}

/**
 * Complete the onboarding for a user
 * @param ctx - The context of the use case
 * @returns The onboarding progress DTO
 */
export async function completeOnboarding(
  ctx: OnboardingArgs<CompleteOnboardingCommand, "onboardingService">
): Promise<UseCaseResult<OnboardingProgressDTO>> {
  const {
    deps,
    input: {
      data: { userId },
      actor,
    },
  } = ctx;

  try {
    if (!userId || !actor.identity || userId !== actor.identity.userId) {
      return unauthorizedFailure("You can only complete your own onboarding");
    }

    const progress = await deps.onboardingService.completeOnboarding(userId);
    return useCaseSuccess(OnboardingMapper.toDTO(progress));
  } catch (error) {
    return mapExceptionToUseCaseFailure(error);
  }
}
