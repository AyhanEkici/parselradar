import { ConnectorExecutionContract, ConnectorKey } from './connectorContracts';
import { tkgmProductionConnectorExecution } from './tkgmProductionConnector';
import { municipalityPlanningConnectorExecution } from './municipalityPlanningConnector';
import { listingConnectorExecution } from './listingConnector';
import { infrastructureConnectorExecution } from './infrastructureConnector';
import { demographicConnectorExecution } from './demographicConnector';
import { mapGeocodingConnectorExecution } from './mapGeocodingConnector';
import { emailProviderConnectorExecution } from './emailProviderConnector';
import { tucbsConnectorExecution } from './tucbs/tucbsConnector';

const EXECUTION_REGISTRY: ConnectorExecutionContract[] = [
  tucbsConnectorExecution,
  tkgmProductionConnectorExecution,
  municipalityPlanningConnectorExecution,
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
