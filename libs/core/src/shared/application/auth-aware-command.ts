import { Identity } from "#contracts/auth.contracts";
import { UserId } from "#identity/domain/values/ids.value";
import { VALUE } from "#values";

export type AuthAwareAction<T> = {
  actor: { type: "USER" | "SYSTEM" | "GUEST"; identity?: Identity };
  data: T;
};
