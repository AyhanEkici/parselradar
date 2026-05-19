"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildLegalSourceRegistry = buildLegalSourceRegistry;
const sourceLegalRequirements_1 = require("../../config/connectors/sourceLegalRequirements");
const connectorRegistry_1 = require("../../connectors/connectorRegistry");
function buildLegalSourceRegistry() {
    const connectors = connectorRegistry_1.CONNECTOR_REGISTRY.map((connector) => ({
        connectorKey: connector.key,
        connectorName: connector.name,
        legalRequirementKey: connector.legalRequirementKey,
        legalApproved: (0, sourceLegalRequirements_1.isLegalRequirementApproved)(connector.legalRequirementKey),
        requirement: sourceLegalRequirements_1.SOURCE_LEGAL_REQUIREMENTS[connector.legalRequirementKey],
    }));
    return {
        legalRegistryState: connectors.some((item) => !item.legalApproved) ? 'LEGAL_REVIEW_REQUIRED' : 'READY_FOR_TEST',
        connectors,
    };
}
