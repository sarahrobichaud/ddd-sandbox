import { AppContext } from "#types/koa";
import { DrizzleDeadLetterRepository } from "#shared/infrastructure/events/dlq-repository.drizzle";
import { DomainEventBus } from "@cavok/core/shared/events/domain-event-bus";

/**
 * Admin controller for infrastructure management
 */
export class AdminController {
  constructor(
    private dlqRepo: DrizzleDeadLetterRepository,
    private eventBus: DomainEventBus,
  ) {}

  /**
   * List all pending dead letters
   */
  async listPendingDeadLetters(ctx: AppContext) {
    try {
      const limit = Number(ctx.query.limit) || 100;
      const records = await this.dlqRepo.getPending(limit);

      ctx.body = {
        success: true,
        count: records.length,
        records,
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get dead letter by ID
   */
  async getDeadLetterById(ctx: AppContext) {
    try {
      const { id } = ctx.params;
      const record = await this.dlqRepo.findById(id);

      if (!record) {
        ctx.status = 404;
        ctx.body = {
          success: false,
          error: "Dead letter not found",
        };
        return;
      }

      ctx.body = {
        success: true,
        record,
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get pending dead letters by event name
   */
  async listByEventName(ctx: AppContext) {
    try {
      const { eventName } = ctx.params;
      const limit = Number(ctx.query.limit) || 100;
      const records = await this.dlqRepo.getPendingByEventName(eventName, limit);

      ctx.body = {
        success: true,
        eventName,
        count: records.length,
        records,
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Retry a failed event
   */
  async retryDeadLetter(ctx: AppContext) {
    try {
      const { id } = ctx.params;
      const record = await this.dlqRepo.findById(id);

      if (!record) {
        ctx.status = 404;
        ctx.body = {
          success: false,
          error: "Dead letter not found",
        };
        return;
      }

      if (record.status !== "pending") {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: `Cannot retry ${record.status} record`,
        };
        return;
      }

      // Republish the event - fingerprinting handles tracking
      await this.eventBus.publish(record.payload as any);

      ctx.body = {
        success: true,
        message: `Event ${record.eventName} queued for retry`,
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Retry all pending dead letters
   */
  async retryAllDeadLetters(ctx: AppContext) {
    try {
      const limit = Number(ctx.query.limit) || 100;
      const records = await this.dlqRepo.getPending(limit);

      const results = {
        total: records.length,
        succeeded: 0,
        failed: 0,
        errors: [] as Array<{ id: string; error: string }>,
      };

      for (const record of records) {
        try {
          await this.eventBus.publish(record.payload as any);
          results.succeeded++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            id: record.id,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      ctx.body = {
        success: true,
        message: `Queued ${results.succeeded} of ${results.total} dead letters for retry`,
        results,
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Retry all dead letters for a specific event name
   */
  async retryAllByEventName(ctx: AppContext) {
    try {
      const { eventName } = ctx.params;
      const limit = Number(ctx.query.limit) || 100;
      const records = await this.dlqRepo.getPendingByEventName(eventName, limit);

      const results = {
        eventName,
        total: records.length,
        succeeded: 0,
        failed: 0,
        errors: [] as Array<{ id: string; error: string }>,
      };

      for (const record of records) {
        try {
          await this.eventBus.publish(record.payload as any);
          results.succeeded++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            id: record.id,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      ctx.body = {
        success: true,
        message: `Queued ${results.succeeded} of ${results.total} dead letters for retry for ${eventName}`,
        results,
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Ignore a dead letter (won't retry)
   */
  async ignoreDeadLetter(ctx: AppContext) {
    try {
      const { id } = ctx.params;
      const record = await this.dlqRepo.findById(id);

      if (!record) {
        ctx.status = 404;
        ctx.body = {
          success: false,
          error: "Dead letter not found",
        };
        return;
      }

      await this.dlqRepo.markIgnored(id);

      ctx.body = {
        success: true,
        message: "Dead letter marked as ignored",
        record,
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get DLQ statistics
   */
  async getStats(ctx: AppContext) {
    try {
      const pendingCount = await this.dlqRepo.getPendingCount();

      ctx.body = {
        success: true,
        stats: {
          pending: pendingCount,
        },
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
