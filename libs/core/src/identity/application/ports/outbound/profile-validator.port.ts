export interface ProfileValidatorPort {
  profileExistsForUser(profileId: string, userId: string): Promise<boolean>;
}
