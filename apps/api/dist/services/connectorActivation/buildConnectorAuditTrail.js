"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildConnectorAuditTrail = buildConnectorAuditTrail;
const AuditEvent_1 = __importDefault(require("../../models/AuditEvent"));
const connectorRegistry_1 = require("../../connectors/connectorRegistry");
async function buildConnectorAuditTrail() {
    const regex = connectorRegistry_1.CONNECTOR_REGISTRY.map((c) => c.key).join('|');
    const audits = await AuditEvent_1.default.find({
        $or: [
            { type: { $regex: 'connector', $options: 'i' } },
            { message: { $regex: regex || 'connector', $options: 'i' } },
        ],
    })
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();
    return {
        generatedAt: new Date().toISOString(),
        count: audits.length,
        items: audits,
    };
}
