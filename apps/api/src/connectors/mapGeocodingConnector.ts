import { CONNECTOR_ACTIVATION_POLICIES } from '../config/connectors/connectorActivationPolicies';
import { isLegalRequirementApproved } from '../config/connectors/sourceLegalRequirements';
import {
  ConnectorExecutionContract,
  ConnectorSampleValidationResult,
  ConnectorState,
  ConnectorTestOutcome,
} from './connectorContracts';

export const mapGeocodingConnectorExecution: ConnectorExecutionContract = {
  key: 'map_geocoding',
  requiredEnv: ['CONNECTOR_MAPS_API_KEY', 'CONNECTOR_MAPS_ENDPOINT'],
  legalRequirement: 'map_provider_terms',

  status(): ConnectorState {
    const endpoint = process.env['CONNECTOR_MAPS_ENDPOINT'];
    const apiKey = process.env['CONNECTOR_MAPS_API_KEY'];
    if (!endpoint) return 'NOT_CONFIGURED';
    if (!apiKey) return 'CREDENTIALS_MISSING';
    if (!isLegalRequirementApproved('map_provider_terms')) return 'LEGAL_REVIEW_REQUIRED';
    return 'READY_FOR_TEST';
  },

  async test(): Promise<ConnectorTestOutcome> {
    const state = this.status();
    const checkedAt = new Date().toISOString();
    if (state !== 'READY_FOR_TEST') {
      return { state, message: `Cannot test: connector state is ${state}.`, checkedAt };
    }
    if (!CONNECTOR_ACTIVATION_POLICIES.allowLiveExternalCalls) {
      const passFlag = process.env['CONNECTOR_MAP_GEOCODING_LAST_TEST_OK'] === 'true';
      return {
        state: passFlag ? 'TEST_PASSED' : 'TEST_FAILED',
        message: passFlag
          ? 'Config validation pass. Live external call gated by activation policy.'
          : 'Test not passed. Set CONNECTOR_MAP_GEOCODING_LAST_TEST_OK=true after verifying endpoint.',
        samplePayloadSchema: passFlag ? { lat: 'number', lng: 'number', formattedAddress: 'string', placeId: 'string' } : undefined,
        checkedAt,
      };
    }
    return { state: 'TEST_FAILED', message: 'Live external call not implemented; configure allowLiveExternalCalls.', checkedAt };
  },

  validateSample(sample: unknown): ConnectorSampleValidationResult {
    if (!sample || typeof sample !== 'object') return { valid: false, errors: ['Sample is not an object.'] };
    const s = sample as Record<string, unknown>;
    const errors: string[] = [];
    if (typeof s['lat'] !== 'number') errors.push('lat must be a number');
    if (typeof s['lng'] !== 'number') errors.push('lng must be a number');
    if (!s['formattedAddress']) errors.push('Missing formattedAddress');
    return { valid: errors.length === 0, errors };
  },

  normalizeSample(sample: unknown): Record<string, unknown> {
    const s = (sample ?? {}) as Record<string, unknown>;
    return {
      lat: s['lat'] ?? null,
      lng: s['lng'] ?? null,
      formattedAddress: s['formattedAddress'] ?? null,
      placeId: s['placeId'] ?? null,
      checkedAt: new Date().toISOString(),
    };
  },
};
