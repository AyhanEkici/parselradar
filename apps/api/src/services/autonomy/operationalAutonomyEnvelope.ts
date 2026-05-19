import { autonomousIntelligenceEngine } from './autonomousIntelligenceEngine';
import { governedAutonomousScheduler } from './governedAutonomousScheduler';
import { intelligenceCadenceManager } from './intelligenceCadenceManager';
import { autonomousSignalPrioritizer } from './autonomousSignalPrioritizer';

export function operationalAutonomyEnvelope(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  queueDepth: number;
  restricted: boolean;
  suppression?: boolean;
  monitoringState: string;
  anomalyScore: number;
  opportunityScore: number;
}) {
  const autonomy = autonomousIntelligenceEngine({
    source: input.source,
    timestamp: input.timestamp,
    freshness: input.freshness,
    confidence: input.confidence,
    governanceState: input.governanceState,
    evidenceLineage: input.evidenceLineage,
    queueDepth: input.queueDepth,
    restricted: input.restricted,
  });

  const cadence = intelligenceCadenceManager({
    source: input.source,
    timestamp: input.timestamp,
    freshness: input.freshness,
    confidence: input.confidence,
    governanceState: input.governanceState,
    evidenceLineage: input.evidenceLineage,
    monitoringState: input.monitoringState,
  });

  const scheduler = governedAutonomousScheduler({
    source: input.source,
    timestamp: input.timestamp,
    freshness: input.freshness,
    confidence: input.confidence,
    governanceState: input.governanceState,
    evidenceLineage: input.evidenceLineage,
    cadenceMinutes: cadence.cadenceMinutes,
    suppression: input.suppression,
  });

  const prioritizer = autonomousSignalPrioritizer({
    source: input.source,
    timestamp: input.timestamp,
    freshness: input.freshness,
    confidence: input.confidence,
    governanceState: input.governanceState,
    evidenceLineage: input.evidenceLineage,
    anomalyScore: input.anomalyScore,
    opportunityScore: input.opportunityScore,
  });

  return {
    source: input.source,
    timestamp: input.timestamp,
    freshness: input.freshness,
    confidence: input.confidence,
    governanceState: input.governanceState,
    evidenceLineage: input.evidenceLineage || [],
    inferenceLevel: 'inferred',
    deterministic: true,
    autonomy,
    cadence,
    scheduler,
    prioritizer,
    reviewRequired: autonomy.autonomyState !== 'GOVERNED_AUTONOMOUS',
  };
}
