import { UserPresence } from "#presence/domain/aggregates/user-presence.aggr";
import { UCResult } from "#shared/application/use-case";
import { UpdateStatusCommand } from "#presence/app/presence.commands";
import { PresenceArgs } from "#presence/app/presence.types";
import { GetUserPresenceQuery } from "./presence.queries";
import { BUSINESS_ERROR } from "#shared/domain/domain-error";
import { PresenceDTO } from "#contracts/presence.contracts";
import { PresenceMapper } from "#presence/app/presence.mapper";

export const getUserPresence = async (
  ctx: PresenceArgs<GetUserPresenceQuery, "userPresence">
): Promise<UCResult<PresenceDTO>> => {
  const { input, infra } = ctx;
  const { userId } = input.data;

  const userPresence = await infra.userPresence.findByUserId(userId);

  if (!userPresence) {
    return {
      ok: false,
      kind: "not_found",
      errors: [{ kind: "domain", code: "PRESENCE.NOT_FOUND", message: "User presence not found" }],
    };
  }

  return {
    ok: true,
    data: PresenceMapper.toDTO(userPresence),
  };
};

export const updateStatus = async (
  ctx: PresenceArgs<UpdateStatusCommand, "userPresence">
): Promise<UCResult<PresenceDTO>> => {
  const { input, infra } = ctx;
  const { userId, status } = input.data;

  const userPresence = await infra.userPresence.findByUserId(userId);

  if (!userPresence) {
    return {
      ok: false,
      kind: "not_found",
      errors: [{ kind: "domain", code: "PRESENCE.NOT_FOUND", message: "User presence not found" }],
    };
  }

  return {
    ok: true,
    data: PresenceMapper.toDTO(userPresence),
  };
};
