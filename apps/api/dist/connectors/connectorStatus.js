"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectorStatus = connectorStatus;
const sourceLegalRequirements_1 = require("../config/connectors/sourceLegalRequirements");
const connectorCredentialValidator_1 = require("./connectorCredentialValidator");
function connectorStatus(connector) {
    const credentialStatus = (0, connectorCredentialValidator_1.connectorCredentialValidator)(connector);
    const legalApproved = (0, sourceLegalRequirements_1.isLegalRequirementApproved)(connector.legalRequirementKey);
    const markedActive = connector.activeEnvKey ? process.env[connector.activeEnvKey] === 'true' : false;
    let state = 'NOT_CONFIGURED';
    if (!credentialStatus.endpointConfigured) {
        state = 'NOT_CONFIGURED';
    }
    else if (!credentialStatus.credentialsConfigured) {
        state = 'CREDENTIALS_MISSING';
    }
    else if (!legalApproved) {
        state = 'LEGAL_REVIEW_REQUIRED';
    }
    else {
        state = 'READY_FOR_TEST';
    }
    if (markedActive && state === 'READY_FOR_TEST') {
        state = 'ACTIVE';
    }
    if (process.env[`CONNECTOR_${connector.key.toUpperCase()}_DISABLED`] === 'true') {
        state = 'DISABLED';
    }
    return {
        connectorKey: connector.key,
        state,
        credentialStatus,
        legalApproved,
        markedActive,
    };
}
