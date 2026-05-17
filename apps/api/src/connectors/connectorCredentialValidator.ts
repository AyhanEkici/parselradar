import { ConnectorDefinition } from './connectorContracts';

export function connectorCredentialValidator(connector: ConnectorDefinition) {
  const missingCredentialKeys = connector.credentialEnvKeys.filter((key) => !process.env[key]);
  const endpointConfigured = connector.endpointEnvKey ? Boolean(process.env[connector.endpointEnvKey]) : true;

  return {
    credentialKeys: connector.credentialEnvKeys,
    missingCredentialKeys,
    credentialsConfigured: missingCredentialKeys.length === 0,
    endpointConfigured,
  };
}
