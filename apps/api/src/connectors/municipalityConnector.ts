import { CONNECTOR_ACTIVATION_POLICIES } from '../config/connectors/connectorActivationPolicies';
import { isLegalRequirementApproved } from '../config/connectors/sourceLegalRequirements';
import {
  ConnectorExecutionContract,
  ConnectorSampleValidationResult,
  ConnectorState,
  ConnectorTestOutcome,
} from './connectorContracts';

export const municipalityConnectorExecution: ConnectorExecutionContract = {
  key: 'municipality_zoning',
  requiredEnv: ['CONNECTOR_MUNICIPALITY_TOKEN', 'CONNECTOR_MUNICIPALITY_ENDPOINT'],
  legalRequirement: 'municipality_terms',

  status(): ConnectorState {
    const endpoint = process.env['CONNECTOR_MUNICIPALITY_ENDPOINT'];
    const token = process.env['CONNECTOR_MUNICIPALITY_TOKEN'];
    if (!endpoint) return 'NOT_CONFIGURED';
    if (!token) return 'CREDENTIALS_MISSING';
    if (!isLegalRequirementApproved('municipality_terms')) return 'LEGAL_REVIEW_REQUIRED';
    return 'READY_FOR_TEST';
  },

  async test(): Promise<ConnectorTestOutcome> {
    const state = this.status();
    const checkedAt = new Date().toISOString();
    if (state !== 'READY_FOR_TEST') {
      return { state, message: `Cannot test: connector state is ${state}.`, checkedAt };
    }
    if (!CONNECTOR_ACTIVATION_POLICIES.allowLiveExternalCalls) {
      const passFlag = process.env['CONNECTOR_MUNICIPALITY_ZONING_LAST_TEST_OK'] === 'true';
      return {
        state: passFlag ? 'TEST_PASSED' : 'TEST_FAILED',
        message: passFlag
          ? 'Config validation pass. Live external call gated by activation policy.'
          : 'Test not passed. Set CONNECTOR_MUNICIPALITY_ZONING_LAST_TEST_OK=true after verifying endpoint.',
        samplePayloadSchema: passFlag ? { city: 'string', district: 'string', zoneType: 'string', planCode: 'string' } : undefined,
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
    if (!s['zoneType']) errors.push('Missing zoneType');
    return { valid: errors.length === 0, errors };
  },

  normalizeSample(sample: unknown): Record<string, unknown> {
    const s = (sample ?? {}) as Record<string, unknown>;
    return {
      city: s['city'] ?? null,
      district: s['district'] ?? null,
      zoneType: s['zoneType'] ?? null,
      planCode: s['planCode'] ?? null,
      checkedAt: new Date().toISOString(),
    };
  },
};
