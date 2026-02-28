import { OnboardingProgress } from "#onboarding-flow/domain/onboarding-progress.entity";
import { Identifier } from "#shared/domain/types";

/**
 * Repository port for Onboard progress persistence
 */
export interface OnboardingRepositoryPort {
  /**
   * Create a new onboarding progress record
   * @returns The created onboarding progress
   */
  create(progress: OnboardingProgress): Promise<OnboardingProgress>;

  /**
   * Find onboarding progress by user ID
   * @returns The onboarding progress if found, null otherwise
   */
  findByUserId(userId: Identifier): Promise<OnboardingProgress | null>;

  /**
   * Update onboarding progress
   * @returns The updated onboarding progress
   */
  update(progress: OnboardingProgress): Promise<OnboardingProgress>;

  /**
   * Check if user has onboarding in progress
   * @returns True if the user has onboarding in progress, false otherwise
   */
  hasOnboardingInProgress(userId: Identifier): Promise<boolean>;
}
