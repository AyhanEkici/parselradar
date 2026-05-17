import ConnectorActivationRecord from '../../models/ConnectorActivationRecord';
import ConnectorSourceApproval from '../../models/ConnectorSourceApproval';
import ConnectorTestRun from '../../models/ConnectorTestRun';
import { findConnectorByKey } from '../../connectors/connectorRegistry';
import { findConnectorExecution } from '../../connectors/connectorExecutionRegistry';
import { ConnectorState } from '../../connectors/connectorContracts';
import { evaluateConnectorRateLimit } from './connectorRateLimiter';
import { getConnectorRetryPolicy } from './connectorRetryPolicy';
import { buildConnectorFreshness } from './connectorFreshnessTracker';

/**
 * Composes the authoritative connector activation state from:
 * 1. Env-based credential and endpoint check (via execution contract)
 * 2. DB-based legal/source approval
 * 3. DB-based last test run result
 * 4. DB-based activation/deactivation record
 */
export async function getConnectorActivationState(connectorKey: string) {
  const execution = findConnectorExecution(connectorKey);
  const definition = findConnectorByKey(connectorKey);

  if (!execution || !definition) {
    return { connectorKey, state: 'NOT_CONFIGURED' as ConnectorState, reason: 'Connector not found in registry.' };
  }

  // 1. Env-based status (endpoint + credentials)
  const envState = execution.status();

  // 2. DB legal approval (overrides env-based check if present)
  const dbApproval = await ConnectorSourceApproval.findOne({ connectorKey }).lean();
  const legalApproved = dbApproval ? dbApproval.approved : false;

  // 3. DB-based activation record (latest)
  const latestActivation = await ConnectorActivationRecord.findOne({ connectorKey })
    .sort({ createdAt: -1 })
    .lean();

  // 4. DB-based last test run
  const lastTestRun = await ConnectorTestRun.findOne({ connectorKey })
    .sort({ checkedAt: -1 })
    .lean();

  const lastSuccessfulTestRun = await ConnectorTestRun.findOne({ connectorKey, state: 'TEST_PASSED' })
    .sort({ checkedAt: -1 })
    .lean();

  const recentTestRuns = await ConnectorTestRun.find({ connectorKey })
    .sort({ checkedAt: -1 })
    .limit(25)
    .select('checkedAt')
    .lean();

  // Compose state
  let state: ConnectorState = envState;

  if (latestActivation?.state === 'DISABLED') {
    state = 'DISABLED';
  } else if (latestActivation?.state === 'ACTIVE') {
    state = 'ACTIVE';
  } else if (envState === 'READY_FOR_TEST' || envState === 'LEGAL_REVIEW_REQUIRED') {
    // Override legal check with DB record if available
    if (!legalApproved) {
      state = 'LEGAL_REVIEW_REQUIRED';
    } else if (lastTestRun?.state === 'TEST_PASSED') {
      state = 'TEST_PASSED';
    } else if (lastTestRun?.state === 'TEST_FAILED') {
      state = 'TEST_FAILED';
    } else {
      state = 'READY_FOR_TEST';
    }
  }

  return {
    connectorKey,
    state,
    envState,
    legalApproved,
    legalApprovalNote: dbApproval?.note ?? null,
    lastTestRun: lastTestRun
      ? {
          id: lastTestRun._id?.toString(),
          state: lastTestRun.state,
          message: lastTestRun.message,
          samplePayloadSchema: lastTestRun.samplePayloadSchema,
          checkedAt: lastTestRun.checkedAt,
        }
      : null,
    latestActivation: latestActivation
      ? {
          id: latestActivation._id?.toString(),
          state: latestActivation.state,
          activatedAt: latestActivation.activatedAt,
          deactivatedAt: latestActivation.deactivatedAt,
        }
      : null,
    requiredEnv: execution.requiredEnv,
    legalRequirement: execution.legalRequirement,
    v23: {
      rateLimit: evaluateConnectorRateLimit({
        connectorKey,
        nowMs: Date.now(),
        recentRequestTimestampsMs: recentTestRuns
          .map((r: any) => (r.checkedAt ? new Date(r.checkedAt).getTime() : null))
          .filter((v: any) => typeof v === 'number') as number[],
      }),
      retryPolicy: getConnectorRetryPolicy(connectorKey),
      freshness: buildConnectorFreshness({
        connectorKey,
        now: new Date(),
        lastSuccessfulCheckAt: lastSuccessfulTestRun?.checkedAt ? new Date(lastSuccessfulTestRun.checkedAt) : null,
      }),
      planning:
        connectorKey === 'municipality_zoning'
          ? {
              expectedLayers: ['1/100000', '1/25000', '1/5000', '1/1000'],
              governanceClasses: ['VERIFIED_FACT', 'DERIVED_ANALYTIC', 'HEURISTIC_SIGNAL', 'INCOMPLETE_DATA', 'HUMAN_REVIEW_ADVISED'],
              note: 'Layer availability is only proven after a successful test run that returns structured planning payloads.',
            }
          : null,
    },
  };
}
