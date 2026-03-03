import { Queue, Worker, Job } from "bullmq";
import type { RedisOptions } from "ioredis";
import { DomainEvent } from "@cavok/core/shared/events/app-events";
import { DomainEventBus, DomainEventHandler } from "@cavok/core/shared/events/domain-event-bus";
import { DrizzleDeadLetterRepository } from "#shared/infrastructure/events/dlq-repository.drizzle";
import { createEventFingerprint } from "#shared/infrastructure/events/event-fingerprint";

export type BullMQEventBusConfig = {
  redis: RedisOptions;
  dlqRepository?: DrizzleDeadLetterRepository;
};

export class BullMQEventBus<E extends DomainEvent = DomainEvent> implements DomainEventBus<E> {
  private queues = new Map<E["name"], Queue>();
  private workers = new Map<E["name"], Worker>();
  private handlers = new Map<E["name"], Set<DomainEventHandler<any>>>();
  private redisConfig: RedisOptions;
  private dlqRepository?: DrizzleDeadLetterRepository;

  constructor(config: BullMQEventBusConfig) {
    this.redisConfig = config.redis;
    this.dlqRepository = config.dlqRepository;
  }

  /**
   * Subscribe to an event type
   */
  subscribe<N extends E["name"]>(name: N, handler: DomainEventHandler<Extract<E, { name: N }>>): () => void {
    if (!this.handlers.has(name)) {
      this.handlers.set(name, new Set());
    }
    this.handlers.get(name)!.add(handler as DomainEventHandler<any>);

    this.ensureWorker(name);

    return () => {
      this.handlers.get(name)?.delete(handler as DomainEventHandler<any>);
    };
  }

  /**
   * Publish a single event
   */
  async publish(event: E): Promise<void> {
    const queue = this.ensureQueue(event.name);

    try {
      await queue.add(
        event.name,
        {
          ...event,
          // Handle both Date objects and ISO strings (for DLQ retries)
          occurredAt: event.occurredAt instanceof Date ? event.occurredAt.toISOString() : event.occurredAt,
        },
        {
          removeOnComplete: 100,
          removeOnFail: 500,
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 2000,
          },
        },
      );
    } catch (error) {
      console.error(`[BullMQ] Failed to publish event ${event.name}:`, error);
      throw error;
    }
  }

  /**
   * Publish multiple events
   */
  async publishAll(events: E[]): Promise<void> {
    await Promise.all(events.map((event) => this.publish(event)));
  }

  /**
   * Ensure queue exists for event type
   */
  private ensureQueue(eventName: E["name"]): Queue {
    if (!this.queues.has(eventName)) {
      const queue = new Queue(eventName, {
        connection: this.redisConfig,
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 500,
        },
      });

      this.queues.set(eventName, queue);

      queue.on("error", (error) => {
        console.error(`[BullMQ Queue ${eventName}] Error:`, error);
      });
    }

    return this.queues.get(eventName)!;
  }

  /**
   * Ensure worker exists for event type
   */
  private ensureWorker(eventName: E["name"]): Worker {
    if (!this.workers.has(eventName)) {
      const worker = new Worker(
        eventName,
        async (job: Job) => {
          await this.processJob(job);
        },
        {
          connection: this.redisConfig,
          concurrency: 10,
        },
      );

      worker.on("completed", (job) => {
        console.log(`[BullMQ] Job ${job.id} completed for ${eventName}`);
      });

      worker.on("failed", async (job, error) => {
        if (job && job.attemptsMade >= (job.opts.attempts || 1)) {
          await this.handleDeadLetter(job, error);
        }
      });

      worker.on("error", (error) => {
        console.error(`[BullMQ Worker ${eventName}] Worker error:`, error);
      });

      this.workers.set(eventName, worker);
    }

    return this.workers.get(eventName)!;
  }

  /**
   * Handle permanently failed jobs (all retries exhausted)
   */
  private async handleDeadLetter(job: Job, error: Error): Promise<void> {
    if (!this.dlqRepository) {
      console.warn(`[DLQ] No repository configured, failed job not recorded`);
      return;
    }

    try {
      // Create fingerprint from event content
      const fingerprint = createEventFingerprint(job.name, job.data.payload);
      const existing = await this.dlqRepository.findByFingerprint(fingerprint);

      if (existing) {
        // Update existing record
        console.log(`[DLQ] Updating existing DLQ record for ${job.name}`);
        await this.dlqRepository.update(existing.id, {
          error: error.message,
          attemptCount: job.attemptsMade,
          retryCount: existing.retryCount + 1,
          failedAt: new Date(),
          status: "pending",
        });
      } else {
        // Create new DLQ record
        console.log(`[DLQ] Creating new DLQ record for ${job.name}`);
        await this.dlqRepository.record({
          eventFingerprint: fingerprint,
          eventName: job.name,
          payload: job.data,
          error: error.message,
          attemptCount: job.attemptsMade,
        });
      }
    } catch (dlqError) {
      console.error(`[DLQ] Failed to record dead letter:`, dlqError);
    }
  }

  /**
   * Process a job by calling all registered handlers
   */
  private async processJob(job: Job): Promise<void> {
    const eventName = job.name as E["name"];
    const handlers = this.handlers.get(eventName);

    if (!handlers || handlers.size === 0) {
      console.warn(`[BullMQ] No handlers registered for event ${eventName}`);
      return;
    }

    const event = {
      ...job.data,
      occurredAt: new Date(job.data.occurredAt),
    } as E;

    const results = await Promise.allSettled(Array.from(handlers).map((handler) => handler(event)));

    const failures = results.filter((r) => r.status === "rejected");

    if (failures.length > 0) {
      const errorDetails = failures.map((f) => (f.status === "rejected" ? f.reason : "Unknown error"));

      throw new Error(
        `Failed to process event ${eventName}: ${failures.length}/${handlers.size} handlers failed. ` +
          `Errors: ${errorDetails.map((e) => e?.message || String(e)).join(", ")}`,
      );
    }

    // On success, check if this resolves a DLQ record
    if (this.dlqRepository) {
      try {
        const fingerprint = createEventFingerprint(job.name, job.data.payload);
        const dlqRecord = await this.dlqRepository.findByFingerprint(fingerprint);

        if (dlqRecord && dlqRecord.status === "pending") {
          await this.dlqRepository.markResolved(dlqRecord.id);
          console.log(`[DLQ] Resolved DLQ record for ${eventName}`);
        }
      } catch (error) {
        console.error(`[DLQ] Failed to mark record as resolved:`, error);
      }
    }
  }

  /**
   * Graceful shutdown - close all queues and workers
   */
  async close(): Promise<void> {
    console.log("[BullMQ] Shutting down event bus...");

    await Promise.all(
      Array.from(this.workers.values()).map((worker) =>
        worker.close().catch((err) => {
          console.error("[BullMQ] Error closing worker:", err);
        }),
      ),
    );

    await Promise.all(
      Array.from(this.queues.values()).map((queue) =>
        queue.close().catch((err) => {
          console.error("[BullMQ] Error closing queue:", err);
        }),
      ),
    );

    console.log("[BullMQ] Event bus shut down complete");
  }
}
