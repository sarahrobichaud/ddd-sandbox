import { Entity } from "#shared/domain/entity";
import { FactoryResult } from "#shared/domain/types";
import { AviationExperience, SimulatorType, SkillLevel } from "#values";
import { schema } from "@cavok/data";
import { HomeAirport } from "#presence/domain/value-objects/home-airport";
import { DisplayName } from "#presence/domain/value-objects/display-name.vo";
import { groupValidationResults, validateGroup } from "#shared/application/validation";
import { entityCreated, entityFailure, EntityResult } from "#shared/application/errors/domain-errors";

export type ProfileValues = { displayName: DisplayName; homeAirport: HomeAirport };
export type ProfileData = typeof schema.profiles.$inferSelect & { values: ProfileValues };

export type RequiredProfileData = Pick<
  ProfileData,
  "displayName" | "firstName" | "lastName" | "pronouns" | "homeAirport" | "skillLevel"
>;

export type OnboardingDataCollection = {
  displayName: DisplayName;
  homeAirport: HomeAirport;
  firstName: string;
  lastName: string;
  pronouns: string;
  skillLevel: SkillLevel;
  aviationExperience: AviationExperience;
  simulatorType: SimulatorType;
};

export class Profile extends Entity<ProfileData> {
  static createPrimary(userPresenceId: string, data: RequiredProfileData): EntityResult<Profile> {
    const displayName = DisplayName.create(data.displayName);
    const homeAirport = HomeAirport.create(data.homeAirport);

    const [errors, validated] = groupValidationResults({ displayName, homeAirport });

    if (errors) {
      return entityFailure(errors);
    }

    const profile = new Profile({
      ...Profile.defaultValues,
      userPresenceId,
      profileKind: "PRIMARY",
      organizationId: null,
      displayName: data.displayName,
      firstName: data.firstName,
      lastName: data.lastName,
      pronouns: data.pronouns,
      homeAirport: data.homeAirport,
      skillLevel: data.skillLevel,
      aviationExperience: "HOBBYIST",
      simulatorType: "MSFS2024",
      values: {
        displayName: validated.displayName,
        homeAirport: validated.homeAirport,
      },
    });

    return entityCreated(profile);
  }

  static hydrate(data: ProfileData): Profile {
    return new Profile(data);
  }

  get displayName(): string {
    return this._props.displayName;
  }

  get firstName(): string {
    return this._props.firstName;
  }

  get lastName(): string {
    return this._props.lastName;
  }

  get pronouns(): string {
    return this._props.pronouns;
  }

  get homeAirport(): string {
    return this._props.homeAirport;
  }

  get skillLevel(): SkillLevel {
    return this._props.skillLevel;
  }

  get aviationExperience(): AviationExperience {
    return this._props.aviationExperience;
  }

  get simulatorType(): SimulatorType {
    return this._props.simulatorType;
  }

  get isPrimary(): boolean {
    return this._props.profileKind === "PRIMARY";
  }

  get isCommunity(): boolean {
    return this._props.profileKind === "COMMUNITY";
  }
}
