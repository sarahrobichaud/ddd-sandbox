# Admin Module

Administrative endpoints for system management and monitoring.

## Features

- **Dead Letter Queue (DLQ) Management**: Monitor and retry failed event processing using content-based fingerprinting

## Endpoints

All admin endpoints require authentication and are prefixed with `/v1/admin`.

### Dead Letter Queue (DLQ)

#### List Pending Dead Letters

```
GET /v1/admin/dlq/pending?limit=100
```

Returns all pending (unresolved) dead letter records.

**Query Parameters:**

- `limit` (optional): Maximum number of records to return (default: 100)

**Response:**

```json
{
  "success": true,
  "count": 5,
  "records": [
    {
      "id": "uuid",
      "jobId": "job-123",
      "eventName": "EVENT.AUTH.USER_ACCOUNT_CREATED",
      "payload": { ... },
      "error": "Connection timeout",
      "attemptCount": 3,
      "failedAt": "2024-01-09T10:00:00Z",
      "resolvedAt": null,
      "status": "pending"
    }
  ]
}
```

#### Get Dead Letter by ID

```
GET /v1/admin/dlq/:id
```

Retrieve a specific dead letter record.

#### List by Event Name

```
GET /v1/admin/dlq/event/:eventName?limit=100
```

Get all dead letters for a specific event type.

#### Retry Failed Event

```
POST /v1/admin/dlq/:id/retry
```

Republish a failed event for reprocessing. The event will be added back to the queue and processed again.

**Response:**

```json
{
  "success": true,
  "message": "Event EVENT.AUTH.USER_ACCOUNT_CREATED republished",
  "record": { ... }
}
```

#### Retry All Pending Events

```
POST /v1/admin/dlq/retry-all?limit=100
```

Retry all pending dead letters. Useful for recovering from infrastructure failures.

**Query Parameters:**

- `limit` (optional): Maximum number of records to retry (default: 100)

**Response:**

```json
{
  "success": true,
  "message": "Retried 15 of 20 dead letters",
  "results": {
    "total": 20,
    "succeeded": 15,
    "failed": 5,
    "errors": [
      {
        "id": "uuid-1",
        "error": "Still failing"
      }
    ]
  }
}
```

#### Retry All Events by Type

```
POST /v1/admin/dlq/event/:eventName/retry-all?limit=100
```

Retry all pending dead letters for a specific event type. Useful for targeted recovery.

**Example:**

```
POST /v1/admin/dlq/event/EVENT.AUTH.USER_ACCOUNT_CREATED/retry-all
```

**Response:**

```json
{
  "success": true,
  "message": "Retried 5 of 5 dead letters for EVENT.AUTH.USER_ACCOUNT_CREATED",
  "results": {
    "eventName": "EVENT.AUTH.USER_ACCOUNT_CREATED",
    "total": 5,
    "succeeded": 5,
    "failed": 0,
    "errors": []
  }
}
```

#### Ignore Dead Letter

```
POST /v1/admin/dlq/:id/ignore
```

Mark a dead letter as ignored (won't be retried).

#### Get Statistics

```
GET /v1/admin/dlq/stats
```

Get DLQ statistics.

**Response:**

```json
{
  "success": true,
  "stats": {
    "pending": 5
  }
}
```

## Usage Example

### Monitoring Failed Events

1. Check for pending failures:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8080/v1/admin/dlq/pending
```

2. Review specific failure:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8080/v1/admin/dlq/abc-123
```

3. Retry the event:

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8080/v1/admin/dlq/abc-123/retry
```

### Common Scenarios

#### Account Setup Failed

If user account creation succeeds but onboarding initialization fails:

1. Find the failed event:

```bash
GET /v1/admin/dlq/event/EVENT.AUTH.USER_ACCOUNT_CREATED
```

2. Check the error details
3. Fix the underlying issue (e.g., database connection)
4. Retry the event:

```bash
POST /v1/admin/dlq/{id}/retry
```

The onboarding will be initialized and the user's account setup will complete.

#### Database Outage Recovery

After a database outage, you may have many failed events:

1. Check stats:

```bash
GET /v1/admin/dlq/stats
```

2. Verify database is healthy
3. Retry all pending events:

```bash
POST /v1/admin/dlq/retry-all
```

4. Review the results to see if any still failed

#### Event-Specific Issues

If a specific event type is failing (e.g., all profile creations):

1. List failed events of that type:

```bash
GET /v1/admin/dlq/event/EVENT.PROFILE.CREATED
```

2. Fix the issue (e.g., bug in profile service)
3. Retry all events of that type:

```bash
POST /v1/admin/dlq/event/EVENT.PROFILE.CREATED/retry-all
```

## Architecture

The admin module follows the same patterns as other HTTP modules:

```
admin/
├── admin.http.ts           # HTTP adapter (entry point)
└── presentation/
    ├── admin.controller.ts # Request handlers
    └── admin.routes.ts     # Route definitions
```

### DLQ Fingerprinting

The DLQ system uses content-based fingerprinting to match events without metadata:

```typescript
// Fingerprint = SHA-256 of event name + payload
const fingerprint = createEventFingerprint(eventName, payload);

// When event fails:
- Check if DLQ record with this fingerprint exists
- If yes: Update existing (increment retryCount)
- If no: Create new record

// When retry succeeds:
- Match by fingerprint
- Mark as resolved automatically
```

### Integration

The admin module is wired into the application in `app.ts`:

```typescript
const adminHTTP = AdminHttpAdapter.build(deps, authHTTP);
const httpModules = [..., adminHTTP];
```

## Security

- All endpoints require authentication via `requireIdentity` middleware
- Consider adding role-based access control (RBAC) for production
- Audit log all admin actions

## Technical Documentation

See [DLQ-ARCHITECTURE.md](./DLQ-ARCHITECTURE.md) for detailed implementation details.

## Future Enhancements

- [ ] Role-based access control (admin-only endpoints)
- [ ] Audit logging for admin actions
- [ ] DLQ dashboard UI
- [ ] Alerting integration (Slack, email)
- [ ] Saga management endpoints
- [ ] System health checks
- [ ] Automatic cleanup of old resolved records
