import { DomainErrorOld, VALIDATION_ERROR } from "#shared/domain/domain-error";
import { Entity } from "#shared/domain/entity";
import { BehaviorResult, FactoryResult } from "#shared/domain/types";
import { schema } from "@cavok/data";
import { Username } from "#identity/domain/values/username.value";
import { validateGroup } from "#shared/application/validation";

/**
 * The data layer schema for a user
 */
export type UserValues = { username: Username };
export type UserData = typeof schema.users.$inferSelect & { values: UserValues };

/**
 * The required data to create a new user
 */
export type RequiredUserData = { email: string; username: string };

export class User extends Entity<UserData> {
  static generateRandomDiscriminator(): string {
    const random = Math.floor(Math.random() * 9999) + 1;
    return random.toString().padStart(4, "0");
  }

  static create(data: RequiredUserData): FactoryResult<User> {
    const [validationErrors, validated] = validateGroup({
      username: Username.create(data.username),
    });

    if (validationErrors) {
      return User.factoryError(validationErrors);
    }

    return User.factorySuccess(
      new User({
        ...Entity.defaultValues,
        primaryProfileId: null,
        primaryEmail: data.email,
        status: "ACTIVE",
        username: data.username,
        usernameDiscriminator: User.generateRandomDiscriminator(),
        values: { username: validated.username },
      })
    );
  }

  /**
   * Hydrate a user from database data, trust the db to be correct
   * @param data - The data from persistence
   * @returns A user
   */
  static hydrate(data: UserData): User {
    return new User({ ...data, values: { username: data.values.username } });
  }

  get primaryProfileId(): string | null {
    return this._props.primaryProfileId;
  }

  get isOnboarded(): boolean {
    return this._props.primaryProfileId !== null;
  }

  get primaryEmail(): string {
    return this._props.primaryEmail;
  }

  get username(): string {
    return this._props.username;
  }

  get usernameDiscriminator(): string {
    return this._props.usernameDiscriminator;
  }

  get status() {
    return this._props.status;
  }

  updatePrimaryProfileId(profileId: string): BehaviorResult<User> {
    this._props.primaryProfileId = profileId;
    this.touch();
    return User.behaviorSuccess(this);
  }
}
