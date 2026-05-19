"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.municipalityConnectorExecution = void 0;
const connectorActivationPolicies_1 = require("../config/connectors/connectorActivationPolicies");
const sourceLegalRequirements_1 = require("../config/connectors/sourceLegalRequirements");
exports.municipalityConnectorExecution = {
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
        if (state !== 'READY_FOR_TEST') {
            return { state, message: `Cannot test: connector state is ${state}.`, checkedAt };
        }
        if (!connectorActivationPolicies_1.CONNECTOR_ACTIVATION_POLICIES.allowLiveExternalCalls) {
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
    validateSample(sample) {
        if (!sample || typeof sample !== 'object')
            return { valid: false, errors: ['Sample is not an object.'] };
        const s = sample;
        const errors = [];
        if (!s['city'])
            errors.push('Missing city');
        if (!s['zoneType'])
            errors.push('Missing zoneType');
        return { valid: errors.length === 0, errors };
    },
    normalizeSample(sample) {
        const s = (sample ?? {});
        return {
            city: s['city'] ?? null,
            district: s['district'] ?? null,
            zoneType: s['zoneType'] ?? null,
            planCode: s['planCode'] ?? null,
            checkedAt: new Date().toISOString(),
        };
    },
};
