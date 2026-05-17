export type ConnectorRetryPolicy = {
  connectorKey: string;
  maxRetries: number;
  backoffSeconds: number[];
  retryableErrors: string[];
  nonRetryableErrors: string[];
};

const DEFAULT_RETRY_POLICIES: Record<string, ConnectorRetryPolicy> = {
  tkgm_parcel: {
    connectorKey: 'tkgm_parcel',
    maxRetries: 3,
    backoffSeconds: [2, 10, 30],
    retryableErrors: ['ETIMEDOUT', 'ECONNRESET', 'EAI_AGAIN', 'HTTP_429', 'HTTP_503'],
    nonRetryableErrors: ['HTTP_400', 'HTTP_401', 'HTTP_403', 'HTTP_404'],
  },
  municipality_zoning: {
    connectorKey: 'municipality_zoning',
    maxRetries: 2,
    backoffSeconds: [5, 20],
    retryableErrors: ['ETIMEDOUT', 'ECONNRESET', 'EAI_AGAIN', 'HTTP_429', 'HTTP_503'],
    nonRetryableErrors: ['HTTP_400', 'HTTP_401', 'HTTP_403', 'HTTP_404'],
  },
};

export function getConnectorRetryPolicy(connectorKey: string): ConnectorRetryPolicy {
  return (
    DEFAULT_RETRY_POLICIES[connectorKey] || {
      connectorKey,
      maxRetries: 2,
      backoffSeconds: [5, 15],
      retryableErrors: ['ETIMEDOUT', 'ECONNRESET', 'EAI_AGAIN', 'HTTP_429', 'HTTP_503'],
      nonRetryableErrors: ['HTTP_400', 'HTTP_401', 'HTTP_403', 'HTTP_404'],
    }
  );
}

