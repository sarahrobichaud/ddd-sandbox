# Dead Letter Queue Architecture

## Overview

The DLQ system provides automatic failure tracking and manual retry capabilities for failed event processing.

## How It Works

### Event Fingerprinting

Instead of tracking metadata through events, we use **content-based fingerprinting** to match DLQ records to events:

```typescript
// Fingerprint = SHA-256 hash of event name + payload
const fingerprint = createEventFingerprint("auth.user_account_created", { accountId: "123" });
// Result: "a1b2c3d4..." (deterministic hash)
```

### Flow Diagram

```
Initial Failure:
Event → Handler fails → Create fingerprint → Check if DLQ exists
  ├─ Not exists → Create new DLQ record
  └─ Exists → Update existing record (increment retryCount)

Manual Retry:
Admin triggers retry → Load DLQ record → Publish event normally
  → Event processes → Create fingerprint → Match DLQ record
    ├─ Success → Mark DLQ as resolved
    └─ Failure → Update DLQ (increment retryCount)
```

### Key Benefits

1. **No Metadata Tracking** - Events are published normally, no special fields
2. **Automatic Matching** - Fingerprint always matches same event
3. **No Duplicates** - Same event content = same fingerprint = same DLQ record
4. **Idempotent** - Retry the same event multiple times, updates one record

## Database Schema

```sql
CREATE TABLE dead_letter_queue (
  id UUID PRIMARY KEY,
  event_fingerprint TEXT UNIQUE NOT NULL,  -- Content hash for matching
  event_name TEXT NOT NULL,                -- Event type
  payload JSONB NOT NULL,                  -- Original event data
  error TEXT NOT NULL,                     -- Last error message
  attempt_count INTEGER NOT NULL,          -- BullMQ attempts (always 3)
  failed_at TIMESTAMP NOT NULL,            -- Last failure time
  resolved_at TIMESTAMP,                   -- When successfully retried
  status TEXT NOT NULL DEFAULT 'pending',  -- pending | resolved | ignored
  retry_count INTEGER NOT NULL DEFAULT 0   -- Manual retry attempts
);
```

## Status Lifecycle

```
pending → (retry) → pending (fails) → (retry) → resolved (succeeds)
   ↓
ignored (manual decision not to retry)
```

### Status Meanings

- **pending**: Event failed, awaiting manual retry
- **resolved**: Event successfully reprocessed
- **ignored**: Manually marked as won't fix

## API Endpoints

All endpoints require authentication and are prefixed with `/v1/admin`.

### List Pending

```
GET /v1/admin/dlq/pending?limit=100
```

### Get by ID

```
GET /v1/admin/dlq/:id
```

### Retry Single Event

```
POST /v1/admin/dlq/:id/retry
```

### Retry All Pending

```
POST /v1/admin/dlq/retry-all?limit=100
```

### Retry All by Event Type

```
POST /v1/admin/dlq/event/:eventName/retry-all?limit=100
```

### Ignore Event

```
POST /v1/admin/dlq/:id/ignore
```

### Get Statistics

```
GET /v1/admin/dlq/stats
```

## Implementation Details

### Fingerprint Generation

```typescript
// In BullMQ event bus - handleDeadLetter()
const fingerprint = createEventFingerprint(job.name, job.data.payload);
const existing = await dlqRepository.findByFingerprint(fingerprint);

if (existing) {
  // Same event failed again - update existing record
  await dlqRepository.update(existing.id, {
    error: error.message,
    retryCount: existing.retryCount + 1,
    failedAt: new Date(),
  });
} else {
  // New failure - create DLQ record
  await dlqRepository.record({
    eventFingerprint: fingerprint,
    eventName: job.name,
    payload: job.data,
    error: error.message,
    attemptCount: job.attemptsMade,
  });
}
```

### Auto-Resolution

```typescript
// In BullMQ event bus - processJob() after success
const fingerprint = createEventFingerprint(job.name, job.data.payload);
const dlqRecord = await dlqRepository.findByFingerprint(fingerprint);

if (dlqRecord && dlqRecord.status === "pending") {
  await dlqRepository.markResolved(dlqRecord.id);
}
```

## Common Scenarios

### Database Outage Recovery

1. Check stats: `GET /v1/admin/dlq/stats`
2. Verify database is healthy
3. Retry all: `POST /v1/admin/dlq/retry-all`
4. Monitor: Records automatically resolve on success

### Specific Event Type Issue

1. List failures: `GET /v1/admin/dlq/event/EVENT.PROFILE.CREATED`
2. Fix the bug in profile service
3. Retry all: `POST /v1/admin/dlq/event/EVENT.PROFILE.CREATED/retry-all`
4. Verify: Check if records are resolved

### Single Event Investigation

1. Get details: `GET /v1/admin/dlq/:id`
2. Review error message and payload
3. Fix underlying issue
4. Retry: `POST /v1/admin/dlq/:id/retry`
5. Confirm: Record status changes to resolved

## Monitoring

Track these metrics:

- **Pending count**: `GET /v1/admin/dlq/stats`
- **Retry count per record**: Indicates persistent failures
- **Resolution rate**: `resolved / (resolved + pending + ignored)`

## Best Practices

1. **Monitor pending count** - Alert if > 10 pending events
2. **Review high retry counts** - If retryCount > 5, investigate deeper issue
3. **Clean up old resolved** - Periodically delete resolved records > 30 days
4. **Never ignore critical events** - Only ignore truly unrecoverable events
5. **Test retries in staging** - Verify fixes before retrying in production

## Architecture Integration

The DLQ system integrates with BullMQ event bus:

```
Domain Service
  ↓
Publishes event
  ↓
BullMQ Queue
  ↓
BullMQ Worker processes
  ├─ Success → Check for DLQ record → Mark resolved
  └─ Failure (3x) → Create/update DLQ record with fingerprint
```

Admin manually triggers retry:

```
Admin API
  ↓
Load DLQ record
  ↓
Republish event to BullMQ
  ↓
Event processes (with fingerprint matching for DLQ tracking)
```

## Security Considerations

- All admin endpoints require authentication
- Consider adding role-based access control (RBAC)
- Audit log all retry operations
- Rate limit retry operations to prevent abuse
