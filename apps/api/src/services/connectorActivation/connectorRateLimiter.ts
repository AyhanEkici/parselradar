export type ConnectorRateLimitDecision = {
  allowed: boolean;
  throttled: boolean;
  retryAfterSeconds: number;
  reason: string;
  policy: {
    windowSeconds: number;
    maxRequests: number;
    connectorKey: string;
  };
};

const DEFAULT_POLICIES: Record<string, { windowSeconds: number; maxRequests: number }> = {
  tkgm_parcel: { windowSeconds: 60, maxRequests: 6 },
  municipality_zoning: { windowSeconds: 60, maxRequests: 12 },
};

export function evaluateConnectorRateLimit(params: {
  connectorKey: string;
  nowMs: number;
  recentRequestTimestampsMs: number[];
}): ConnectorRateLimitDecision {
  const { connectorKey, nowMs, recentRequestTimestampsMs } = params;
  const policy = DEFAULT_POLICIES[connectorKey] || { windowSeconds: 60, maxRequests: 10 };

  const windowStart = nowMs - policy.windowSeconds * 1000;
  const inWindow = recentRequestTimestampsMs.filter((ts) => ts >= windowStart && ts <= nowMs);

  if (inWindow.length < policy.maxRequests) {
    return {
      allowed: true,
      throttled: false,
      retryAfterSeconds: 0,
      reason: 'Within local rate limit window.',
      policy: { connectorKey, windowSeconds: policy.windowSeconds, maxRequests: policy.maxRequests },
    };
  }

  const oldestInWindow = Math.min(...inWindow);
  const retryAfterMs = Math.max(0, oldestInWindow + policy.windowSeconds * 1000 - nowMs);
  const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);

  return {
    allowed: false,
    throttled: true,
    retryAfterSeconds,
    reason: 'Local rate limit window exceeded.',
    policy: { connectorKey, windowSeconds: policy.windowSeconds, maxRequests: policy.maxRequests },
  };
}

