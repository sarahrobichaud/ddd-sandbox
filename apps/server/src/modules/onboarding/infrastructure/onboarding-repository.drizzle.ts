import { OnboardingProgress } from "@cavok/core/onboarding-flow/domain/onboarding-progress.entity";
import { Identifier } from "@cavok/core/shared/domain/types";
import { OnboardingRepositoryPort } from "@cavok/core/onboarding-flow";
import { Database, eq, tables } from "#db";

export class DrizzleOnboardingRepository implements OnboardingRepositoryPort {
  #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  /**
   * Create a new onboarding progress record
   */
  async create(progress: OnboardingProgress): Promise<OnboardingProgress> {
    if (Math.random() > 0.7) {
      throw new Error("test error");
    }
    const [insertedProgress] = await this.#db
      .insert(tables.onboardingProgress)
      .values(progress.toPersistence())
      .returning();

    if (!insertedProgress) {
      throw new Error("Failed to create onboarding progress");
    }

    return OnboardingProgress.hydrate({
      ...insertedProgress,
      values: {},
    });
  }
  /**
   * Find onboarding progress by user ID
   */
  async findByUserId(userId: Identifier): Promise<OnboardingProgress | null> {
    const [progress] = await this.#db
      .select()
      .from(tables.onboardingProgress)
      .where(eq(tables.onboardingProgress.userId, userId));
    if (!progress) {
      return null;
    }
    return OnboardingProgress.hydrate({
      ...progress,
      values: {},
    });
  }
  /**
   * Update onboarding progress
   */
  async update(progress: OnboardingProgress): Promise<OnboardingProgress> {
    const [updatedProgress] = await this.#db
      .update(tables.onboardingProgress)
      .set(progress.toPersistence())
      .where(eq(tables.onboardingProgress.userId, progress.userId))
      .returning();
    if (!updatedProgress) {
      throw new Error("Failed to update onboarding progress");
    }
    return OnboardingProgress.hydrate({
      ...updatedProgress,
      values: {},
    });
  }
  /**
   * Check if user has onboarding in progress
   */
  async hasOnboardingInProgress(userId: Identifier): Promise<boolean> {
    const progress = await this.findByUserId(userId);
    return progress !== null && !progress?.isCompleted;
  }
}
