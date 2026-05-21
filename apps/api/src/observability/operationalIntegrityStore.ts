import { getRuntimeDiagnostics } from '../runtime/degradedRuntime';
import { validateRuntimeEnv } from '../config/envValidator';

type FailedRequest = {
  at: string;
  method: string;
  path: string;
  status: number;
  requestId: string;
  message?: string;
};

type AuthFailure = {
  at: string;
  reason: string;
  email?: string;
  ip?: string;
};

type RetryEvent = {
  at: string;
  method: string;
  path: string;
  attempts: number;
};

const failedRequestsTimeline: FailedRequest[] = [];
const authFailureTimeline: AuthFailure[] = [];
const retryTimeline: RetryEvent[] = [];
const statusCounters: Record<string, number> = {};

let totalFailedRequests = 0;
let totalAuthFailures = 0;
let totalRetryEvents = 0;

function pushBounded<T>(target: T[], value: T, max = 200) {
  target.unshift(value);
  if (target.length > max) {
    target.length = max;
  }
}

export function recordFailedRequest(entry: FailedRequest) {
  totalFailedRequests += 1;
  const key = String(entry.status);
  statusCounters[key] = (statusCounters[key] || 0) + 1;
  pushBounded(failedRequestsTimeline, entry);
}

export function recordAuthFailure(entry: AuthFailure) {
  totalAuthFailures += 1;
  pushBounded(authFailureTimeline, entry);
}

export function recordRetryEvent(entry: RetryEvent) {
  totalRetryEvents += 1;
  pushBounded(retryTimeline, entry);
}

export function getOperationalIntegritySnapshot() {
  return {
    generatedAt: new Date().toISOString(),
    runtimeDiagnostics: getRuntimeDiagnostics(),
    envValidation: validateRuntimeEnv(),
    failedRequestSummary: {
      totalFailedRequests,
      statusCounters,
    },
    failedRequestsTimeline: failedRequestsTimeline.slice(0, 50),
    authFailureSummary: {
      totalAuthFailures,
      recent: authFailureTimeline.slice(0, 50),
    },
    retrySummary: {
      totalRetryEvents,
      recent: retryTimeline.slice(0, 50),
    },
  };
}
