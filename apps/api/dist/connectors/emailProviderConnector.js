"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailProviderConnectorExecution = void 0;
const connectorActivationPolicies_1 = require("../config/connectors/connectorActivationPolicies");
const sourceLegalRequirements_1 = require("../config/connectors/sourceLegalRequirements");
exports.emailProviderConnectorExecution = {
    key: 'email_provider',
    requiredEnv: ['NOTIFY_SMTP_HOST', 'NOTIFY_SMTP_USER', 'NOTIFY_SMTP_PASS', 'NOTIFY_EMAIL_FROM'],
    legalRequirement: 'email_provider_terms',
    status() {
        const host = process.env['NOTIFY_SMTP_HOST'];
        const user = process.env['NOTIFY_SMTP_USER'];
        const pass = process.env['NOTIFY_SMTP_PASS'];
        const from = process.env['NOTIFY_EMAIL_FROM'];
        if (!host)
            return 'NOT_CONFIGURED';
        if (!user || !pass || !from)
            return 'CREDENTIALS_MISSING';
        if (!(0, sourceLegalRequirements_1.isLegalRequirementApproved)('email_provider_terms'))
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
            const passFlag = process.env['CONNECTOR_EMAIL_PROVIDER_LAST_TEST_OK'] === 'true';
            return {
                state: passFlag ? 'TEST_PASSED' : 'TEST_FAILED',
                message: passFlag
                    ? 'Config validation pass. Live SMTP call gated by activation policy.'
                    : 'Test not passed. Set CONNECTOR_EMAIL_PROVIDER_LAST_TEST_OK=true after verifying SMTP credentials.',
                samplePayloadSchema: passFlag ? { messageId: 'string', accepted: 'string[]', rejected: 'string[]' } : undefined,
                checkedAt,
            };
        }
        return { state: 'TEST_FAILED', message: 'Live SMTP call not implemented; configure allowLiveExternalCalls.', checkedAt };
    },
    validateSample(sample) {
        if (!sample || typeof sample !== 'object')
            return { valid: false, errors: ['Sample is not an object.'] };
        const s = sample;
        const errors = [];
        if (!s['messageId'])
            errors.push('Missing messageId');
        return { valid: errors.length === 0, errors };
    },
    normalizeSample(sample) {
        const s = (sample ?? {});
        return {
            messageId: s['messageId'] ?? null,
            accepted: s['accepted'] ?? [],
            rejected: s['rejected'] ?? [],
            checkedAt: new Date().toISOString(),
        };
    },
};
