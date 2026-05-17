export const BULLMQ_POLICIES = {
  queueNames: {
    analysis: 'analysis',
    market: 'market',
    geo: 'geo',
    alert: 'alert',
    ingestion: 'ingestion',
  },
  defaultRemoveOnComplete: 200,
  defaultRemoveOnFail: 500,
} as const;
