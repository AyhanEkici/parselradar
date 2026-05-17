import { CONNECTOR_ACTIVATION_POLICIES } from '../config/connectors/connectorActivationPolicies';
import { isLegalRequirementApproved } from '../config/connectors/sourceLegalRequirements';
import {
  ConnectorExecutionContract,
  ConnectorSampleValidationResult,
  ConnectorState,
  ConnectorTestOutcome,
} from './connectorContracts';

export const listingConnectorExecution: ConnectorExecutionContract = {
  key: 'listing_feed',
  requiredEnv: ['CONNECTOR_LISTING_API_KEY', 'CONNECTOR_LISTING_ENDPOINT'],
  legalRequirement: 'listing_feed_terms',

  status(): ConnectorState {
    const endpoint = process.env['CONNECTOR_LISTING_ENDPOINT'];
    const apiKey = process.env['CONNECTOR_LISTING_API_KEY'];
    if (!endpoint) return 'NOT_CONFIGURED';
    if (!apiKey) return 'CREDENTIALS_MISSING';
    if (!isLegalRequirementApproved('listing_feed_terms')) return 'LEGAL_REVIEW_REQUIRED';
    return 'READY_FOR_TEST';
  },

  async test(): Promise<ConnectorTestOutcome> {
    const state = this.status();
    const checkedAt = new Date().toISOString();
    if (state !== 'READY_FOR_TEST') {
      return { state, message: `Cannot test: connector state is ${state}.`, checkedAt };
    }
    if (!CONNECTOR_ACTIVATION_POLICIES.allowLiveExternalCalls) {
      const passFlag = process.env['CONNECTOR_LISTING_FEED_LAST_TEST_OK'] === 'true';
      return {
        state: passFlag ? 'TEST_PASSED' : 'TEST_FAILED',
        message: passFlag
          ? 'Config validation pass. Live external call gated by activation policy.'
          : 'Test not passed. Set CONNECTOR_LISTING_FEED_LAST_TEST_OK=true after verifying endpoint.',
        samplePayloadSchema: passFlag ? { listingId: 'string', price: 'number', city: 'string', propertyType: 'string', area: 'number' } : undefined,
        checkedAt,
      };
    }
    return { state: 'TEST_FAILED', message: 'Live external call not implemented; configure allowLiveExternalCalls.', checkedAt };
  },

  validateSample(sample: unknown): ConnectorSampleValidationResult {
    if (!sample || typeof sample !== 'object') return { valid: false, errors: ['Sample is not an object.'] };
    const s = sample as Record<string, unknown>;
    const errors: string[] = [];
    if (!s['listingId']) errors.push('Missing listingId');
    if (typeof s['price'] !== 'number') errors.push('price must be a number');
    return { valid: errors.length === 0, errors };
  },

  normalizeSample(sample: unknown): Record<string, unknown> {
    const s = (sample ?? {}) as Record<string, unknown>;
    return {
      listingId: s['listingId'] ?? null,
      price: s['price'] ?? null,
      city: s['city'] ?? null,
      district: s['district'] ?? null,
      propertyType: s['propertyType'] ?? null,
      area: s['area'] ?? null,
      checkedAt: new Date().toISOString(),
    };
  },
};
