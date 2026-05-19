export function ingestionRetryManager(input: {
  connectorKey: string;
  status: 'SUCCESS' | 'SKIPPED' | 'FAILED';
  attempt: number;
  maxAttempts: number;
}) {
  const shouldRetry = input.status === 'FAILED' && input.attempt < input.maxAttempts;
  return {
    connectorKey: input.connectorKey,
    shouldRetry,
    nextAttempt: shouldRetry ? input.attempt + 1 : input.attempt,
    backoffSeconds: shouldRetry ? Math.min(300, input.attempt * 15) : 0,
  };
}
