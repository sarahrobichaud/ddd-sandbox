import { IdentityPresencePort, IdentityProfile } from "@cavok/core/auth";

export class IdentityPresenceAdapter implements IdentityPresencePort {
  getProfileById(id: string): Promise<IdentityProfile | null> {
    throw new Error("Method not implemented.");
  }
}
