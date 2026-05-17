import { SOURCE_LEGAL_REQUIREMENTS, isLegalRequirementApproved } from '../../config/connectors/sourceLegalRequirements';
import { CONNECTOR_REGISTRY } from '../../connectors/connectorRegistry';

export function buildLegalSourceRegistry() {
  const connectors = CONNECTOR_REGISTRY.map((connector) => ({
    connectorKey: connector.key,
    connectorName: connector.name,
    legalRequirementKey: connector.legalRequirementKey,
    legalApproved: isLegalRequirementApproved(connector.legalRequirementKey),
    requirement: SOURCE_LEGAL_REQUIREMENTS[connector.legalRequirementKey],
  }));

  return {
    legalRegistryState: connectors.some((item) => !item.legalApproved) ? 'LEGAL_REVIEW_REQUIRED' : 'READY_FOR_TEST',
    connectors,
  };
}
