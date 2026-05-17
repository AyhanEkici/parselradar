import { CONNECTOR_REGISTRY } from '../../connectors/connectorRegistry';
import { connectorStatus } from '../../connectors/connectorStatus';

export function buildConnectorReadiness() {
  const connectors = CONNECTOR_REGISTRY.map((connector) => {
    const status = connectorStatus(connector);
    return {
      key: connector.key,
      name: connector.name,
      category: connector.category,
      state: status.state,
      credentialStatus: status.credentialStatus,
      legalApproved: status.legalApproved,
      markedActive: status.markedActive,
    };
  });

  return {
    connectors,
    summary: {
      total: connectors.length,
      active: connectors.filter((c) => c.state === 'ACTIVE').length,
      readyForTest: connectors.filter((c) => c.state === 'READY_FOR_TEST').length,
      failedOrMissing: connectors.filter((c) => ['NOT_CONFIGURED', 'CREDENTIALS_MISSING', 'LEGAL_REVIEW_REQUIRED', 'DISABLED'].includes(c.state)).length,
    },
    generatedAt: new Date().toISOString(),
  };
}
