import {
  apiPath,
  envMaskDetail,
  fileExists,
  finalizeSection,
  makeCheck,
  makeMissingExternalConfig,
  makeRisk,
  readText,
  repoPath,
  RuntimeTruthStateProof,
  VerificationSection,
} from './platformVerification';

const CATEGORY = 'Runtime';

export function verifyRuntime(): VerificationSection {
  const checks = [];
  const riskRegister = [];
  const missingExternalConfigs = [];
  const runtimeStates: RuntimeTruthStateProof[] = [];
  const runtimeStatePath = apiPath('runtime', 'runtimeState.ts');

  for (const requiredPath of [
    apiPath('runtime', 'workerFactory.ts'),
    apiPath('runtime', 'queueFactory.ts'),
    apiPath('runtime', 'queueEvents.ts'),
    apiPath('runtime', 'runtimeConfig.ts'),
    runtimeStatePath,
    apiPath('redis', 'redisClient.ts'),
    apiPath('redis', 'redisConfig.ts'),
    apiPath('redis', 'redisHealth.ts'),
    apiPath('jobs'),
  ]) {
    checks.push(
      makeCheck(
        CATEGORY,
        `${requiredPath.split(/[/\\]/).slice(-1)[0]} exists`,
        fileExists(requiredPath) ? 'PASS' : 'FAIL',
        fileExists(requiredPath) ? 'Required runtime surface file or directory is present.' : 'Required runtime surface file or directory is missing.',
      ),
    );
  }

  const rootPackage = readText(repoPath('package.json'));
  const apiPackage = readText(repoPath('apps', 'api', 'package.json'));
  const webPackage = readText(repoPath('apps', 'web', 'package.json'));
  checks.push(
    makeCheck(CATEGORY, 'Root build script exists', rootPackage.includes('"build"') ? 'PASS' : 'FAIL', 'Root package build script presence verified.'),
    makeCheck(CATEGORY, 'API build script exists', apiPackage.includes('"build"') ? 'PASS' : 'FAIL', 'API package build script presence verified.'),
    makeCheck(CATEGORY, 'Web build script exists', webPackage.includes('"build"') ? 'PASS' : 'FAIL', 'Web package build script presence verified.'),
    makeCheck(CATEGORY, 'API tsconfig exists', fileExists(repoPath('apps', 'api', 'tsconfig.json')) ? 'PASS' : 'FAIL', 'API TypeScript config presence verified.'),
    makeCheck(CATEGORY, 'Web tsconfig exists', fileExists(repoPath('apps', 'web', 'tsconfig.json')) ? 'PASS' : 'FAIL', 'Web TypeScript config presence verified.'),
  );

  const distributedRuntimeEnabled = process.env.ENABLE_DISTRIBUTED_RUNTIME === '1' || process.env.ENABLE_DISTRIBUTED_RUNTIME === 'true';
  const redisConfigured = Boolean(process.env.REDIS_URL);
  const queuesEnabled = process.env.RUNTIME_QUEUES_ENABLED !== '0';
  const workersEnabled = process.env.RUNTIME_WORKERS_ENABLED !== '0';
  const localFallbackAvailable = fileExists(runtimeStatePath) && readText(runtimeStatePath).includes("'local-fallback'");

  runtimeStates.push({
    key: 'redis',
    state: !distributedRuntimeEnabled ? 'DISABLED' : redisConfigured ? 'READY' : 'NOT_CONFIGURED',
    status: !distributedRuntimeEnabled || redisConfigured ? 'PASS' : 'WARN',
    reason: !distributedRuntimeEnabled
      ? 'Distributed runtime is disabled by configuration.'
      : redisConfigured
        ? 'REDIS_URL is present; readiness is config-only and not live-probed.'
        : localFallbackAvailable
          ? 'REDIS_URL is missing but runtime supports local-fallback.'
          : 'REDIS_URL is missing and no fallback evidence was found. This is WARN (missing external config), not FAIL.',
  });

  runtimeStates.push({
    key: 'bullmq',
    state: !distributedRuntimeEnabled ? 'DISABLED' : redisConfigured ? 'READY' : 'NOT_CONFIGURED',
    status: !distributedRuntimeEnabled || redisConfigured ? 'PASS' : 'WARN',
    reason: !distributedRuntimeEnabled
      ? 'BullMQ is disabled because distributed runtime is off.'
      : redisConfigured
        ? 'BullMQ config can be constructed from runtime env keys.'
        : 'BullMQ cannot use Redis because REDIS_URL is absent. This is WARN (missing external config), not FAIL.',
  });

  runtimeStates.push({
    key: 'queues',
    state: !queuesEnabled ? 'DISABLED' : !distributedRuntimeEnabled ? 'DISABLED' : redisConfigured ? 'READY' : localFallbackAvailable ? 'DEGRADED' : 'NOT_CONFIGURED',
    status: !queuesEnabled || !distributedRuntimeEnabled || redisConfigured ? 'PASS' : 'WARN',
    reason: !queuesEnabled
      ? 'Queue processing is disabled by RUNTIME_QUEUES_ENABLED=0.'
      : !distributedRuntimeEnabled
        ? 'Distributed queue backend is disabled.'
        : redisConfigured
          ? 'Queue backend can use Redis configuration.'
          : 'Queue backend falls back or remains unconfigured until REDIS_URL is present. This is WARN (missing external config), not FAIL.',
  });

  runtimeStates.push({
    key: 'workers',
    state: !workersEnabled ? 'DISABLED' : !distributedRuntimeEnabled ? 'DISABLED' : redisConfigured ? 'READY' : localFallbackAvailable ? 'DEGRADED' : 'NOT_CONFIGURED',
    status: !workersEnabled || !distributedRuntimeEnabled || redisConfigured ? 'PASS' : 'WARN',
    reason: !workersEnabled
      ? 'Workers are disabled by RUNTIME_WORKERS_ENABLED=0.'
      : !distributedRuntimeEnabled
        ? 'Workers are disabled because distributed runtime is off.'
        : redisConfigured
          ? 'Workers can be created with configured Redis settings.'
          : 'Workers cannot use distributed runtime until REDIS_URL is present. This is WARN (missing external config), not FAIL.',
  });

  for (const runtimeState of runtimeStates) {
    checks.push(makeCheck(CATEGORY, `${runtimeState.key} truth state`, runtimeState.status, `${runtimeState.key} resolved to ${runtimeState.state}.`, runtimeState.reason));
  }

  checks.push(
    makeCheck(
      CATEGORY,
      'VERIFY_PLATFORM_ALLOW_EXTERNAL mode',
      process.env.VERIFY_PLATFORM_ALLOW_EXTERNAL === 'true' ? 'WARN' : 'PASS',
      process.env.VERIFY_PLATFORM_ALLOW_EXTERNAL === 'true'
        ? 'VERIFY_PLATFORM_ALLOW_EXTERNAL=true is set, but the harness remains static and does not perform external calls.'
        : 'External verification mode is not enabled.',
      envMaskDetail(['VERIFY_PLATFORM_ALLOW_EXTERNAL']),
    ),
    makeCheck(
      CATEGORY,
      'Core runtime env readiness',
      process.env.MONGODB_URI && process.env.JWT_SECRET && process.env.CLIENT_URL ? 'PASS' : 'WARN',
      process.env.MONGODB_URI && process.env.JWT_SECRET && process.env.CLIENT_URL
        ? 'Core runtime env keys are present.'
        : 'One or more core runtime env keys are missing.',
      envMaskDetail(['MONGODB_URI', 'JWT_SECRET', 'CLIENT_URL']),
    ),
  );

  if (!process.env.REDIS_URL && distributedRuntimeEnabled) {
    missingExternalConfigs.push(makeMissingExternalConfig(CATEGORY, 'REDIS_URL', 'Distributed runtime is enabled but Redis is not configured.', 'WARN'));
  }
  if (!process.env.MONGODB_URI) {
    missingExternalConfigs.push(makeMissingExternalConfig(CATEGORY, 'MONGODB_URI', 'Database connection string is missing.', 'WARN'));
  }
  if (!process.env.JWT_SECRET) {
    missingExternalConfigs.push(makeMissingExternalConfig(CATEGORY, 'JWT_SECRET', 'JWT secret is missing.', 'WARN'));
  }
  if (!process.env.CLIENT_URL) {
    missingExternalConfigs.push(makeMissingExternalConfig(CATEGORY, 'CLIENT_URL', 'Client origin is missing.', 'WARN'));
  }

  if (!redisConfigured && distributedRuntimeEnabled && localFallbackAvailable) {
    riskRegister.push(
      makeRisk(
        CATEGORY,
        'medium',
        'Distributed runtime degrades to fallback',
        'Redis is not configured while distributed runtime is enabled. Code indicates a local-fallback backend, so this is WARN rather than FAIL.',
      ),
    );
  }

  return finalizeSection({ category: CATEGORY, checks, riskRegister, missingExternalConfigs, runtimeStates });
}
