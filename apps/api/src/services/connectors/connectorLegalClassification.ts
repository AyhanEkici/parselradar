import { CONNECTOR_CAPABILITY_MATRIX, ConnectorKeyV26 } from './connectorCapabilityMatrix';
import { publicDataClassification } from '../legal/publicDataClassification';

export function connectorLegalClassification(connectorKey: ConnectorKeyV26) {
  const capability = CONNECTOR_CAPABILITY_MATRIX[connectorKey];
  const classification = publicDataClassification({
    sourceType: capability.sourceType,
    legalClass: capability.legalClass,
  });

  return {
    connectorKey,
    legalClass: capability.legalClass,
    governanceState: classification.governanceState,
    usageRestrictions: classification.usageRestrictions,
    endorsementDisclaimer:
      'ParselRadar does not imply official endorsement from municipalities, TKGM, or any public institution.',
  };
}
