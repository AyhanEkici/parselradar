export const WORKER_SCHEDULES = {
  marketWorker: '0 */6 * * *',
  geoWorker: '0 */12 * * *',
  comparableWorker: '0 */4 * * *',
  infrastructureWorker: '0 3 * * *',
} as const;
