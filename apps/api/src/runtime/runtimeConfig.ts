export function getRuntimeConfig() {
  const redisUrl = process.env.REDIS_URL || '';
  const queuesEnabled = process.env.RUNTIME_QUEUES_ENABLED !== '0';
  const workersEnabled = process.env.RUNTIME_WORKERS_ENABLED !== '0';
  const bullmqEnabled = process.env.RUNTIME_BULLMQ_ENABLED === '1';

  return {
    redisUrl,
    redisConfigured: Boolean(redisUrl),
    queuesEnabled,
    workersEnabled,
    bullmqEnabled,
  };
}
