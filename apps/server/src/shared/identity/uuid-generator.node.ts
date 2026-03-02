import { randomUUID } from 'node:crypto';
import type { UUIDGenerator } from '@cavok/core/shared/identity/uuid-generator.port';

export class NodeUuidGenerator implements UUIDGenerator {
  generate(): string {
    return randomUUID();
  }
}
