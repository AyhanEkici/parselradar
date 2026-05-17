import ConnectorActivationRecord from '../../models/ConnectorActivationRecord';
import { logAuditEvent } from '../../utils/auditLog';

/**
 * Deactivates an ACTIVE connector by writing a DISABLED activation record.
 * Does not delete previous activation records (append-only audit trail).
 */
export async function deactivateConnector(params: {
  connectorKey: string;
  userId: string;
  ip?: string;
}) {
  const { connectorKey, userId, ip } = params;

  const latestRecord = await ConnectorActivationRecord.findOne({ connectorKey })
    .sort({ createdAt: -1 })
    .lean();

  if (!latestRecord || latestRecord.state !== 'ACTIVE') {
    return { deactivated: false, reason: 'Connector is not currently ACTIVE.' };
  }

  const record = await ConnectorActivationRecord.create({
    connectorKey,
    state: 'DISABLED',
    deactivatedAt: new Date(),
    deactivatedByUserId: userId,
  });

  await logAuditEvent({
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
