"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runConnectorHealthCheck = runConnectorHealthCheck;
const connectorTestRunner_1 = require("../../connectors/connectorTestRunner");
async function runConnectorHealthCheck(connector) {
    const testResult = await (0, connectorTestRunner_1.connectorTestRunner)(connector);
    return {
        connectorKey: connector.key,
        testResult,
    };
}
