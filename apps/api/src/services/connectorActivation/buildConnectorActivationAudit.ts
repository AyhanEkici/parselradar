import ConnectorActivationRecord from '../../models/ConnectorActivationRecord';
import ConnectorTestRun from '../../models/ConnectorTestRun';

/**
 * Returns an audit history for a specific connector composed from:
 * - ConnectorTestRun records (chronological)
 * - ConnectorActivationRecord records (chronological)
 */
export async function buildConnectorActivationAudit(connectorKey: string) {
  const [testRuns, activationRecords] = await Promise.all([
    ConnectorTestRun.find({ connectorKey }).sort({ checkedAt: -1 }).limit(50).lean(),
    ConnectorActivationRecord.find({ connectorKey }).sort({ createdAt: -1 }).limit(50).lean(),
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
