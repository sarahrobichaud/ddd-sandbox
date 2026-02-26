export type IdentityProfile = {
  id: string;
  displayName: string;
};

export interface IdentityPresencePort {
  getProfileById(id: string): Promise<IdentityProfile | null>;
}
