"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectorCredentialValidator = connectorCredentialValidator;
function connectorCredentialValidator(connector) {
    const missingCredentialKeys = connector.credentialEnvKeys.filter((key) => !process.env[key]);
    const endpointConfigured = connector.endpointEnvKey ? Boolean(process.env[connector.endpointEnvKey]) : true;
    return {
        credentialKeys: connector.credentialEnvKeys,
        missingCredentialKeys,
        credentialsConfigured: missingCredentialKeys.length === 0,
        endpointConfigured,
    };
}
