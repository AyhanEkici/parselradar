"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildConnectorReadiness = buildConnectorReadiness;
const connectorRegistry_1 = require("../../connectors/connectorRegistry");
const connectorStatus_1 = require("../../connectors/connectorStatus");
function buildConnectorReadiness() {
    const connectors = connectorRegistry_1.CONNECTOR_REGISTRY.map((connector) => {
        const status = (0, connectorStatus_1.connectorStatus)(connector);
        return {
            key: connector.key,
            name: connector.name,
            category: connector.category,
            state: status.state,
            credentialStatus: status.credentialStatus,
            legalApproved: status.legalApproved,
            markedActive: status.markedActive,
        };
    });
    return {
        connectors,
        summary: {
            total: connectors.length,
            active: connectors.filter((c) => c.state === 'ACTIVE').length,
            readyForTest: connectors.filter((c) => c.state === 'READY_FOR_TEST').length,
            failedOrMissing: connectors.filter((c) => ['NOT_CONFIGURED', 'CREDENTIALS_MISSING', 'LEGAL_REVIEW_REQUIRED', 'DISABLED'].includes(c.state)).length,
        },
        generatedAt: new Date().toISOString(),
    };
}
