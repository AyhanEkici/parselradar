import ConnectorTestRun from '../../models/ConnectorTestRun';
import { findConnectorExecution } from '../../connectors/connectorExecutionRegistry';
import { logAuditEvent } from '../../utils/auditLog';

/**
 * Executes the connector's test() method, stores the result as a ConnectorTestRun record,
 * and logs an audit event. Returns only safe test metadata — no raw secrets or live data.
 */
export async function executeConnectorTestRun(params: {
  connectorKey: string;
  userId: string;
  ip?: string;
}) {
  const { connectorKey, userId, ip } = params;

  const execution = findConnectorExecution(connectorKey);
  if (!execution) {
    return {
      success: false,
      error: `Connector not found: ${connectorKey}`,
    };
  }

  const outcome = await execution.test();

  // Only store result if it's a conclusive test pass or fail
  const isStorable = outcome.state === 'TEST_PASSED' || outcome.state === 'TEST_FAILED';

  let testRunId: string | undefined;

  if (isStorable) {
    const record = await ConnectorTestRun.create({
      connectorKey,
      state: outcome.state as 'TEST_PASSED' | 'TEST_FAILED',
      message: outcome.message,
      samplePayloadSchema: outcome.samplePayloadSchema,
      checkedAt: new Date(),
      runByUserId: userId,
    });
    testRunId = record._id?.toString();
  }

  await logAuditEvent({
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
