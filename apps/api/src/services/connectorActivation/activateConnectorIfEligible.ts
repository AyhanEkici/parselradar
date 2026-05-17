import ConnectorActivationRecord from '../../models/ConnectorActivationRecord';
import ConnectorSourceApproval from '../../models/ConnectorSourceApproval';
import ConnectorTestRun from '../../models/ConnectorTestRun';
import { findConnectorExecution } from '../../connectors/connectorExecutionRegistry';
import { logAuditEvent } from '../../utils/auditLog';

/**
 * Activates a connector only when all 5 eligibility gates pass:
 * 1. Endpoint configured (env)
 * 2. Credentials configured (env)
 * 3. Legal/source approval present in DB
 * 4. Last test run was TEST_PASSED
 * 5. Connector is not already ACTIVE
 */
export async function activateConnectorIfEligible(params: {
  connectorKey: string;
  userId: string;
  ip?: string;
}) {
  const { connectorKey, userId, ip } = params;

  const execution = findConnectorExecution(connectorKey);
  if (!execution) {
    return { activated: false, reason: `Connector not found: ${connectorKey}` };
  }

  // Gate 1 & 2: env state
  const envState = execution.status();
  if (envState === 'NOT_CONFIGURED') {
    return { activated: false, reason: 'Endpoint is not configured.' };
  }
  if (envState === 'CREDENTIALS_MISSING') {
    return { activated: false, reason: 'Credentials are missing.' };
  }

  // Gate 3: DB legal approval
  const approval = await ConnectorSourceApproval.findOne({ connectorKey }).lean();
  if (!approval?.approved) {
    return { activated: false, reason: 'Legal/source approval is required before activation.' };
  }

  // Gate 4: last test must be TEST_PASSED
  const lastTest = await ConnectorTestRun.findOne({ connectorKey }).sort({ checkedAt: -1 }).lean();
  if (!lastTest || lastTest.state !== 'TEST_PASSED') {
    return { activated: false, reason: 'Connector must pass a test run before activation.' };
  }

  // Gate 5: not already ACTIVE
  const latestRecord = await ConnectorActivationRecord.findOne({ connectorKey })
    .sort({ createdAt: -1 })
    .lean();
  if (latestRecord?.state === 'ACTIVE') {
    return { activated: false, reason: 'Connector is already ACTIVE.' };
  }

  // All gates passed — write activation record
  const record = await ConnectorActivationRecord.create({
    connectorKey,
    state: 'ACTIVE',
    activatedAt: new Date(),
    activatedByUserId: userId,
    testRunId: lastTest._id?.toString(),
  });

  await logAuditEvent({
    type: 'connector_activated',
    actorUserId: userId,
    targetType: 'Connector',
    targetId: connectorKey,
    message: `Connector activated: ${connectorKey}`,
    metadata: { connectorKey, activationRecordId: record._id?.toString(), testRunId: lastTest._id?.toString() },
    ip,
    success: true,
  });

  return {
    activated: true,
    connectorKey,
    activationRecordId: record._id?.toString(),
    activatedAt: record.activatedAt,
  };
}
