"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateConnectorCredentials = validateConnectorCredentials;
const connectorCredentialValidator_1 = require("../../connectors/connectorCredentialValidator");
function validateConnectorCredentials(connector) {
    return (0, connectorCredentialValidator_1.connectorCredentialValidator)(connector);
}
