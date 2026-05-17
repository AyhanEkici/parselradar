import { ConnectorDefinition } from '../../connectors/connectorContracts';
import { connectorTestRunner } from '../../connectors/connectorTestRunner';

export async function runConnectorHealthCheck(connector: ConnectorDefinition) {
  const testResult = await connectorTestRunner(connector);
  return {
    connectorKey: connector.key,
    testResult,
  };
}
