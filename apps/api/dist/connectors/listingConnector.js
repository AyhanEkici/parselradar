"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listingConnectorExecution = void 0;
const connectorActivationPolicies_1 = require("../config/connectors/connectorActivationPolicies");
const sourceLegalRequirements_1 = require("../config/connectors/sourceLegalRequirements");
exports.listingConnectorExecution = {
    key: 'listing_feed',
    requiredEnv: ['CONNECTOR_LISTING_API_KEY', 'CONNECTOR_LISTING_ENDPOINT'],
    legalRequirement: 'listing_feed_terms',
    status() {
        const endpoint = process.env['CONNECTOR_LISTING_ENDPOINT'];
        const apiKey = process.env['CONNECTOR_LISTING_API_KEY'];
        if (!endpoint)
            return 'NOT_CONFIGURED';
        if (!apiKey)
            return 'CREDENTIALS_MISSING';
        if (!(0, sourceLegalRequirements_1.isLegalRequirementApproved)('listing_feed_terms'))
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
    validateSample(sample) {
        if (!sample || typeof sample !== 'object')
            return { valid: false, errors: ['Sample is not an object.'] };
        const s = sample;
        const errors = [];
        if (!s['listingId'])
            errors.push('Missing listingId');
        if (typeof s['price'] !== 'number')
            errors.push('price must be a number');
        return { valid: errors.length === 0, errors };
    },
    normalizeSample(sample) {
        const s = (sample ?? {});
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
