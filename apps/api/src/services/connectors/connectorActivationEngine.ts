import { connectorGovernanceRegistry } from './connectorGovernanceRegistry';
import { connectorHealthClassifier } from './connectorHealthClassifier';
import { connectorLegalClassification } from './connectorLegalClassification';
import { ConnectorActivationState } from './connectorCapabilityMatrix';

export type ConnectorActivationDecision = {
  connectorKey: string;
  currentState: ConnectorActivationState;
  nextState: ConnectorActivationState;
  allowed: boolean;
  reason: string;
  requiresManualReview: boolean;
};

export function connectorActivationEngine(input: { connectorKey: string; requestedAction: 'activate' | 'test' | 'disable' }) {
  const registry = connectorGovernanceRegistry();
  const connector = registry.connectors.find((item) => item.key === input.connectorKey);

  if (!connector) {
    return {
      connectorKey: input.connectorKey,
      currentState: 'FAILED' as ConnectorActivationState,
      nextState: 'FAILED' as ConnectorActivationState,
      allowed: false,
      reason: 'connector_not_registered',
      requiresManualReview: true,
    } satisfies ConnectorActivationDecision;
  }

  const legal = connectorLegalClassification(connector.key);
  const health = connectorHealthClassifier({ state: connector.activationState, freshnessScore: 100 });

  if (legal.governanceState !== 'ALLOW' && input.requestedAction !== 'disable') {
    return {
      connectorKey: connector.key,
      currentState: connector.activationState,
      nextState: 'LEGAL_REVIEW' as ConnectorActivationState,
      allowed: false,
      reason: 'legal_restriction',
      requiresManualReview: true,
    } satisfies ConnectorActivationDecision;
  }

  if (input.requestedAction === 'disable') {
    return {
      connectorKey: connector.key,
      currentState: connector.activationState,
      nextState: 'DISABLED',
      allowed: true,
      reason: 'manual_disable',
      requiresManualReview: false,
    } satisfies ConnectorActivationDecision;
  }

  if (input.requestedAction === 'test') {
    const canTest = connector.activationState === 'CONFIGURED' || connector.activationState === 'READY_FOR_TEST';
    return {
      connectorKey: connector.key,
      currentState: connector.activationState,
      nextState: canTest ? 'TESTING' : connector.activationState,
      allowed: canTest,
      reason: canTest ? 'test_run_started' : `cannot_test_from_${connector.activationState.toLowerCase()}`,
      requiresManualReview: !canTest,
    } satisfies ConnectorActivationDecision;
  }

  const hasActivationEvidence = connector.activationNotes.length > 0 && connector.testRunEvidence.length > 0;
  const allowActivation = connector.activationState === 'READY_FOR_TEST' && hasActivationEvidence;

  return {
    connectorKey: connector.key,
    currentState: connector.activationState,
    nextState: allowActivation ? 'ACTIVE' : connector.activationState,
    allowed: allowActivation,
    reason: allowActivation
      ? `manual_activation_with_evidence_${health.health}`
      : 'activation_requires_ready_for_test_plus_evidence',
    requiresManualReview: !allowActivation,
  } satisfies ConnectorActivationDecision;
}
