import { Entity } from "#shared/domain/entity";
import { BehaviorResult, FactoryResult } from "#shared/domain/types";
import { VALUE } from "#values";
import { schema } from "@cavok/data";
import { Password } from "../values/password.value";
import { VALIDATION_ERROR, ValidationErrorOld } from "#shared/domain/domain-error";

export type AuthProviderValues = { password: Password | null };
export type AuthProviderData = typeof schema.authProviders.$inferSelect & { values: AuthProviderValues };

export type RequiredAuthProviderData = Pick<
  AuthProviderData,
  "userId" | "providerType" | "providerUserId" | "email" | "accessToken" | "refreshToken"
> & {
  password: Password | null;
};

export class AuthProvider extends Entity<AuthProviderData> {
  static create(data: RequiredAuthProviderData): FactoryResult<AuthProvider> {
    const errors: ValidationErrorOld[] = [];

    if (data.providerType === VALUE.PROVIDER_TYPE.EMAIL_PASSWORD && !data.password) {
      errors.push(VALIDATION_ERROR.IDENTITY.PROVIDER.EMAIL_PASS_PASSWORD_REQUIRED);
    }

    if (errors.length > 0) {
      return AuthProvider.factoryError(errors);
    }

    const provider = new AuthProvider({
      ...Entity.defaultValues,
      linkedAt: new Date(),
      ...data,
      values: {
        password: data.password,
      },
    });

    return AuthProvider.factorySuccess(provider);
  }

  /**
   * Hydrate an auth provider from database data
   * @param data - The data from persistence
   * @returns An auth provider entity
   */
  static hydrate(data: AuthProviderData): AuthProvider {
    return new AuthProvider({ ...data });
  }

  // Domain getters
  get userId(): string {
    return this._props.userId;
  }

  get providerType() {
    return this._props.providerType;
  }

  get providerUserId(): string {
    return this._props.providerUserId;
  }

  get email(): string | null {
    return this._props.email;
  }

  get accessToken(): string | null {
    return this._props.accessToken;
  }

  get refreshToken(): string | null {
    return this._props.refreshToken;
  }

  get linkedAt(): Date {
    return this._props.linkedAt;
  }

  get password(): Password | null {
    return this._values.password;
  }

  updateTokens(accessToken: string, refreshToken?: string): BehaviorResult<AuthProvider> {
    this._props.accessToken = accessToken;
    if (refreshToken) {
      this._props.refreshToken = refreshToken;
    }
    this.touch();
    return AuthProvider.behaviorSuccess(this);
  }

  isEmailPassword(): boolean {
    return this.providerType === VALUE.PROVIDER_TYPE.EMAIL_PASSWORD;
  }

  isMagicLink(): boolean {
    return this.providerType === VALUE.PROVIDER_TYPE.MAGIC_LINK;
  }

  isDiscord(): boolean {
    return this.providerType === VALUE.PROVIDER_TYPE.DISCORD;
  }

  hasValidTokens(): boolean {
    return !!(this.accessToken || this.refreshToken);
  }
}
