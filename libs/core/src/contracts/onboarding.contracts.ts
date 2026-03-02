import { OnboardingStep } from "#values";

export type OnboardingProgressDTO = {
  userId: string;
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  isCompleted: boolean;
  isAccountSetupCompleted: boolean;
  isAccountSetup: boolean;
  presenceData: Record<string, any>;
};

export * from "#onboarding-flow/app/onboarding.commands";
