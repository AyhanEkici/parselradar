import axios from 'axios';
import { CONNECTOR_ACTIVATION_POLICIES } from '../config/connectors/connectorActivationPolicies';
import { isLegalRequirementApproved } from '../config/connectors/sourceLegalRequirements';
import { normalizePlanningPayload } from '../services/planning/planningPayloadNormalizer';
import {
  ConnectorExecutionContract,
  ConnectorSampleValidationResult,
  ConnectorState,
  ConnectorTestOutcome,
} from './connectorContracts';

type MunicipalityPlanningLayer = {
  available: boolean;
  layerName?: string;
  source?: string;
  note?: string;
};

type MunicipalityPlanningSample = {
  city: string;
  district: string;
  source?: string;
  layers?: Record<string, MunicipalityPlanningLayer>;
};

type MunicipalitySourceRegistryItem = {
  key: string;
  city: string;
  districts?: string[];
  baseUrl: string;
  healthPath?: string;
  planningPath?: string;
  legalRequirementKey: string;
};

function safeJsonParse(input: string): unknown {
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}

function normalizeText(input: string): string {
  return String(input || '').trim().toLowerCase();
}

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

function defaultRegistry(endpoint: string): MunicipalitySourceRegistryItem[] {
  return [
    {
      key: 'default_municipality',
      city: 'unknown',
      baseUrl: endpoint,
      healthPath: '/health',
      planningPath: '/planning',
      legalRequirementKey: 'municipality_terms',
    },
  ];
}

function loadMunicipalitySourceRegistry(endpoint: string): MunicipalitySourceRegistryItem[] {
  const raw = process.env['CONNECTOR_MUNICIPALITY_SOURCE_REGISTRY_JSON'];
  if (!raw) return defaultRegistry(endpoint);
  const parsed = safeJsonParse(raw);
  if (!Array.isArray(parsed)) return defaultRegistry(endpoint);

  const items = parsed
    .filter((item) => item && typeof item === 'object')
    .map((item) => item as any)
    .map(
      (item): MunicipalitySourceRegistryItem => ({
        key: typeof item.key === 'string' ? item.key : 'unknown_source',
        city: typeof item.city === 'string' ? item.city : 'unknown',
        districts: Array.isArray(item.districts) ? item.districts.filter((d: any) => typeof d === 'string') : undefined,
        baseUrl: typeof item.baseUrl === 'string' ? item.baseUrl : endpoint,
        healthPath: typeof item.healthPath === 'string' ? item.healthPath : '/health',
        planningPath: typeof item.planningPath === 'string' ? item.planningPath : '/planning',
        legalRequirementKey: typeof item.legalRequirementKey === 'string' ? item.legalRequirementKey : 'municipality_terms',
      }),
    );

  return items.length > 0 ? items : defaultRegistry(endpoint);
}

function matchMunicipalitySource(registry: MunicipalitySourceRegistryItem[], city: string, district: string): MunicipalitySourceRegistryItem {
  const cityNorm = normalizeText(city);
  const districtNorm = normalizeText(district);
  const cityMatches = registry.filter((item) => normalizeText(item.city) === cityNorm);
  if (cityMatches.length === 0) return registry[0];
  const districtMatch = cityMatches.find((item) => (item.districts || []).some((d) => normalizeText(d) === districtNorm));
  return districtMatch || cityMatches[0];
}

export const municipalityPlanningConnectorExecution: ConnectorExecutionContract = {
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
    const endpoint = process.env['CONNECTOR_MUNICIPALITY_ENDPOINT'] || '';

    if (state !== 'READY_FOR_TEST') {
      return { state, message: `Cannot test: connector state is ${state}.`, checkedAt };
    }

    if (!CONNECTOR_ACTIVATION_POLICIES.allowLiveExternalCalls) {
      return {
        state: 'READY_FOR_TEST',
        message: 'Live external calls are disabled (CONNECTOR_TEST_MODE!=active). No municipality health check or planning query performed.',
        checkedAt,
      };
    }

    const city = process.env['CONNECTOR_MUNICIPALITY_SAMPLE_CITY'] || '';
    const district = process.env['CONNECTOR_MUNICIPALITY_SAMPLE_DISTRICT'] || '';
    if (!city || !district) {
      return {
        state: 'TEST_FAILED',
        message: 'Missing CONNECTOR_MUNICIPALITY_SAMPLE_CITY or CONNECTOR_MUNICIPALITY_SAMPLE_DISTRICT for controlled test run.',
        checkedAt,
        samplePayloadSchema: { city: 'string', district: 'string', source: 'string?', layers: 'record?' },
      };
    }

    const registry = loadMunicipalitySourceRegistry(endpoint);
    const source = matchMunicipalitySource(registry, city, district);

    if (!isLegalRequirementApproved(source.legalRequirementKey)) {
      return {
        state: 'LEGAL_REVIEW_REQUIRED',
        message: `Legal approval required for municipality source: ${source.key}.`,
        checkedAt,
      };
    }

    try {
      await axios.get(buildUrl(source.baseUrl, source.healthPath || '/health'), {
        timeout: 12_000,
        headers: { Authorization: `Bearer ${process.env['CONNECTOR_MUNICIPALITY_TOKEN']}` },
        validateStatus: (code) => code >= 200 && code < 500,
      });

      const response = await axios.get(buildUrl(source.baseUrl, source.planningPath || '/planning'), {
        timeout: 20_000,
        params: { city, district },
        headers: { Authorization: `Bearer ${process.env['CONNECTOR_MUNICIPALITY_TOKEN']}` },
        validateStatus: (code) => code >= 200 && code < 500,
      });

      if (response.status !== 200) {
        return {
          state: 'TEST_FAILED',
          message: `Endpoint returned non-200 (${response.status}) during controlled planning query.`,
          checkedAt,
          samplePayloadSchema: { city: 'string', district: 'string', source: 'string?', layers: 'record?' },
        };
      }

      const sample = response.data as unknown;
      const validation = this.validateSample(sample);
      if (!validation.valid) {
        return {
          state: 'TEST_FAILED',
          message: `Sample payload validation failed: ${validation.errors.join('; ')}`,
          checkedAt,
          samplePayloadSchema: { city: 'string', district: 'string', source: 'string?', layers: 'record?' },
        };
      }

      return {
        state: 'TEST_PASSED',
        message: `Health check and planning query succeeded against ${maskEndpoint(source.baseUrl)} (source=${source.key}).`,
        checkedAt,
        samplePayloadSchema: { city: 'string', district: 'string', source: 'string?', layers: 'record?' },
      };
    } catch (err: any) {
      const code = typeof err?.code === 'string' ? err.code : 'UNKNOWN_ERROR';
      return {
        state: 'TEST_FAILED',
        message: `Connector test failed during controlled call (${code}).`,
        checkedAt,
        samplePayloadSchema: { city: 'string', district: 'string', source: 'string?', layers: 'record?' },
      };
    }
  },

  validateSample(sample: unknown): ConnectorSampleValidationResult {
    if (!sample || typeof sample !== 'object') return { valid: false, errors: ['Sample is not an object.'] };
    const s = sample as Record<string, unknown>;
    const errors: string[] = [];
    if (typeof s['city'] !== 'string' || !String(s['city']).trim()) errors.push('Missing city');
    if (typeof s['district'] !== 'string' || !String(s['district']).trim()) errors.push('Missing district');
    return { valid: errors.length === 0, errors };
  },

  normalizeSample(sample: unknown): Record<string, unknown> {
    const s = (sample ?? {}) as Partial<MunicipalityPlanningSample> & Record<string, unknown>;
    const normalized = normalizePlanningPayload(s);
    return {
      connectorKey: 'municipality_zoning',
      city: typeof s.city === 'string' ? s.city : null,
      district: typeof s.district === 'string' ? s.district : null,
      source: typeof s.source === 'string' ? s.source : null,
      planning: normalized,
    };
  },
};

