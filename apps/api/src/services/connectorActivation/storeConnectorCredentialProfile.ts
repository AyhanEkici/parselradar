import ConnectorCredentialProfile from '../../models/ConnectorCredentialProfile';
import { logAuditEvent } from '../../utils/auditLog';

/**
 * Stores a credential presence mask for a connector.
 * SECURITY: presentKeys must be the names of env vars that are present, never actual values.
 * Raw secrets must never be passed into this function.
 */
export async function storeConnectorCredentialProfile(params: {
  connectorKey: string;
  presentKeys: string[];
  allRequiredKeys: string[];
  userId: string;
  ip?: string;
}) {
  const { connectorKey, presentKeys, allRequiredKeys, userId, ip } = params;

  // Build boolean presence map — never store values
  const maskedKeys: Record<string, boolean> = {};
  for (const key of allRequiredKeys) {
    maskedKeys[key] = presentKeys.includes(key);
  }

  await ConnectorCredentialProfile.findOneAndUpdate(
    { connectorKey },
    { connectorKey, maskedKeys, updatedAt: new Date(), updatedByUserId: userId },
    { upsert: true, new: true },
  );

  await logAuditEvent({
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
