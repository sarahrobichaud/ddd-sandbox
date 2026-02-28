import { ValidationResult } from "#shared/application/errors/domain-errors";
import { schema } from "@cavok/data";

// Same as persistence schema
export type OnboardingPresenceData = schema.OnboardingPresenceData;

export interface OnboardingPresenceValidatorPort {
  validatePresenceData(data: OnboardingPresenceData): ValidationResult<OnboardingPresenceData>;
}
