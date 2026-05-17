import axios from 'axios';
import { CONNECTOR_ACTIVATION_POLICIES } from '../config/connectors/connectorActivationPolicies';
import { isLegalRequirementApproved } from '../config/connectors/sourceLegalRequirements';
import {
  ConnectorExecutionContract,
  ConnectorSampleValidationResult,
  ConnectorState,
  ConnectorTestOutcome,
} from './connectorContracts';

type TkgmSample = {
  parcelId: string;
  city?: string;
  district?: string;
  area?: number;
  zoneCode?: string;
};

function maskEndpoint(endpoint: string): string {
  try {
    const url = new URL(endpoint);
    return `${url.protocol}//${url.host}${url.pathname}`;
  } catch {
    return 'invalid_endpoint';
  }
}

function buildUrl(endpoint: string, path: string): string {
  const base = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
  const child = path.startsWith('/') ? path : `/${path}`;
  return `${base}${child}`;
}

export const tkgmProductionConnectorExecution: ConnectorExecutionContract = {
  key: 'tkgm_parcel',
  requiredEnv: ['CONNECTOR_TKGM_API_KEY', 'CONNECTOR_TKGM_ENDPOINT'],
  legalRequirement: 'tkgm_license',

  status(): ConnectorState {
    const endpoint = process.env['CONNECTOR_TKGM_ENDPOINT'];
    const apiKey = process.env['CONNECTOR_TKGM_API_KEY'];
    if (!endpoint) return 'NOT_CONFIGURED';
    if (!apiKey) return 'CREDENTIALS_MISSING';
    if (!isLegalRequirementApproved('tkgm_license')) return 'LEGAL_REVIEW_REQUIRED';
    return 'READY_FOR_TEST';
  },

  async test(): Promise<ConnectorTestOutcome> {
    const state = this.status();
    const checkedAt = new Date().toISOString();
    const endpoint = process.env['CONNECTOR_TKGM_ENDPOINT'] || '';

    if (state !== 'READY_FOR_TEST') {
      return { state, message: `Cannot test: connector state is ${state}.`, checkedAt };
    }

    if (!CONNECTOR_ACTIVATION_POLICIES.allowLiveExternalCalls) {
      return {
        state: 'READY_FOR_TEST',
        message: 'Live external calls are disabled (CONNECTOR_TEST_MODE!=active). No health check or test run performed.',
        checkedAt,
      };
    }

    const parcelId = process.env['CONNECTOR_TKGM_SAMPLE_PARCEL_ID'] || '';
    if (!parcelId) {
      return {
        state: 'TEST_FAILED',
        message: 'Missing CONNECTOR_TKGM_SAMPLE_PARCEL_ID for controlled test run.',
        checkedAt,
        samplePayloadSchema: { parcelId: 'string', city: 'string?', district: 'string?', area: 'number?', zoneCode: 'string?' },
      };
    }

    const healthPath = process.env['CONNECTOR_TKGM_HEALTH_PATH'] || '/health';
    const queryPath = process.env['CONNECTOR_TKGM_PARCEL_QUERY_PATH'] || '/parcel';

    try {
      // 1) Health check
      await axios.get(buildUrl(endpoint, healthPath), {
        timeout: 12_000,
        headers: {
          Authorization: `Bearer ${process.env['CONNECTOR_TKGM_API_KEY']}`,
        },
        validateStatus: (code) => code >= 200 && code < 500,
      });

      // 2) Controlled test call (no secrets in logs/outputs)
      const response = await axios.get(buildUrl(endpoint, queryPath), {
        timeout: 20_000,
        params: { parcelId },
        headers: {
          Authorization: `Bearer ${process.env['CONNECTOR_TKGM_API_KEY']}`,
        },
        validateStatus: (code) => code >= 200 && code < 500,
      });

      if (response.status !== 200) {
        return {
          state: 'TEST_FAILED',
          message: `Endpoint returned non-200 (${response.status}) during controlled test call.`,
          checkedAt,
          samplePayloadSchema: { parcelId: 'string', city: 'string?', district: 'string?', area: 'number?', zoneCode: 'string?' },
        };
      }

      const sample = response.data as unknown;
      const validation = this.validateSample(sample);
      if (!validation.valid) {
        return {
          state: 'TEST_FAILED',
          message: `Sample payload validation failed: ${validation.errors.join('; ')}`,
          checkedAt,
          samplePayloadSchema: { parcelId: 'string', city: 'string?', district: 'string?', area: 'number?', zoneCode: 'string?' },
        };
      }

      return {
        state: 'TEST_PASSED',
        message: `Health check and controlled test call succeeded against ${maskEndpoint(endpoint)}.`,
        checkedAt,
        samplePayloadSchema: { parcelId: 'string', city: 'string?', district: 'string?', area: 'number?', zoneCode: 'string?' },
      };
    } catch (err: any) {
      const code = typeof err?.code === 'string' ? err.code : 'UNKNOWN_ERROR';
      return {
        state: 'TEST_FAILED',
        message: `Connector test failed during controlled call (${code}).`,
        checkedAt,
        samplePayloadSchema: { parcelId: 'string', city: 'string?', district: 'string?', area: 'number?', zoneCode: 'string?' },
      };
    }
  },

  validateSample(sample: unknown): ConnectorSampleValidationResult {
    if (!sample || typeof sample !== 'object') return { valid: false, errors: ['Sample is not an object.'] };
    const s = sample as Record<string, unknown>;
    const errors: string[] = [];
    if (typeof s['parcelId'] !== 'string' || !String(s['parcelId']).trim()) errors.push('Missing parcelId');
    return { valid: errors.length === 0, errors };
  },

  normalizeSample(sample: unknown): Record<string, unknown> {
    const s = (sample ?? {}) as Partial<TkgmSample> & Record<string, unknown>;
    return {
      connectorKey: 'tkgm_parcel',
      parcelId: typeof s.parcelId === 'string' ? s.parcelId : null,
      city: typeof s.city === 'string' ? s.city : null,
      district: typeof s.district === 'string' ? s.district : null,
      area: typeof s.area === 'number' ? s.area : null,
      zoneCode: typeof s.zoneCode === 'string' ? s.zoneCode : null,
    };
  },
};

