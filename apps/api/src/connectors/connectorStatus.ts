import { isLegalRequirementApproved } from '../config/connectors/sourceLegalRequirements';
import { ConnectorDefinition, ConnectorState } from './connectorContracts';
import { connectorCredentialValidator } from './connectorCredentialValidator';

export function connectorStatus(connector: ConnectorDefinition) {
  const credentialStatus = connectorCredentialValidator(connector);
  const legalApproved = isLegalRequirementApproved(connector.legalRequirementKey);
  const markedActive = connector.activeEnvKey ? process.env[connector.activeEnvKey] === 'true' : false;

  let state: ConnectorState = 'NOT_CONFIGURED';

  if (!credentialStatus.endpointConfigured) {
    state = 'NOT_CONFIGURED';
  } else if (!credentialStatus.credentialsConfigured) {
    state = 'CREDENTIALS_MISSING';
  } else if (!legalApproved) {
    state = 'LEGAL_REVIEW_REQUIRED';
  } else {
    state = 'READY_FOR_TEST';
  }

  if (markedActive && state === 'READY_FOR_TEST') {
    state = 'ACTIVE';
  }

  if (process.env[`CONNECTOR_${connector.key.toUpperCase()}_DISABLED`] === 'true') {
    state = 'DISABLED';
  }

  return {
    connectorKey: connector.key,
    state,
    credentialStatus,
    legalApproved,
    markedActive,
  };
}
