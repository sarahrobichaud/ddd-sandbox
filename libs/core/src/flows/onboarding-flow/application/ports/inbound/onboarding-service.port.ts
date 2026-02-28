import { CompletePresenceStepCommand } from "#contracts/onboarding.contracts";
import { OnboardingProgress } from "#onboarding-flow/domain/onboarding-progress.entity";
import { OnboardingPresenceData } from "@cavok/data";

/**
 * Provides general onboarding commands
 */
export interface OnboardingServicePort {
  /**
   * Initialize onboarding for a new user, returns the newly created onboarding progress
   * @param userId - The ID of the user to initialize onboarding for
   * @returns The onboarding progress DTO
   * @throws InvariantViolationException if onboarding is already in progress
   * @throws ValidationException if the onboarding fails to be created
   * @throws PersistenceException If an error occurs while persisting the onboarding
   */
  initialize(userId: string): Promise<OnboardingProgress>;

  /**
   * Get the status of the onboarding for a user
   * @param userId - The ID of the user to get the status for
   * @returns The onboarding progress DTO or null if no onboarding is in progress
   * @throws EntityNotFoundException if no onboarding is in progress
   * @throws PersistenceException If an error occurs while retrieving the onboarding
   */
  getStatus(userId: string): Promise<OnboardingProgress>;

  /**
   * Complete the welcome step of the onboarding for a user
   * @param userId - The ID of the user to complete the welcome step for
   * @returns The onboarding progress DTO
   * @throws EntityNotFoundException if no onboarding is in progress
   * @throws ValidationException if the onboarding fails to be completed
   * @throws PersistenceException If an error occurs while persisting the onboarding
   */
  completeWelcomeStep(userId: string): Promise<OnboardingProgress>;

  /**
   * Complete the presence step of the onboarding for a user
   * @param userId - The ID of the user to complete the presence step for
   * @param presenceData - The presence data to complete the presence step with
   * @returns The onboarding progress DTO
   * @throws EntityNotFoundException if no onboarding is in progress
   * @throws ValidationException if the onboarding fails to be completed
   * @throws PersistenceException If an error occurs while persisting the onboarding
   */
  completePresenceStep(data: CompletePresenceStepCommand): Promise<OnboardingProgress>;

  /**
   * Complete the onboarding for a user
   * @param userId - The ID of the user to complete the onboarding for
   * @returns The onboarding progress DTO
   * @throws EntityNotFoundException if no onboarding is in progress
   * @throws ValidationException if the onboarding fails to be completed
   * @throws PersistenceException If an error occurs while persisting the onboarding
   */
  completeOnboarding(userId: string): Promise<OnboardingProgress>;

  /**
   * Mark the presence as created for the onboarding setup
   * @param userId - The ID of the user to mark the presence as created for
   * @returns The onboarding progress DTO
   * @throws EntityNotFoundException if no onboarding is in progress
   * @throws ValidationException if the onboarding setup step fails
   * @throws PersistenceException If an error occurs while persisting the onboarding
   */
  markPresenceCreated(userId: string): Promise<OnboardingProgress>;
}
