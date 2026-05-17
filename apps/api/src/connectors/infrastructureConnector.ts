import { CONNECTOR_ACTIVATION_POLICIES } from '../config/connectors/connectorActivationPolicies';
import { isLegalRequirementApproved } from '../config/connectors/sourceLegalRequirements';
import {
  ConnectorExecutionContract,
  ConnectorSampleValidationResult,
  ConnectorState,
  ConnectorTestOutcome,
} from './connectorContracts';

export const infrastructureConnectorExecution: ConnectorExecutionContract = {
  key: 'infrastructure_feed',
  requiredEnv: ['CONNECTOR_INFRA_API_KEY', 'CONNECTOR_INFRA_ENDPOINT'],
  legalRequirement: 'infrastructure_feed_terms',

  status(): ConnectorState {
    const endpoint = process.env['CONNECTOR_INFRA_ENDPOINT'];
    const apiKey = process.env['CONNECTOR_INFRA_API_KEY'];
    if (!endpoint) return 'NOT_CONFIGURED';
    if (!apiKey) return 'CREDENTIALS_MISSING';
    if (!isLegalRequirementApproved('infrastructure_feed_terms')) return 'LEGAL_REVIEW_REQUIRED';
    return 'READY_FOR_TEST';
  },

  async test(): Promise<ConnectorTestOutcome> {
    const state = this.status();
    const checkedAt = new Date().toISOString();
    if (state !== 'READY_FOR_TEST') {
      return { state, message: `Cannot test: connector state is ${state}.`, checkedAt };
    }
    if (!CONNECTOR_ACTIVATION_POLICIES.allowLiveExternalCalls) {
      const passFlag = process.env['CONNECTOR_INFRASTRUCTURE_FEED_LAST_TEST_OK'] === 'true';
      return {
        state: passFlag ? 'TEST_PASSED' : 'TEST_FAILED',
        message: passFlag
          ? 'Config validation pass. Live external call gated by activation policy.'
          : 'Test not passed. Set CONNECTOR_INFRASTRUCTURE_FEED_LAST_TEST_OK=true after verifying endpoint.',
        samplePayloadSchema: passFlag ? { city: 'string', transportScore: 'number', utilityCoverage: 'number' } : undefined,
        checkedAt,
      };
    }
    return { state: 'TEST_FAILED', message: 'Live external call not implemented; configure allowLiveExternalCalls.', checkedAt };
  },

  validateSample(sample: unknown): ConnectorSampleValidationResult {
    if (!sample || typeof sample !== 'object') return { valid: false, errors: ['Sample is not an object.'] };
    const s = sample as Record<string, unknown>;
    const errors: string[] = [];
    if (!s['city']) errors.push('Missing city');
    if (typeof s['transportScore'] !== 'number') errors.push('transportScore must be a number');
    return { valid: errors.length === 0, errors };
  },

  normalizeSample(sample: unknown): Record<string, unknown> {
    const s = (sample ?? {}) as Record<string, unknown>;
    return {
      city: s['city'] ?? null,
      transportScore: s['transportScore'] ?? null,
      utilityCoverage: s['utilityCoverage'] ?? null,
      checkedAt: new Date().toISOString(),
    };
  },
};
