"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.municipalityPlanningConnectorExecution = void 0;
const axios_1 = __importDefault(require("axios"));
const connectorActivationPolicies_1 = require("../config/connectors/connectorActivationPolicies");
const sourceLegalRequirements_1 = require("../config/connectors/sourceLegalRequirements");
const planningPayloadNormalizer_1 = require("../services/planning/planningPayloadNormalizer");
function safeJsonParse(input) {
    try {
        return JSON.parse(input);
    }
    catch {
        return null;
    }
}
function normalizeText(input) {
    return String(input || '').trim().toLowerCase();
}
function maskEndpoint(endpoint) {
    try {
        const url = new URL(endpoint);
        return `${url.protocol}//${url.host}${url.pathname}`;
    }
    catch {
        return 'invalid_endpoint';
    }
}
function buildUrl(endpoint, path) {
    const base = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
    const child = path.startsWith('/') ? path : `/${path}`;
    return `${base}${child}`;
}
function defaultRegistry(endpoint) {
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
function loadMunicipalitySourceRegistry(endpoint) {
    const raw = process.env['CONNECTOR_MUNICIPALITY_SOURCE_REGISTRY_JSON'];
    if (!raw)
        return defaultRegistry(endpoint);
    const parsed = safeJsonParse(raw);
    if (!Array.isArray(parsed))
        return defaultRegistry(endpoint);
    const items = parsed
        .filter((item) => item && typeof item === 'object')
        .map((item) => item)
        .map((item) => ({
        key: typeof item.key === 'string' ? item.key : 'unknown_source',
        city: typeof item.city === 'string' ? item.city : 'unknown',
        districts: Array.isArray(item.districts) ? item.districts.filter((d) => typeof d === 'string') : undefined,
        baseUrl: typeof item.baseUrl === 'string' ? item.baseUrl : endpoint,
        healthPath: typeof item.healthPath === 'string' ? item.healthPath : '/health',
        planningPath: typeof item.planningPath === 'string' ? item.planningPath : '/planning',
        legalRequirementKey: typeof item.legalRequirementKey === 'string' ? item.legalRequirementKey : 'municipality_terms',
    }));
    return items.length > 0 ? items : defaultRegistry(endpoint);
}
function matchMunicipalitySource(registry, city, district) {
    const cityNorm = normalizeText(city);
    const districtNorm = normalizeText(district);
    const cityMatches = registry.filter((item) => normalizeText(item.city) === cityNorm);
    if (cityMatches.length === 0)
        return registry[0];
    const districtMatch = cityMatches.find((item) => (item.districts || []).some((d) => normalizeText(d) === districtNorm));
    return districtMatch || cityMatches[0];
}
exports.municipalityPlanningConnectorExecution = {
    key: 'municipality_zoning',
    requiredEnv: ['CONNECTOR_MUNICIPALITY_TOKEN', 'CONNECTOR_MUNICIPALITY_ENDPOINT'],
    legalRequirement: 'municipality_terms',
    status() {
        const endpoint = process.env['CONNECTOR_MUNICIPALITY_ENDPOINT'];
        const token = process.env['CONNECTOR_MUNICIPALITY_TOKEN'];
        if (!endpoint)
            return 'NOT_CONFIGURED';
        if (!token)
            return 'CREDENTIALS_MISSING';
        if (!(0, sourceLegalRequirements_1.isLegalRequirementApproved)('municipality_terms'))
            return 'LEGAL_REVIEW_REQUIRED';
        return 'READY_FOR_TEST';
    },
    async test() {
        const state = this.status();
        const checkedAt = new Date().toISOString();
        const endpoint = process.env['CONNECTOR_MUNICIPALITY_ENDPOINT'] || '';
        if (state !== 'READY_FOR_TEST') {
            return { state, message: `Cannot test: connector state is ${state}.`, checkedAt };
        }
        if (!connectorActivationPolicies_1.CONNECTOR_ACTIVATION_POLICIES.allowLiveExternalCalls) {
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
        if (!(0, sourceLegalRequirements_1.isLegalRequirementApproved)(source.legalRequirementKey)) {
            return {
                state: 'LEGAL_REVIEW_REQUIRED',
                message: `Legal approval required for municipality source: ${source.key}.`,
                checkedAt,
            };
        }
        try {
            await axios_1.default.get(buildUrl(source.baseUrl, source.healthPath || '/health'), {
                timeout: 12000,
                headers: { Authorization: `Bearer ${process.env['CONNECTOR_MUNICIPALITY_TOKEN']}` },
                validateStatus: (code) => code >= 200 && code < 500,
            });
            const response = await axios_1.default.get(buildUrl(source.baseUrl, source.planningPath || '/planning'), {
                timeout: 20000,
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
            const sample = response.data;
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
        }
        catch (err) {
            const code = typeof err?.code === 'string' ? err.code : 'UNKNOWN_ERROR';
            return {
                state: 'TEST_FAILED',
                message: `Connector test failed during controlled call (${code}).`,
                checkedAt,
                samplePayloadSchema: { city: 'string', district: 'string', source: 'string?', layers: 'record?' },
            };
        }
    },
    validateSample(sample) {
        if (!sample || typeof sample !== 'object')
            return { valid: false, errors: ['Sample is not an object.'] };
        const s = sample;
        const errors = [];
        if (typeof s['city'] !== 'string' || !String(s['city']).trim())
            errors.push('Missing city');
        if (typeof s['district'] !== 'string' || !String(s['district']).trim())
            errors.push('Missing district');
        return { valid: errors.length === 0, errors };
    },
    normalizeSample(sample) {
        const s = (sample ?? {});
        const normalized = (0, planningPayloadNormalizer_1.normalizePlanningPayload)(s);
        return {
            connectorKey: 'municipality_zoning',
            city: typeof s.city === 'string' ? s.city : null,
            district: typeof s.district === 'string' ? s.district : null,
            source: typeof s.source === 'string' ? s.source : null,
            planning: normalized,
        };
    },
};
