import AuditEvent from '../../models/AuditEvent';
import { CONNECTOR_REGISTRY } from '../../connectors/connectorRegistry';

export async function buildConnectorAuditTrail() {
  const regex = CONNECTOR_REGISTRY.map((c) => c.key).join('|');

  const audits = await AuditEvent.find({
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
