export function downloadAccessAudit(input: { userId?: string; resourceType: string; resourceId: string; allowed: boolean }) {
  return {
    timestamp: new Date().toISOString(),
    userId: input.userId || null,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    decision: input.allowed ? 'allow' : 'deny',
  };
}
