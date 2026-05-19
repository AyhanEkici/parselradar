"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.demographicConnectorExecution = void 0;
const connectorActivationPolicies_1 = require("../config/connectors/connectorActivationPolicies");
const sourceLegalRequirements_1 = require("../config/connectors/sourceLegalRequirements");
exports.demographicConnectorExecution = {
    key: 'demographic_feed',
    requiredEnv: ['CONNECTOR_DEMOGRAPHIC_API_KEY', 'CONNECTOR_DEMOGRAPHIC_ENDPOINT'],
    legalRequirement: 'demographic_feed_terms',
    status() {
        const endpoint = process.env['CONNECTOR_DEMOGRAPHIC_ENDPOINT'];
        const apiKey = process.env['CONNECTOR_DEMOGRAPHIC_API_KEY'];
        if (!endpoint)
            return 'NOT_CONFIGURED';
        if (!apiKey)
            return 'CREDENTIALS_MISSING';
        if (!(0, sourceLegalRequirements_1.isLegalRequirementApproved)('demographic_feed_terms'))
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
            const passFlag = process.env['CONNECTOR_DEMOGRAPHIC_FEED_LAST_TEST_OK'] === 'true';
            return {
                state: passFlag ? 'TEST_PASSED' : 'TEST_FAILED',
                message: passFlag
                    ? 'Config validation pass. Live external call gated by activation policy.'
                    : 'Test not passed. Set CONNECTOR_DEMOGRAPHIC_FEED_LAST_TEST_OK=true after verifying endpoint.',
                samplePayloadSchema: passFlag ? { district: 'string', population: 'number', incomeLevel: 'string', growthRate: 'number' } : undefined,
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
        if (!s['district'])
            errors.push('Missing district');
        if (typeof s['population'] !== 'number')
            errors.push('population must be a number');
        return { valid: errors.length === 0, errors };
    },
    normalizeSample(sample) {
        const s = (sample ?? {});
        return {
            district: s['district'] ?? null,
            population: s['population'] ?? null,
            incomeLevel: s['incomeLevel'] ?? null,
            growthRate: s['growthRate'] ?? null,
            checkedAt: new Date().toISOString(),
        };
    },
};
