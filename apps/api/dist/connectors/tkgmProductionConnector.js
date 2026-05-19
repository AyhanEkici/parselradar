"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tkgmProductionConnectorExecution = void 0;
const axios_1 = __importDefault(require("axios"));
const connectorActivationPolicies_1 = require("../config/connectors/connectorActivationPolicies");
const sourceLegalRequirements_1 = require("../config/connectors/sourceLegalRequirements");
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
exports.tkgmProductionConnectorExecution = {
    key: 'tkgm_parcel',
    requiredEnv: ['CONNECTOR_TKGM_API_KEY', 'CONNECTOR_TKGM_ENDPOINT'],
    legalRequirement: 'tkgm_license',
    status() {
        const endpoint = process.env['CONNECTOR_TKGM_ENDPOINT'];
        const apiKey = process.env['CONNECTOR_TKGM_API_KEY'];
        if (!endpoint)
            return 'NOT_CONFIGURED';
        if (!apiKey)
            return 'CREDENTIALS_MISSING';
        if (!(0, sourceLegalRequirements_1.isLegalRequirementApproved)('tkgm_license'))
            return 'LEGAL_REVIEW_REQUIRED';
        return 'READY_FOR_TEST';
    },
    async test() {
        const state = this.status();
        const checkedAt = new Date().toISOString();
        const endpoint = process.env['CONNECTOR_TKGM_ENDPOINT'] || '';
        if (state !== 'READY_FOR_TEST') {
            return { state, message: `Cannot test: connector state is ${state}.`, checkedAt };
        }
        if (!connectorActivationPolicies_1.CONNECTOR_ACTIVATION_POLICIES.allowLiveExternalCalls) {
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
            await axios_1.default.get(buildUrl(endpoint, healthPath), {
                timeout: 12000,
                headers: {
                    Authorization: `Bearer ${process.env['CONNECTOR_TKGM_API_KEY']}`,
                },
                validateStatus: (code) => code >= 200 && code < 500,
            });
            // 2) Controlled test call (no secrets in logs/outputs)
            const response = await axios_1.default.get(buildUrl(endpoint, queryPath), {
                timeout: 20000,
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
            const sample = response.data;
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
        }
        catch (err) {
            const code = typeof err?.code === 'string' ? err.code : 'UNKNOWN_ERROR';
            return {
                state: 'TEST_FAILED',
                message: `Connector test failed during controlled call (${code}).`,
                checkedAt,
                samplePayloadSchema: { parcelId: 'string', city: 'string?', district: 'string?', area: 'number?', zoneCode: 'string?' },
            };
        }
    },
    validateSample(sample) {
        if (!sample || typeof sample !== 'object')
            return { valid: false, errors: ['Sample is not an object.'] };
        const s = sample;
        const errors = [];
        if (typeof s['parcelId'] !== 'string' || !String(s['parcelId']).trim())
            errors.push('Missing parcelId');
        return { valid: errors.length === 0, errors };
    },
    normalizeSample(sample) {
        const s = (sample ?? {});
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
