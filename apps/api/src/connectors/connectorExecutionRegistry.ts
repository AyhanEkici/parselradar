import { ConnectorExecutionContract, ConnectorKey } from './connectorContracts';
import { tkgmConnectorExecution } from './tkgmConnector';
import { municipalityConnectorExecution } from './municipalityConnector';
import { listingConnectorExecution } from './listingConnector';
import { infrastructureConnectorExecution } from './infrastructureConnector';
import { demographicConnectorExecution } from './demographicConnector';
import { mapGeocodingConnectorExecution } from './mapGeocodingConnector';
import { emailProviderConnectorExecution } from './emailProviderConnector';

const EXECUTION_REGISTRY: ConnectorExecutionContract[] = [
  tkgmConnectorExecution,
  municipalityConnectorExecution,
  listingConnectorExecution,
  infrastructureConnectorExecution,
  demographicConnectorExecution,
  mapGeocodingConnectorExecution,
  emailProviderConnectorExecution,
];

export function findConnectorExecution(connectorKey: string): ConnectorExecutionContract | undefined {
  return EXECUTION_REGISTRY.find((c) => c.key === (connectorKey as ConnectorKey));
}

export { EXECUTION_REGISTRY };
