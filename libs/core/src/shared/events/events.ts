import { EVENT } from "./event-names";

export interface UserRegisteredEvent {
  name: typeof EVENT.AUTH.USER_ACCOUNT_CREATED;
  payload: { profileId: string /* ... */ };
  occurredAt: Date;
}
