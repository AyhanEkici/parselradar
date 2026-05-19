"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateConnectorSamplePayload = validateConnectorSamplePayload;
const connectorExecutionRegistry_1 = require("../../connectors/connectorExecutionRegistry");
/**
 * Validates a sample payload against the connector's expected schema.
 * Used after a test run to confirm the shape of sample data.
 * Does not perform any live calls.
 */
function validateConnectorSamplePayload(params) {
    const { connectorKey, sample } = params;
    const execution = (0, connectorExecutionRegistry_1.findConnectorExecution)(connectorKey);
    if (!execution) {
        return { valid: false, errors: [`Connector not found: ${connectorKey}`] };
    }
    return execution.validateSample(sample);
}
