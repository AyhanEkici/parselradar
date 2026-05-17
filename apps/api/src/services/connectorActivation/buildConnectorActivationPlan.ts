import { ConnectorDefinition } from '../../connectors/connectorContracts';
import { connectorStatus } from '../../connectors/connectorStatus';

export function buildConnectorActivationPlan(connector: ConnectorDefinition) {
  const status = connectorStatus(connector);

  const steps: Array<{ step: string; complete: boolean; stateHint?: string }> = [
    {
      step: 'Configure endpoint',
      complete: status.credentialStatus.endpointConfigured,
      stateHint: status.credentialStatus.endpointConfigured ? 'READY_FOR_TEST' : 'NOT_CONFIGURED',
    },
    {
      step: 'Provide credentials',
      complete: status.credentialStatus.credentialsConfigured,
      stateHint: status.credentialStatus.credentialsConfigured ? 'READY_FOR_TEST' : 'CREDENTIALS_MISSING',
    },
    {
      step: 'Approve legal requirements',
      complete: status.legalApproved,
      stateHint: status.legalApproved ? 'READY_FOR_TEST' : 'LEGAL_REVIEW_REQUIRED',
    },
    {
      step: 'Run connector test',
      complete: false,
      stateHint: 'TEST_PASSED',
    },
    {
      step: 'Set connector active flag',
      complete: status.markedActive,
      stateHint: status.markedActive ? 'ACTIVE' : 'READY_FOR_TEST',
    },
  ];

  return {
    connectorKey: connector.key,
    currentState: status.state,
    steps,
    canActivate: steps.slice(0, 3).every((s) => s.complete),
    generatedAt: new Date().toISOString(),
  };
}
