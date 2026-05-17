type QueueItem = {
  propertyId: string;
  reason: string;
  queuedAt: string;
};

const reanalysisQueue = new Map<string, QueueItem>();

export function queuePropertyReanalysis(input: { propertyId: string; reason: string }) {
  const item: QueueItem = {
    propertyId: input.propertyId,
    reason: input.reason,
    queuedAt: new Date().toISOString(),
  };
  reanalysisQueue.set(input.propertyId, item);
  return {
    refreshStatus: 'queued' as const,
    queueDepth: reanalysisQueue.size,
    item,
  };
}

export function getQueuedPropertyReanalysis(propertyId: string) {
  return reanalysisQueue.get(propertyId) || null;
}
