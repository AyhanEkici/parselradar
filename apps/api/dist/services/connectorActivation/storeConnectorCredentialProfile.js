"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeConnectorCredentialProfile = storeConnectorCredentialProfile;
const ConnectorCredentialProfile_1 = __importDefault(require("../../models/ConnectorCredentialProfile"));
const auditLog_1 = require("../../utils/auditLog");
/**
 * Stores a credential presence mask for a connector.
 * SECURITY: presentKeys must be the names of env vars that are present, never actual values.
 * Raw secrets must never be passed into this function.
 */
async function storeConnectorCredentialProfile(params) {
    const { connectorKey, presentKeys, allRequiredKeys, userId, ip } = params;
    // Build boolean presence map — never store values
    const maskedKeys = {};
    for (const key of allRequiredKeys) {
        maskedKeys[key] = presentKeys.includes(key);
    }
    await ConnectorCredentialProfile_1.default.findOneAndUpdate({ connectorKey }, { connectorKey, maskedKeys, updatedAt: new Date(), updatedByUserId: userId }, { upsert: true, new: true });
    await (0, auditLog_1.logAuditEvent)({
        type: 'connector_credential_profile_updated',
        actorUserId: userId,
        targetType: 'Connector',
        targetId: connectorKey,
        message: `Credential presence profile updated for connector: ${connectorKey}`,
        metadata: { connectorKey, presentCount: presentKeys.length, totalRequired: allRequiredKeys.length },
        ip,
        success: true,
    });
    return { connectorKey, maskedKeys, updatedAt: new Date().toISOString() };
}
