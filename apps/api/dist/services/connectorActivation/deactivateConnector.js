"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivateConnector = deactivateConnector;
const ConnectorActivationRecord_1 = __importDefault(require("../../models/ConnectorActivationRecord"));
const auditLog_1 = require("../../utils/auditLog");
/**
 * Deactivates an ACTIVE connector by writing a DISABLED activation record.
 * Does not delete previous activation records (append-only audit trail).
 */
async function deactivateConnector(params) {
    const { connectorKey, userId, ip } = params;
    const latestRecord = await ConnectorActivationRecord_1.default.findOne({ connectorKey })
        .sort({ createdAt: -1 })
        .lean();
    if (!latestRecord || latestRecord.state !== 'ACTIVE') {
        return { deactivated: false, reason: 'Connector is not currently ACTIVE.' };
    }
    const record = await ConnectorActivationRecord_1.default.create({
        connectorKey,
        state: 'DISABLED',
        deactivatedAt: new Date(),
        deactivatedByUserId: userId,
    });
    await (0, auditLog_1.logAuditEvent)({
        type: 'connector_deactivated',
        actorUserId: userId,
        targetType: 'Connector',
        targetId: connectorKey,
        message: `Connector deactivated: ${connectorKey}`,
        metadata: { connectorKey, deactivationRecordId: record._id?.toString() },
        ip,
        success: true,
    });
    return {
        deactivated: true,
        connectorKey,
        deactivationRecordId: record._id?.toString(),
        deactivatedAt: record.deactivatedAt,
    };
}
