import { AviationExperience, SkillLevel } from "#values";
import { SimulatorType } from "#values";

export type PresenceDTO = {
  id: string;
  status: string;
  userId: string;
  profile: {
    id: string;
    displayName: string;
    firstName: string;
    lastName: string;
    pronouns: string;
    homeAirport: string;
    skillLevel: SkillLevel;
    aviationExperience: AviationExperience;
    simulatorType: SimulatorType;
  };
};
