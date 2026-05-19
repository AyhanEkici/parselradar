import { CONNECTOR_CAPABILITY_MATRIX, ConnectorActivationState, ConnectorKeyV26 } from './connectorCapabilityMatrix';

export type ConnectorGovernanceRecord = {
  key: ConnectorKeyV26;
  activationState: ConnectorActivationState;
  configuredAt: string | null;
  testedAt: string | null;
  activatedAt: string | null;
  lastStatusAt: string;
  activationNotes: string[];
  testRunEvidence: string[];
  legalReviewRequired: boolean;
  manualActivationRequired: true;
};

function envValue(name: string) {
  return String(process.env[name] || '').trim();
}

function isTrue(name: string) {
  return envValue(name).toLowerCase() === 'true';
}

function buildActivationState(key: ConnectorKeyV26): ConnectorActivationState {
  const prefix = `CONNECTOR_${key.toUpperCase()}`;
  const configured = isTrue(`${prefix}_CONFIGURED`);
  const testPassed = isTrue(`${prefix}_TEST_PASSED`);
  const activated = isTrue(`${prefix}_ACTIVATED`);
  const disabled = isTrue(`${prefix}_DISABLED`);
  const legalReview = isTrue(`${prefix}_LEGAL_REVIEW`);
  const rateLimited = isTrue(`${prefix}_RATE_LIMITED`);
  const degraded = isTrue(`${prefix}_DEGRADED`);
  const testing = isTrue(`${prefix}_TESTING`);
  const failed = isTrue(`${prefix}_FAILED`);

  if (disabled) return 'DISABLED';
  if (legalReview) return 'LEGAL_REVIEW';
  if (rateLimited) return 'RATE_LIMITED';
  if (failed) return 'FAILED';
  if (degraded) return 'DEGRADED';
  if (testing) return 'TESTING';
  if (!configured) return 'NOT_CONFIGURED';
  if (configured && !testPassed) return 'CONFIGURED';
  if (testPassed && !activated) return 'READY_FOR_TEST';
  if (activated && testPassed) return 'ACTIVE';
  return 'CONFIGURED';
}

export function connectorGovernanceRegistry(nowIso = new Date().toISOString()) {
  const keys = Object.keys(CONNECTOR_CAPABILITY_MATRIX) as ConnectorKeyV26[];

  const connectors: ConnectorGovernanceRecord[] = keys.map((key) => {
    const prefix = `CONNECTOR_${key.toUpperCase()}`;
    const activationNotesRaw = envValue(`${prefix}_ACTIVATION_NOTES`);
    const testEvidenceRaw = envValue(`${prefix}_TEST_EVIDENCE`);

    return {
      key,
      activationState: buildActivationState(key),
      configuredAt: envValue(`${prefix}_CONFIGURED_AT`) || null,
      testedAt: envValue(`${prefix}_TESTED_AT`) || null,
      activatedAt: envValue(`${prefix}_ACTIVATED_AT`) || null,
      lastStatusAt: envValue(`${prefix}_STATUS_AT`) || nowIso,
      activationNotes: activationNotesRaw ? activationNotesRaw.split('|').map((x) => x.trim()).filter(Boolean) : [],
      testRunEvidence: testEvidenceRaw ? testEvidenceRaw.split('|').map((x) => x.trim()).filter(Boolean) : [],
      legalReviewRequired: isTrue(`${prefix}_LEGAL_REVIEW`),
      manualActivationRequired: true,
    };
  });

  const statusCounts = connectors.reduce<Record<ConnectorActivationState, number>>(
    (acc, connector) => {
      acc[connector.activationState] += 1;
      return acc;
    },
    {
      NOT_CONFIGURED: 0,
      CONFIGURED: 0,
      READY_FOR_TEST: 0,
      TESTING: 0,
      ACTIVE: 0,
      DEGRADED: 0,
      RATE_LIMITED: 0,
      DISABLED: 0,
      LEGAL_REVIEW: 0,
      FAILED: 0,
    }
  );

  return {
    connectors,
    statusCounts,
  };
}
