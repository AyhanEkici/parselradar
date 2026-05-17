import React from 'react';

type Props = {
  retryPolicy?: {
    maxRetries?: number;
    backoffSeconds?: number[];
    retryableErrors?: string[];
    nonRetryableErrors?: string[];
  } | null;
};

export default function ConnectorRetryPolicyCard({ retryPolicy }: Props) {
  return (
    <div className="rounded-lg border border-violet-200 bg-violet-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-violet-800">Connector Retry Policy</div>
      <div className="mt-2 text-sm text-violet-900">Max retries: {retryPolicy?.maxRetries ?? '-'}</div>
      <div className="mt-1 text-xs text-violet-900">Backoff (s): {(retryPolicy?.backoffSeconds || []).join(', ') || '-'}</div>
      <div className="mt-3 text-xs text-violet-900">
        Retryable: {(retryPolicy?.retryableErrors || []).slice(0, 6).join(', ') || '-'}
      </div>
      <div className="mt-1 text-xs text-violet-900">
        Non-retryable: {(retryPolicy?.nonRetryableErrors || []).slice(0, 6).join(', ') || '-'}
      </div>
    </div>
  );
}

