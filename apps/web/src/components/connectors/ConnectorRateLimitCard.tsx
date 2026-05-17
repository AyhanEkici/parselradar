import React from 'react';

type Props = {
  rateLimit?: {
    allowed?: boolean;
    throttled?: boolean;
    retryAfterSeconds?: number;
    reason?: string;
    policy?: { windowSeconds?: number; maxRequests?: number };
  } | null;
};

export default function ConnectorRateLimitCard({ rateLimit }: Props) {
  const allowed = rateLimit?.allowed ?? true;
  const throttled = rateLimit?.throttled ?? false;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-amber-800">Connector Rate Limit</div>
      <div className="mt-2 text-xl font-bold text-amber-900">{throttled ? 'THROTTLED' : allowed ? 'ALLOWED' : 'BLOCKED'}</div>
      <div className="mt-2 text-xs text-amber-900">
        Policy: {rateLimit?.policy?.maxRequests ?? '-'} requests / {rateLimit?.policy?.windowSeconds ?? '-'}s
      </div>
      <div className="mt-1 text-xs text-amber-900">Retry after: {rateLimit?.retryAfterSeconds ?? 0}s</div>
      <div className="mt-2 text-xs text-amber-800">{rateLimit?.reason || 'Local policy evaluation only.'}</div>
    </div>
  );
}

