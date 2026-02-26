export interface IdentityServicePort {
  linkPrimaryProfile(userId: string, profileId: string): Promise<void>;
  isUserOnboarded(userId: string): Promise<boolean>;
}
