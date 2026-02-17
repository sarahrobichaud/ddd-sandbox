import { ModuleEntry, ModuleSubject } from "#shared/application/module";
import { FactoryError } from "#shared/domain/types";

export type ErrorRegistry = Record<ModuleSubject, Record<string, DomainErrorOld | Record<string, DomainErrorOld>>>;

export type DomainErrorKind = "validation" | "business_rule" | "cross_field_validation" | "domain";

/**
 * @deprecated Use ActionError instead
 */
export interface DomainErrorOld {
  kind: DomainErrorKind;
  code: string;
  message: string;
  field?: string;
  meta?: Record<string, any>;
}

/**
 * @deprecated Use ValidationError instead
 */
export interface ValidationErrorOld {
  code: string;
  kind: "validation";
  message: string;
  meta?: Record<string, any>;
}

export const BUSINESS_ERROR = {
  IDENTITY: {
    EMAIL_ALREADY_REGISTERED: {
      kind: "domain",
      code: "IDENTITY.EMAIL_ALREADY_REGISTERED",
      message: "Email is already registered",
    },
    INVALID_CREDENTIALS: {
      kind: "domain",
      code: "IDENTITY.INVALID_CREDENTIALS",
      message: "Invalid credentials",
    },
  },
  ONBOARDING: {
    ALREADY_COMPLETED: {
      kind: "domain",
      code: "ONBOARDING.ALREADY_COMPLETED",
      message: "Onboarding has already been completed",
    },
    NOT_FOUND: {
      kind: "domain",
      code: "ONBOARDING.NOT_FOUND",
      message: "Onboarding progress not found",
    },
    INVALID_STEP_ORDER: {
      kind: "domain",
      code: "ONBOARDING.INVALID_STEP_ORDER",
      message: "Invalid step order - cannot complete this step at this time",
    },
    NOT_ALL_STEPS_COMPLETED: {
      kind: "domain",
      code: "ONBOARDING.NOT_ALL_STEPS_COMPLETED",
      message: "Not all required steps have been completed",
    },
    MISSING_DATA: {
      kind: "domain",
      code: "ONBOARDING.MISSING_DATA",
      message: "Required onboarding data is missing",
    },
  },
  PRESENCE: {},
} as const satisfies ErrorRegistry;

export const VALIDATION_ERROR = {
  ONBOARDING: {
    DISPLAY_NAME_TOO_SHORT: {
      kind: "validation",
      code: "ONBOARDING.DISPLAY_NAME_TOO_SHORT",
      message: "Display name must be at least 3 characters",
    },
    DISPLAY_NAME_TOO_LONG: {
      kind: "validation",
      code: "ONBOARDING.DISPLAY_NAME_TOO_LONG",
      message: "Display name must be less than 30 characters",
    },
    FIRST_NAME_REQUIRED: {
      kind: "validation",
      code: "ONBOARDING.FIRST_NAME_REQUIRED",
      message: "First name is required",
    },
    LAST_NAME_REQUIRED: {
      kind: "validation",
      code: "ONBOARDING.LAST_NAME_REQUIRED",
      message: "Last name is required",
    },
    INVALID_AIRPORT_CODE: {
      kind: "validation",
      code: "ONBOARDING.INVALID_AIRPORT_CODE",
      message: "Home airport must be a valid 4-letter ICAO code",
    },
  },
  IDENTITY: {
    INVALID_PROVIDER_TYPE: {
      kind: "validation",
      code: "IDENTITY.INVALID_PROVIDER_TYPE",
      message: "Invalid authentication provider type",
    },
    PRIMARY_PROFILE_ID_REQUIRED: {
      kind: "validation",
      code: "IDENTITY.PRIMARY_PROFILE_ID_REQUIRED",
      message: "Primary profile ID is required",
    },
    USER_ACCOUNT: {
      PROVIDER_USER_ID_MISMATCH: {
        kind: "validation",
        code: "IDENTITY.PROVIDER_USER_ID_MISMATCH",
        message: "The provider's user ID must match the user's ID",
      },
    },
    PROVIDER: {
      EMAIL_PASS_PASSWORD_REQUIRED: {
        kind: "validation",
        code: "IDENTITY.EMAIL_PASS_PASSWORD_REQUIRED",
        message: "Password must be provided for Email Password Provider",
      },
    },
    PASSWORD: {
      TOO_SHORT: {
        kind: "validation",
        code: "IDENTITY.PASSWORD_TOO_SHORT",
        message: "Password must be at least {{minLength}} characters long",
      },
    },
    USERNAME: {
      INVALID_FORMAT: {
        kind: "validation",
        code: "IDENTITY.USERNAME_INVALID_FORMAT",
        message:
          "Username must be between {{minLength}} and {{maxLength}} characters long and can only contain letters, numbers, underscores, and hyphens",
      },
    },
  },
  PRESENCE: {
    PERSONAL_PROFILE_ID_REQUIRED: {
      kind: "validation",
      code: "PRESENCE.PERSONAL_PROFILE_ID_REQUIRED",
      message: "Personal profile ID is required when profile kind is not PERSONAL",
    },
  },
} as const satisfies ErrorRegistry;
