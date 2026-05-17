import { ConnectorDefinition } from '../../connectors/connectorContracts';
import { connectorCredentialValidator } from '../../connectors/connectorCredentialValidator';

export function validateConnectorCredentials(connector: ConnectorDefinition) {
  return connectorCredentialValidator(connector);
}
