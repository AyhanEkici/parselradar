import { fetchGovernedConnectorMetadata } from '../../connectors/governedPublicConnectorAdapters';
import { connectorGovernanceRegistry } from '../connectors/connectorGovernanceRegistry';
import { connectorLegalClassification } from '../connectors/connectorLegalClassification';
import { sourceUsageDisclosure } from '../legal/sourceUsageDisclosure';
import { connectorTermsRegistry } from '../legal/connectorTermsRegistry';
import { governanceRestrictionEngine } from '../legal/governanceRestrictionEngine';
import { ingestionComplianceSummary } from '../legal/ingestionComplianceSummary';
import { governedRateLimiter } from '../rateLimit/governedRateLimiter';
import { connectorQuotaTracker } from '../rateLimit/connectorQuotaTracker';
import { ingestionBackpressureEngine } from '../queue/ingestionBackpressureEngine';
import { ingestionQueueHealth } from '../queue/ingestionQueueHealth';
import { ingestionDeadLetterReview } from '../queue/ingestionDeadLetterReview';
import { ingestionFreshnessManager } from './ingestionFreshnessManager';
import { ingestionRetryManager } from './ingestionRetryManager';
import { ingestionExecutionRegistry } from './ingestionExecutionRegistry';
import { ingestionAuditTrail } from './ingestionAuditTrail';
import { ingestionProvenanceEnvelope } from '../provenance/ingestionProvenanceEnvelope';
import { ingestionTrustEnvelope } from '../provenance/ingestionTrustEnvelope';
import { sourceRefreshScheduler } from '../freshness/sourceRefreshScheduler';
import { deterministicCacheEnvelope } from '../cache/deterministicCacheEnvelope';
import { ConnectorKeyV26 } from '../connectors/connectorCapabilityMatrix';

export async function ingestionOrchestrator(input: {
  propertyId: string;
  runId: string;
  city?: string;
  district?: string;
  ada?: string;
  parsel?: string;
}) {
  const now = new Date().toISOString();
  const registry = connectorGovernanceRegistry(now);
  const terms = connectorTermsRegistry(now);
  const deadLetters: Array<{ connectorKey: string; reason: string; createdAt: string }> = [];

  const executions = await Promise.all(
    registry.connectors.map(async (connector) => {
      const legal = connectorLegalClassification(connector.key);
      const term = terms.find((t) => t.connectorKey === connector.key);
      const restriction = governanceRestrictionEngine({
        activationState: connector.activationState,
        legalState: legal.governanceState,
        termsAccepted: Boolean(term?.accepted),
      });

      const rate = governedRateLimiter({
        connectorKey: connector.key,
        attemptsInWindow: Number(process.env[`CONNECTOR_${connector.key.toUpperCase()}_ATTEMPTS`] || 0),
        maxPerWindow: Number(process.env[`CONNECTOR_${connector.key.toUpperCase()}_MAX_PER_WINDOW`] || 10),
      });

      if (restriction.blocked || rate.limited || connector.activationState !== 'ACTIVE') {
        return {
          connectorKey: connector.key,
          executionId: `${connector.key}:${now}`,
          startedAt: now,
          finishedAt: now,
          status: 'SKIPPED' as const,
          source: connector.key,
          legalClassification: legal.legalClass,
          governanceState: legal.governanceState,
          freshnessState: 'STALE',
          records: [] as Array<Record<string, unknown>>,
          notes: [restriction.restrictionReason, rate.state, `activation:${connector.activationState}`],
        };
      }

      const result = await fetchGovernedConnectorMetadata({
        connectorKey: connector.key,
        query: {
          city: input.city,
          district: input.district,
          ada: input.ada,
          parsel: input.parsel,
        },
      });

      const status = result.status === 'SUCCESS' ? 'SUCCESS' : result.status === 'FAILED' ? 'FAILED' : 'SKIPPED';
      if (status === 'FAILED') {
        deadLetters.push({
          connectorKey: connector.key,
          reason: result.reason || 'unknown',
          createdAt: now,
        });
      }

      const freshness = ingestionFreshnessManager({
        connectorKey: connector.key,
        ingestedAt: result.timestamp,
        observedAt: now,
        maxAgeHours: 48,
        sourceStatuses: [status],
      });

      return {
        connectorKey: connector.key,
        executionId: `${connector.key}:${now}`,
        startedAt: now,
        finishedAt: now,
        status,
        source: connector.key,
        legalClassification: legal.legalClass,
        governanceState: legal.governanceState,
        freshnessState: freshness.freshnessState,
        records: result.records,
        notes: [result.reason || 'ok'],
      };
    })
  );

  const executionRegistry = ingestionExecutionRegistry(executions.map((entry) => ({
    connectorKey: entry.connectorKey as ConnectorKeyV26,
    executionId: entry.executionId,
    startedAt: entry.startedAt,
    finishedAt: entry.finishedAt,
    status: entry.status as "SUCCESS" | "SKIPPED" | "FAILED",
    source: entry.source,
    legalClassification: entry.legalClassification,
    governanceState: entry.governanceState,
    freshnessState: entry.freshnessState,
  })));

  const auditTrail = ingestionAuditTrail(
    executions.map((entry) => ({
      connectorKey: entry.connectorKey,
      action: entry.status === 'SUCCESS' ? 'SUCCESS' : entry.status === 'FAILED' ? 'FAIL' : 'SKIP',
      timestamp: entry.finishedAt,
      status: entry.status as "SUCCESS" | "SKIPPED" | "FAILED",
      governanceState: entry.governanceState,
      legalClassification: entry.legalClassification,
      notes: entry.notes,
    }))
  );

  const provenance = ingestionProvenanceEnvelope({
    propertyId: input.propertyId,
    runId: input.runId,
    nodes: executions.map((entry) => ({
      source: entry.source,
      timestamp: entry.finishedAt,
      status: entry.status as "SUCCESS" | "SKIPPED" | "FAILED",
      freshnessState: entry.freshnessState,
      governanceState: entry.governanceState,
      legalClassification: entry.legalClassification,
    })),
  });

  const trust = ingestionTrustEnvelope({
    successCount: executions.filter((x) => x.status === 'SUCCESS').length,
    failCount: executions.filter((x) => x.status === 'FAILED').length,
    staleCount: executions.filter((x) => x.freshnessState === 'STALE').length,
    rateLimitedCount: executions.filter((x) => x.notes.some((n) => n === 'RATE_LIMITED')).length,
    restrictedCount: executions.filter((x) => x.governanceState !== 'ALLOW').length,
  });

  const compliance = ingestionComplianceSummary({
    legalStates: executions.map((x) => x.governanceState),
    connectorStates: registry.connectors.map((x) => x.activationState),
    termsAccepted: terms.map((x) => x.accepted),
  });

  const quota = executions.map((entry) =>
    connectorQuotaTracker({
      connectorKey: entry.connectorKey,
      used: Number(process.env[`CONNECTOR_${entry.connectorKey.toUpperCase()}_ATTEMPTS`] || 0),
      quota: Number(process.env[`CONNECTOR_${entry.connectorKey.toUpperCase()}_MAX_PER_WINDOW`] || 10),
    })
  );

  const queueHealth = ingestionQueueHealth({
    queueDepth: Number(process.env.INGESTION_QUEUE_DEPTH || 0),
    delayedJobs: Number(process.env.INGESTION_DELAYED_JOBS || 0),
    deadLetterCount: deadLetters.length,
  });

  const backpressure = ingestionBackpressureEngine({
    queueDepth: Number(process.env.INGESTION_QUEUE_DEPTH || 0),
    inFlight: Number(process.env.INGESTION_IN_FLIGHT || 0),
    failRatePct: Math.round((executionRegistry.byStatus.FAILED / Math.max(1, executions.length)) * 100),
  });

  const deadLetterReview = ingestionDeadLetterReview({ deadLetters });
  const retries = executions.map((entry) =>
    ingestionRetryManager({
      connectorKey: entry.connectorKey,
      status: entry.status as "SUCCESS" | "SKIPPED" | "FAILED",
      attempt: Number(process.env[`CONNECTOR_${entry.connectorKey.toUpperCase()}_ATTEMPT`] || 1),
      maxAttempts: Number(process.env[`CONNECTOR_${entry.connectorKey.toUpperCase()}_MAX_ATTEMPTS`] || 3),
    })
  );

  const schedules = executions.map((entry) =>
    sourceRefreshScheduler({
      source: entry.source,
      state: registry.connectors.find((x) => x.key === entry.connectorKey)?.activationState || 'NOT_CONFIGURED',
      freshnessScore: entry.freshnessState === 'FRESH' ? 90 : entry.freshnessState === 'AGING' ? 65 : 35,
    })
  );

  const disclosures = executions.map((entry) =>
    sourceUsageDisclosure({
      source: entry.source,
      legalClass: entry.legalClassification,
      governanceState: entry.governanceState,
      fetchedAt: entry.finishedAt,
    })
  );

  const cacheEnvelope = deterministicCacheEnvelope({
    source: 'ingestion_orchestrator_v26',
    cacheKey: `${input.propertyId}:${input.runId}:v26`,
    generatedAt: now,
    freshnessScore: Math.round(
      executions.reduce((sum, entry) => sum + (entry.freshnessState === 'FRESH' ? 100 : entry.freshnessState === 'AGING' ? 65 : 35), 0) /
        Math.max(1, executions.length)
    ),
    payloadHash: Buffer.from(`${provenance.sourceChainHash}|${trust.trustScore}|${compliance.complianceState}`).toString('hex').slice(0, 32),
  });

  const noFakeActiveProof = executions.every((entry) => {
    if (entry.status !== 'SUCCESS') return true;
    const state = registry.connectors.find((x) => x.key === entry.connectorKey)?.activationState;
    return state === 'ACTIVE';
  });

  return {
    generatedAt: now,
    connectorGovernance: registry,
    executionRegistry,
    auditTrail,
    provenance,
    trust,
    compliance,
    quota,
    queueHealth,
    backpressure,
    deadLetterReview,
    retries,
    refreshSchedules: schedules,
    disclosures,
    cacheEnvelope,
    connectors: executions,
    deterministic: true,
    noFakeActiveProof,
  };
}
