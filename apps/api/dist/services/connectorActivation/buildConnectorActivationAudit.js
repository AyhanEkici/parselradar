"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildConnectorActivationAudit = buildConnectorActivationAudit;
const ConnectorActivationRecord_1 = __importDefault(require("../../models/ConnectorActivationRecord"));
const ConnectorTestRun_1 = __importDefault(require("../../models/ConnectorTestRun"));
/**
 * Returns an audit history for a specific connector composed from:
 * - ConnectorTestRun records (chronological)
 * - ConnectorActivationRecord records (chronological)
 */
async function buildConnectorActivationAudit(connectorKey) {
    const [testRuns, activationRecords] = await Promise.all([
        ConnectorTestRun_1.default.find({ connectorKey }).sort({ checkedAt: -1 }).limit(50).lean(),
        ConnectorActivationRecord_1.default.find({ connectorKey }).sort({ createdAt: -1 }).limit(50).lean(),
    ]);
    return {
        connectorKey,
        generatedAt: new Date().toISOString(),
        testRuns: testRuns.map((r) => ({
            id: r._id?.toString(),
            state: r.state,
            message: r.message,
            samplePayloadSchema: r.samplePayloadSchema,
            checkedAt: r.checkedAt,
            runByUserId: r.runByUserId,
        })),
        activationRecords: activationRecords.map((r) => ({
            id: r._id?.toString(),
            state: r.state,
            activatedAt: r.activatedAt,
            activatedByUserId: r.activatedByUserId,
            deactivatedAt: r.deactivatedAt,
            deactivatedByUserId: r.deactivatedByUserId,
            testRunId: r.testRunId,
            createdAt: r.createdAt,
        })),
    };
}
