import { AppContext } from "#types/koa";
import { Controller } from "#root/lib/http";
import { mapUseCaseResultToHttp } from "#root/lib/http-response-mapper-v2";
import { OnboardingModule } from "@cavok/core/onboarding-flow";
import { VALUE } from "@cavok/core/values";

/**
 * Onboarding controller
 * @extends Controller<OnboardingModule>
 */
export class OnboardingController extends Controller<OnboardingModule> {
  async getOnboardingStatus(ctx: AppContext) {
    const identity = ctx.state.identity;
    const userId = ctx.params.userId;

    if (!identity || !userId) {
      ctx.status = 401;
      return;
    }

    const parsed = this.queries.getOnboardingStatus.safeParse({ userId });

    if (parsed.error) {
      ctx.status = 400;
      return;
    }

    const result = await this.useCases.getOnboardingStatus({
      data: { userId: parsed.data.userId },
      actor: { type: VALUE.ACTOR.USER, identity },
    });

    return mapUseCaseResultToHttp(ctx, result);
  }

  async completeWelcomeStep(ctx: AppContext) {
    const identity = ctx.state.identity;
    const userId = ctx.params.userId;

    if (!identity || !userId) {
      ctx.status = 401;
      return;
    }

    const parsed = this.commands.completeWelcomeStepSchema.safeParse({ userId });

    if (parsed.error) {
      ctx.status = 400;
      return;
    }

    const result = await this.useCases.completeWelcomeStep({
      data: { userId: parsed.data.userId },
      actor: { type: VALUE.ACTOR.USER, identity },
    });

    return mapUseCaseResultToHttp(ctx, result);
  }

  async completePresenceStep(ctx: AppContext) {
    const identity = ctx.state.identity;
    const userId = ctx.params.userId;
    console.log(ctx.request.body);

    if (!identity || !userId) {
      ctx.status = 401;
      return;
    }

    const parsed = this.commands.completePresenceStepSchema.safeParse(ctx.request.body);

    if (parsed.error) {
      ctx.status = 400;
      return;
    }

    const result = await this.useCases.completePresenceStep({
      data: { userId: parsed.data.userId, presenceData: parsed.data.presenceData },
      actor: { type: VALUE.ACTOR.USER, identity },
    });

    console.log({ result });
    return mapUseCaseResultToHttp(ctx, result);
  }

  async completeOnboarding(ctx: AppContext) {
    const identity = ctx.state.identity;
    const userId = ctx.params.userId;

    if (!identity || !userId) {
      ctx.status = 401;
      return;
    }

    const parsed = this.commands.completeOnboardingSchema.safeParse({ userId });

    if (parsed.error) {
      ctx.status = 400;
      return;
    }

    const result = await this.useCases.completeOnboarding({
      data: { userId: parsed.data.userId },
      actor: { type: VALUE.ACTOR.USER, identity },
    });

    return mapUseCaseResultToHttp(ctx, result);
  }
}
