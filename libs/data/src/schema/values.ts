export type Enum<T extends string> = Record<T, T>;

/**
 * Reference types
 */
export const REFERENCE_TYPE_LIST = ["USER", "PROFILE"] as const;
export type ReferenceType = (typeof REFERENCE_TYPE_LIST)[number];
export const REF_TYPE = {
  USER: "USER",
  PROFILE: "PROFILE",
} satisfies Enum<ReferenceType>;

/**
 * Actor types
 */
export const ACTOR_TYPE_LIST = ["USER", "SYSTEM", "GUEST"] as const;
export type ActorType = (typeof ACTOR_TYPE_LIST)[number];
export const ACTOR = {
  SYSTEM: "SYSTEM",
  USER: "USER",
  GUEST: "GUEST",
} satisfies Enum<ActorType>;

/**
 * Profile kinds
 */
export const PROFILE_KIND_LIST = ["PRIMARY", "COMMUNITY"] as const;
export type ProfileKind = (typeof PROFILE_KIND_LIST)[number];
export const PROFILE_KIND = {
  PRIMARY: "PRIMARY",
  COMMUNITY: "COMMUNITY",
} satisfies Enum<ProfileKind>;

/**
 * Provider types
 */
export const PROVIDER_TYPE_LIST = ["EMAIL_PASSWORD", "MAGIC_LINK", "DISCORD"] as const;
export type ProviderType = (typeof PROVIDER_TYPE_LIST)[number];
export const PROVIDER_TYPE = {
  EMAIL_PASSWORD: "EMAIL_PASSWORD",
  MAGIC_LINK: "MAGIC_LINK",
  DISCORD: "DISCORD",
} satisfies Enum<ProviderType>;

/**
 * Skill levels
 */
export const SKILL_LEVEL_LIST = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"] as const;
export type SkillLevel = (typeof SKILL_LEVEL_LIST)[number];
export const SKILL_LEVEL = {
  BEGINNER: "BEGINNER",
  INTERMEDIATE: "INTERMEDIATE",
  ADVANCED: "ADVANCED",
  EXPERT: "EXPERT",
} satisfies Enum<SkillLevel>;

/**
 * Simulator types
 */
export const SIMULATOR_TYPE_LIST = ["FSX", "P3D", "XPLANE", "MSFS2020", "MSFS2024"] as const;
export type SimulatorType = (typeof SIMULATOR_TYPE_LIST)[number];
export const SIMULATOR_TYPE = {
  FSX: "FSX",
  P3D: "P3D",
  XPLANE: "XPLANE",
  MSFS2020: "MSFS2020",
  MSFS2024: "MSFS2024",
} satisfies Enum<SimulatorType>;

/**
 * Aviation experiences
 */
export const AVIATION_EXPERIENCE_LIST = ["HOBBYIST", "REAL_PILOT", "NO_EXPERIENCE"] as const;
export type AviationExperience = (typeof AVIATION_EXPERIENCE_LIST)[number];
export const AVIATION_EXPERIENCE = {
  HOBBYIST: "HOBBYIST",
  REAL_PILOT: "REAL_PILOT",
  NO_EXPERIENCE: "NO_EXPERIENCE",
} satisfies Enum<AviationExperience>;

/**
 * Onboarding steps
 */
export const ONBOARDING_STEP_LIST = ["WELCOME", "PRESENCE", "COMPLETED", "SETUP_PRESENCE_CREATED", "READY"] as const;
export type OnboardingStep = (typeof ONBOARDING_STEP_LIST)[number];
export const ONBOARDING_STEP = {
  WELCOME: "WELCOME",
  PRESENCE: "PRESENCE",
  COMPLETED: "COMPLETED",
  SETUP_PRESENCE_CREATED: "SETUP_PRESENCE_CREATED",
  READY: "READY",
} satisfies Enum<OnboardingStep>;
