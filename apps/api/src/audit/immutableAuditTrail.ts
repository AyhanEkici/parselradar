export function immutableAuditTrail<T extends Record<string, unknown>>(entry: T) {
  return Object.freeze({
    ...entry,
    immutable: true,
    recordedAt: new Date().toISOString(),
  });
}
