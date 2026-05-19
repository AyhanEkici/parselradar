"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tkgmConnectorExecution = void 0;
const connectorActivationPolicies_1 = require("../config/connectors/connectorActivationPolicies");
const sourceLegalRequirements_1 = require("../config/connectors/sourceLegalRequirements");
exports.tkgmConnectorExecution = {
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
        if (state !== 'READY_FOR_TEST') {
            return { state, message: `Cannot test: connector state is ${state}.`, checkedAt };
        }
        if (!connectorActivationPolicies_1.CONNECTOR_ACTIVATION_POLICIES.allowLiveExternalCalls) {
            const passFlag = process.env['CONNECTOR_TKGM_PARCEL_LAST_TEST_OK'] === 'true';
            return {
                state: passFlag ? 'TEST_PASSED' : 'TEST_FAILED',
                message: passFlag
                    ? 'Config validation pass. Live external call gated by activation policy.'
                    : 'Test not passed. Set CONNECTOR_TKGM_PARCEL_LAST_TEST_OK=true after verifying endpoint.',
                samplePayloadSchema: passFlag ? { parcelId: 'string', city: 'string', area: 'number', zoneCode: 'string' } : undefined,
                checkedAt,
            };
        }
        // Live external call would be performed here in a real integration
        return { state: 'TEST_FAILED', message: 'Live external call not implemented; configure allowLiveExternalCalls.', checkedAt };
    },
    validateSample(sample) {
        if (!sample || typeof sample !== 'object')
            return { valid: false, errors: ['Sample is not an object.'] };
        const s = sample;
        const errors = [];
        if (!s['parcelId'])
            errors.push('Missing parcelId');
        if (!s['city'])
            errors.push('Missing city');
        return { valid: errors.length === 0, errors };
    },
    normalizeSample(sample) {
        const s = (sample ?? {});
        return {
            parcelId: s['parcelId'] ?? null,
            city: s['city'] ?? null,
            district: s['district'] ?? null,
            area: s['area'] ?? null,
            zoneCode: s['zoneCode'] ?? null,
            checkedAt: new Date().toISOString(),
        };
    },
};
