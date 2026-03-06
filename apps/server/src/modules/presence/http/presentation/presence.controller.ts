import { AppContext } from "#types/koa";
import { Controller } from "#root/lib/http";
import { mapUseCaseResult } from "#root/lib/http-response-mapper";
import { PresenceModule } from "@cavok/core/presence";
import { VALUE } from "@cavok/core/values";

/**
 * Onboarding controller
 * @extends Controller<PresenceModule>
 */
export class PresenceController extends Controller<PresenceModule> {
  async getUserPresence(ctx: AppContext) {
    const identity = ctx.state.identity;
    const userId = identity?.userId;

    if (!userId) {
      ctx.status = 401;
      return;
    }

    const parsed = this.queries.getUserPresenceSchema.safeParse({ userId });

    if (parsed.error) {
      ctx.status = 400;
      return;
    }

    const result = await this.useCases.getUserPresence({
      data: { userId: parsed.data.userId },
      actor: { type: VALUE.ACTOR.USER, identity },
    });

    return mapUseCaseResult(ctx, result);
  }
}
