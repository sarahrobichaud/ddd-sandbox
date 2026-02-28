import { OnboardingProgressDTO } from "#contracts/onboarding.contracts";
import { OnboardingProgress } from "#onboarding-flow/domain/onboarding-progress.entity";
import { OnboardingStep } from "#values";

export class OnboardingMapper {
  static toDTO(progress: OnboardingProgress): OnboardingProgressDTO {
    return {
      userId: progress.userId,
      currentStep: progress.currentStep,
      completedSteps: progress.completedSteps,
      isAccountSetupCompleted: progress.isAccountSetupCompleted,
      isAccountSetup: progress.isAccountSetup,
      isCompleted: progress.isCompleted,
      presenceData: progress.presenceData ?? {},
    };
  }
}
