"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeConnectorTestRun = executeConnectorTestRun;
const ConnectorTestRun_1 = __importDefault(require("../../models/ConnectorTestRun"));
const connectorExecutionRegistry_1 = require("../../connectors/connectorExecutionRegistry");
const auditLog_1 = require("../../utils/auditLog");
/**
 * Executes the connector's test() method, stores the result as a ConnectorTestRun record,
 * and logs an audit event. Returns only safe test metadata — no raw secrets or live data.
 */
async function executeConnectorTestRun(params) {
    const { connectorKey, userId, ip } = params;
    const execution = (0, connectorExecutionRegistry_1.findConnectorExecution)(connectorKey);
    if (!execution) {
        return {
            success: false,
            error: `Connector not found: ${connectorKey}`,
        };
    }
    const outcome = await execution.test();
    // Only store result if it's a conclusive test pass or fail
    const isStorable = outcome.state === 'TEST_PASSED' || outcome.state === 'TEST_FAILED';
    let testRunId;
    if (isStorable) {
        const record = await ConnectorTestRun_1.default.create({
            connectorKey,
            state: outcome.state,
            message: outcome.message,
            samplePayloadSchema: outcome.samplePayloadSchema,
            checkedAt: new Date(),
            runByUserId: userId,
        });
        testRunId = record._id?.toString();
    }
    await (0, auditLog_1.logAuditEvent)({
        type: 'connector_test_run',
        actorUserId: userId,
        targetType: 'Connector',
        targetId: connectorKey,
        message: `Connector test run: ${connectorKey} → ${outcome.state}`,
        metadata: { connectorKey, state: outcome.state, testRunId },
        ip,
        success: outcome.state === 'TEST_PASSED',
    });
    return {
        success: true,
        connectorKey,
        state: outcome.state,
        message: outcome.message,
        samplePayloadSchema: outcome.samplePayloadSchema,
        checkedAt: outcome.checkedAt,
        testRunId,
    };
}
