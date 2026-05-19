"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConnectorActivationState = getConnectorActivationState;
const ConnectorActivationRecord_1 = __importDefault(require("../../models/ConnectorActivationRecord"));
const ConnectorSourceApproval_1 = __importDefault(require("../../models/ConnectorSourceApproval"));
const ConnectorTestRun_1 = __importDefault(require("../../models/ConnectorTestRun"));
const connectorRegistry_1 = require("../../connectors/connectorRegistry");
const connectorExecutionRegistry_1 = require("../../connectors/connectorExecutionRegistry");
const connectorRateLimiter_1 = require("./connectorRateLimiter");
const connectorRetryPolicy_1 = require("./connectorRetryPolicy");
const connectorFreshnessTracker_1 = require("./connectorFreshnessTracker");
/**
 * Composes the authoritative connector activation state from:
 * 1. Env-based credential and endpoint check (via execution contract)
 * 2. DB-based legal/source approval
 * 3. DB-based last test run result
 * 4. DB-based activation/deactivation record
 */
async function getConnectorActivationState(connectorKey) {
    const execution = (0, connectorExecutionRegistry_1.findConnectorExecution)(connectorKey);
    const definition = (0, connectorRegistry_1.findConnectorByKey)(connectorKey);
    if (!execution || !definition) {
        return { connectorKey, state: 'NOT_CONFIGURED', reason: 'Connector not found in registry.' };
    }
    // 1. Env-based status (endpoint + credentials)
    const envState = execution.status();
    // 2. DB legal approval (overrides env-based check if present)
    const dbApproval = await ConnectorSourceApproval_1.default.findOne({ connectorKey }).lean();
    const legalApproved = dbApproval ? dbApproval.approved : false;
    // 3. DB-based activation record (latest)
    const latestActivation = await ConnectorActivationRecord_1.default.findOne({ connectorKey })
        .sort({ createdAt: -1 })
        .lean();
    // 4. DB-based last test run
    const lastTestRun = await ConnectorTestRun_1.default.findOne({ connectorKey })
        .sort({ checkedAt: -1 })
        .lean();
    const lastSuccessfulTestRun = await ConnectorTestRun_1.default.findOne({ connectorKey, state: 'TEST_PASSED' })
        .sort({ checkedAt: -1 })
        .lean();
    const recentTestRuns = await ConnectorTestRun_1.default.find({ connectorKey })
        .sort({ checkedAt: -1 })
        .limit(25)
        .select('checkedAt')
        .lean();
    // Compose state
    let state = envState;
    if (latestActivation?.state === 'DISABLED') {
        state = 'DISABLED';
    }
    else if (latestActivation?.state === 'ACTIVE') {
        state = 'ACTIVE';
    }
    else if (envState === 'READY_FOR_TEST' || envState === 'LEGAL_REVIEW_REQUIRED') {
        // Override legal check with DB record if available
        if (!legalApproved) {
            state = 'LEGAL_REVIEW_REQUIRED';
        }
        else if (lastTestRun?.state === 'TEST_PASSED') {
            state = 'TEST_PASSED';
        }
        else if (lastTestRun?.state === 'TEST_FAILED') {
            state = 'TEST_FAILED';
        }
        else {
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
            rateLimit: (0, connectorRateLimiter_1.evaluateConnectorRateLimit)({
                connectorKey,
                nowMs: Date.now(),
                recentRequestTimestampsMs: recentTestRuns
                    .map((r) => (r.checkedAt ? new Date(r.checkedAt).getTime() : null))
                    .filter((v) => typeof v === 'number'),
            }),
            retryPolicy: (0, connectorRetryPolicy_1.getConnectorRetryPolicy)(connectorKey),
            freshness: (0, connectorFreshnessTracker_1.buildConnectorFreshness)({
                connectorKey,
                now: new Date(),
                lastSuccessfulCheckAt: lastSuccessfulTestRun?.checkedAt ? new Date(lastSuccessfulTestRun.checkedAt) : null,
            }),
            planning: connectorKey === 'municipality_zoning'
                ? {
                    expectedLayers: ['1/100000', '1/25000', '1/5000', '1/1000'],
                    governanceClasses: ['VERIFIED_FACT', 'DERIVED_ANALYTIC', 'HEURISTIC_SIGNAL', 'INCOMPLETE_DATA', 'HUMAN_REVIEW_ADVISED'],
                    note: 'Layer availability is only proven after a successful test run that returns structured planning payloads.',
                }
                : null,
        },
    };
}
