import Router from "@koa/router";
import { AppContext, HorizonFSState } from "#types/koa";
import { AdminController } from "#modules/admin/presentation/admin.controller";
import { HorizonFSAuthHttp } from "#modules/auth/http/auth.http";
import { DrizzleDeadLetterRepository } from "#shared/infrastructure/events/dlq-repository.drizzle";
import { DomainEventBus } from "@cavok/core/shared/events/domain-event-bus";

/**
 * Creates a router for the admin module
 * @returns A router for admin operations
 */
export function createAdminRouter({
  dlqRepo,
  eventBus,
  authHttp,
}: {
  dlqRepo: DrizzleDeadLetterRepository;
  eventBus: DomainEventBus;
  authHttp: HorizonFSAuthHttp;
}): Router<HorizonFSState, AppContext> {
  const controller = new AdminController(dlqRepo, eventBus);
  const router = new Router<HorizonFSState, AppContext>({ prefix: "/admin" });

  // Require authentication for all admin routes
  router.use(authHttp.middleware.requireIdentity);

  /**
   * Dead Letter Queue Management Routes
   */
  // List pending dead letters
  router.get("/dlq/pending", controller.listPendingDeadLetters.bind(controller));

  // Get dead letter by ID
  router.get("/dlq/:id", controller.getDeadLetterById.bind(controller));

  // List dead letters by event name
  router.get("/dlq/event/:eventName", controller.listByEventName.bind(controller));

  // Retry a failed event
  router.post("/dlq/:id/retry", controller.retryDeadLetter.bind(controller));

  // Retry all pending dead letters
  router.post("/dlq/retry-all", controller.retryAllDeadLetters.bind(controller));

  // Retry all dead letters for a specific event name
  router.post("/dlq/event/:eventName/retry-all", controller.retryAllByEventName.bind(controller));

  // Ignore a dead letter
  router.post("/dlq/:id/ignore", controller.ignoreDeadLetter.bind(controller));

  // Get DLQ statistics
  router.get("/dlq/stats", controller.getStats.bind(controller));

  return router;
}
