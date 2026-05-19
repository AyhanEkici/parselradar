"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectorTestRunner = connectorTestRunner;
const connectorStatus_1 = require("./connectorStatus");
const connectorActivationPolicies_1 = require("../config/connectors/connectorActivationPolicies");
async function connectorTestRunner(connector) {
    const status = (0, connectorStatus_1.connectorStatus)(connector);
    if (status.state === 'NOT_CONFIGURED') {
        return {
            connectorKey: connector.key,
            state: 'NOT_CONFIGURED',
            message: 'Endpoint is not configured for this connector.',
            checkedAt: new Date().toISOString(),
            details: status,
        };
    }
    if (status.state === 'CREDENTIALS_MISSING') {
        return {
            connectorKey: connector.key,
            state: 'TEST_FAILED',
            message: 'Credential requirements are missing; connector test cannot proceed.',
            checkedAt: new Date().toISOString(),
            details: status,
        };
    }
    if (status.state === 'LEGAL_REVIEW_REQUIRED') {
        return {
            connectorKey: connector.key,
            state: 'TEST_FAILED',
            message: 'Legal review is required before testing this connector.',
            checkedAt: new Date().toISOString(),
            details: status,
        };
    }
    if (!connectorActivationPolicies_1.CONNECTOR_ACTIVATION_POLICIES.allowLiveExternalCalls) {
        return {
            connectorKey: connector.key,
            state: 'TEST_FAILED',
            message: 'Live external test calls are disabled by activation policy.',
            checkedAt: new Date().toISOString(),
            details: {
                ...status,
                allowLiveExternalCalls: false,
            },
        };
    }
    const explicitPassFlag = process.env[`CONNECTOR_${connector.key.toUpperCase()}_LAST_TEST_OK`] === 'true';
    const testState = explicitPassFlag ? 'TEST_PASSED' : 'TEST_FAILED';
    return {
        connectorKey: connector.key,
        state: testState,
        message: explicitPassFlag
            ? 'Connector test flag indicates pass under active test mode.'
            : 'Connector test flag indicates failure under active test mode.',
        checkedAt: new Date().toISOString(),
        details: {
            ...status,
            explicitPassFlag,
            mode: 'active_test_mode_without_real_external_call',
        },
    };
}
