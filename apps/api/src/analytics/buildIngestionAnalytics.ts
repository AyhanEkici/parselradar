import PropertySubmission from '../models/PropertySubmission';
import AuditEvent from '../models/AuditEvent';

export async function buildIngestionAnalytics() {
  const [totalProperties, staleProperties, ingestionAudits] = await Promise.all([
    PropertySubmission.countDocuments({}),
    PropertySubmission.countDocuments({ ingestionState: 'stale' }),
    AuditEvent.countDocuments({ type: { $regex: 'ingestion', $options: 'i' } }),
  ]);

  return {
    totalProperties,
    staleProperties,
    ingestionAudits,
    ingestionState: staleProperties > 0 ? 'DEGRADED' : 'READY',
  };
}
