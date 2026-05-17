export const WORKER_POLICIES = {
  analysisWorker: { concurrency: 2, enabledByDefault: true },
  marketWorker: { concurrency: 2, enabledByDefault: true },
  geoWorker: { concurrency: 2, enabledByDefault: true },
  alertWorker: { concurrency: 1, enabledByDefault: true },
  ingestionWorker: { concurrency: 3, enabledByDefault: true },
} as const;
