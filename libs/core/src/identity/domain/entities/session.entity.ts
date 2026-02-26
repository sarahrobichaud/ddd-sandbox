import { Entity } from "#shared/domain/entity";
import { FactoryResult, Identifier } from "#shared/domain/types";
import { schema } from "@cavok/data";
import { Token } from "../values/tokens.value";
import { ValidationErrorOld } from "#shared/domain/domain-error";

export type SessionValues = {};
export type SessionData = typeof schema.sessions.$inferSelect & { values: SessionValues };

export type RequiredSessionData = Pick<
  SessionData,
  "userId" | "refreshToken" | "expiresAt" | "user_agent" | "ip_address"
>;

export class Session extends Entity<SessionData> {
  static create(data: RequiredSessionData): FactoryResult<Session> {
    const errors: ValidationErrorOld[] = [];

    if (errors.length > 0) {
      return Session.factoryError(errors);
    }

    return Session.factorySuccess(
      new Session({
        ...Entity.defaultValues,
        userId: data.userId,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
        user_agent: data.user_agent,
        ip_address: data.ip_address,
        tokenVersion: 1,
        revokedAt: null,
        values: {},
      })
    );
  }

  static hydrate(data: SessionData): Session {
    return new Session(data);
  }

  // Helper getters
  get userId(): Identifier {
    return this._props.userId;
  }

  get refreshToken(): string {
    return this._props.refreshToken;
  }

  get expiresAt(): Date {
    return this._props.expiresAt;
  }

  get isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  get isRevoked(): boolean {
    return this._props.revokedAt !== null;
  }

  get isActive(): boolean {
    return !this.isExpired && !this.isRevoked;
  }

  get userAgent(): string | null {
    return this._props.user_agent;
  }

  get ipAddress(): string | null {
    return this._props.ip_address;
  }

  revoke(): void {
    this._props.revokedAt = new Date();
  }

  rotate(newRefreshToken: Token, newExpiresAt: Date, ipAddress: string, userAgent: string): void {
    this._props.refreshToken = newRefreshToken.value;
    this._props.expiresAt = newExpiresAt;
    this._props.tokenVersion += 1;
    this._props.ip_address = ipAddress;
    this._props.user_agent = userAgent;
  }
}
