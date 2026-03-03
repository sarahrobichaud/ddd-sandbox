import crypto from "crypto";

/**
 * Create a deterministic fingerprint for an event
 * Used to match DLQ records to events without metadata tracking
 *
 * @param eventName - The name of the event
 * @param payload - The event payload (should NOT include metadata like __dlqRecordId)
 * @returns A SHA-256 hash of the event content
 */
export function createEventFingerprint(eventName: string, payload: any): string {
  // Create deterministic string representation
  const content = JSON.stringify({
    name: eventName,
    payload: payload,
  });

  // Generate SHA-256 hash
  return crypto.createHash("sha256").update(content).digest("hex");
}
