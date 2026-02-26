import { entityCreated, EntityResult } from "#shared/application/errors/domain-errors";
import { Entity } from "#shared/domain/entity";
import { FactoryResult } from "#shared/domain/types";
import { schema } from "@cavok/data";

export type PresenceValues = {};
export type PresenceData = typeof schema.presence.$inferSelect & { values: PresenceValues };
export type NewPresenceData = typeof schema.presence.$inferInsert;

export type RequiredPresenceData = Pick<PresenceData, "userId">;

export class Presence extends Entity<PresenceData> {
  static createInitial(data: RequiredPresenceData): EntityResult<Presence> {
    const presence = new Presence({
      ...Entity.defaultValues,
      status: "Preparing for takeoff",
      values: {},
      ...data,
    });

    return entityCreated(presence);
  }

  static hydrate(data: PresenceData): Presence {
    return new Presence(data);
  }

  get status(): string {
    return this._props.status;
  }

  get userId(): string {
    return this._props.userId;
  }
}
