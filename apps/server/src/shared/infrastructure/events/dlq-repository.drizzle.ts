import { Database, eq, tables, desc } from "#db";

export type DeadLetterRecord = {
  id: string;
  eventFingerprint: string;
  eventName: string;
  payload: any;
  error: string;
  attemptCount: number;
  failedAt: Date;
  resolvedAt: Date | null;
  retryCount: number;
  status: "pending" | "resolved" | "ignored";
};

export type CreateDeadLetterData = {
  eventFingerprint: string;
  eventName: string;
  payload: any;
  error: string;
  attemptCount: number;
};

export type UpdateDeadLetterData = {
  error?: string;
  attemptCount?: number;
  retryCount?: number;
  failedAt?: Date;
  status?: "pending" | "resolved" | "ignored";
  resolvedAt?: Date;
};

/**
 * Repository for managing dead letter queue records
 */
export class DrizzleDeadLetterRepository {
  #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  /**
   * Record a failed event in the dead letter queue
   */
  async record(data: CreateDeadLetterData): Promise<DeadLetterRecord> {
    const [record] = await this.#db
      .insert(tables.deadLetterQueue)
      .values({
        eventFingerprint: data.eventFingerprint,
        eventName: data.eventName,
        payload: data.payload,
        error: data.error,
        attemptCount: data.attemptCount,
        status: "pending",
        retryCount: 0,
      })
      .returning();

    if (!record) {
      throw new Error("Failed to record dead letter");
    }

    return this.mapToRecord(record);
  }

  /**
   * Find a dead letter record by ID
   */
  async findById(id: string): Promise<DeadLetterRecord | null> {
    const [record] = await this.#db
      .select()
      .from(tables.deadLetterQueue)
      .where(eq(tables.deadLetterQueue.id, id))
      .limit(1);

    return record ? this.mapToRecord(record) : null;
  }

  /**
   * Find a dead letter record by event fingerprint
   */
  async findByFingerprint(fingerprint: string): Promise<DeadLetterRecord | null> {
    const [record] = await this.#db
      .select()
      .from(tables.deadLetterQueue)
      .where(eq(tables.deadLetterQueue.eventFingerprint, fingerprint))
      .limit(1);

    return record ? this.mapToRecord(record) : null;
  }

  /**
   * Update a dead letter record
   */
  async update(id: string, data: UpdateDeadLetterData): Promise<DeadLetterRecord> {
    const [record] = await this.#db
      .update(tables.deadLetterQueue)
      .set(data)
      .where(eq(tables.deadLetterQueue.id, id))
      .returning();

    if (!record) {
      throw new Error(`Dead letter record not found: ${id}`);
    }

    return this.mapToRecord(record);
  }

  /**
   * Get all pending (unresolved) dead letters
   */
  async getPending(limit: number = 100): Promise<DeadLetterRecord[]> {
    const records = await this.#db
      .select()
      .from(tables.deadLetterQueue)
      .where(eq(tables.deadLetterQueue.status, "pending"))
      .orderBy(desc(tables.deadLetterQueue.failedAt))
      .limit(limit);

    return records.map((r) => this.mapToRecord(r));
  }

  /**
   * Get pending dead letters for a specific event type
   */
  async getPendingByEventName(eventName: string, limit: number = 100): Promise<DeadLetterRecord[]> {
    const records = await this.#db
      .select()
      .from(tables.deadLetterQueue)
      .where(eq(tables.deadLetterQueue.eventName, eventName))
      .orderBy(desc(tables.deadLetterQueue.failedAt))
      .limit(limit);

    return records.map((r) => this.mapToRecord(r));
  }

  /**
   * Mark a dead letter as resolved (successfully reprocessed)
   */
  async markResolved(id: string): Promise<DeadLetterRecord> {
    return this.update(id, {
      status: "resolved",
      resolvedAt: new Date(),
    });
  }

  /**
   * Mark a dead letter as ignored (won't retry)
   */
  async markIgnored(id: string): Promise<DeadLetterRecord> {
    return this.update(id, {
      status: "ignored",
      resolvedAt: new Date(),
    });
  }

  /**
   * Get count of pending dead letters
   */
  async getPendingCount(): Promise<number> {
    const [result] = await this.#db
      .select({ count: tables.deadLetterQueue.id })
      .from(tables.deadLetterQueue)
      .where(eq(tables.deadLetterQueue.status, "pending"));

    return result?.count ? Number(result.count) : 0;
  }

  /**
   * Get count by event name
   */
  async getCountByEventName(eventName: string): Promise<number> {
    const [result] = await this.#db
      .select({ count: tables.deadLetterQueue.id })
      .from(tables.deadLetterQueue)
      .where(eq(tables.deadLetterQueue.eventName, eventName));

    return result?.count ? Number(result.count) : 0;
  }

  /**
   * Delete old resolved records (cleanup)
   */
  async deleteOldResolved(olderThanDays: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await this.#db
      .delete(tables.deadLetterQueue)
      .where(eq(tables.deadLetterQueue.status, "resolved"))
      .returning({ id: tables.deadLetterQueue.id });

    return result.length;
  }

  /**
   * Map database record to domain object
   */
  private mapToRecord(record: any): DeadLetterRecord {
    return {
      id: record.id,
      eventFingerprint: record.eventFingerprint,
      eventName: record.eventName,
      payload: record.payload,
      error: record.error,
      attemptCount: record.attemptCount,
      failedAt: record.failedAt,
      resolvedAt: record.resolvedAt,
      retryCount: record.retryCount || 0,
      status: record.status,
    };
  }
}
