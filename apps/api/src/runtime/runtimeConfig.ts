export function getRuntimeConfig() {
  const distributedRuntimeEnabled = process.env.ENABLE_DISTRIBUTED_RUNTIME === '1' || process.env.ENABLE_DISTRIBUTED_RUNTIME === 'true';
  const redisUrl = process.env.REDIS_URL || '';
  const redisTls = process.env.REDIS_TLS === '1' || process.env.REDIS_TLS === 'true';
  const redisPrefix = process.env.REDIS_PREFIX || 'parselradar';
  const workerConcurrency = Number(process.env.WORKER_CONCURRENCY || 0);
  const queuesEnabled = process.env.RUNTIME_QUEUES_ENABLED !== '0';
  const workersEnabled = process.env.RUNTIME_WORKERS_ENABLED !== '0';
  const bullmqEnabled = distributedRuntimeEnabled;

  return {
    distributedRuntimeEnabled,
    redisUrl,
    redisTls,
    redisPrefix,
    workerConcurrency: Number.isNaN(workerConcurrency) ? 0 : workerConcurrency,
    redisConfigured: Boolean(redisUrl),
    queuesEnabled,
    workersEnabled,
    bullmqEnabled,
  };
}
