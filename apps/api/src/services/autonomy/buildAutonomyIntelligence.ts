import { operationalAutonomyEnvelope } from './operationalAutonomyEnvelope';
import { parcelWatchlistEngine } from '../watchlists/parcelWatchlistEngine';
import { regionWatchlistEngine } from '../watchlists/regionWatchlistEngine';
import { investorWatchPriority } from '../watchlists/investorWatchPriority';
import { strategicWatchClassifier } from '../watchlists/strategicWatchClassifier';
import { watchlistSignalAggregator } from '../watchlists/watchlistSignalAggregator';
import { intelligenceFeedGenerator } from '../feeds/intelligenceFeedGenerator';
import { regionalActivityFeed } from '../feeds/regionalActivityFeed';
import { zoningShiftFeed } from '../feeds/zoningShiftFeed';
import { infrastructureExpansionFeed } from '../feeds/infrastructureExpansionFeed';
import { speculativeRiskFeed } from '../feeds/speculativeRiskFeed';
import { portfolioIntelligenceEngine } from '../portfolioOps/portfolioIntelligenceEngine';
import { portfolioRiskEvolution } from '../portfolioOps/portfolioRiskEvolution';
import { portfolioOpportunityTracker } from '../portfolioOps/portfolioOpportunityTracker';
import { investorExposureAnalyzer } from '../portfolioOps/investorExposureAnalyzer';
import { strategicAllocationSignals } from '../portfolioOps/strategicAllocationSignals';
import { crossSignalPrioritizationEngine } from '../prioritization/crossSignalPrioritizationEngine';
import { strategicConfidenceScoring } from '../prioritization/strategicConfidenceScoring';
import { investorPriorityQueue } from '../prioritization/investorPriorityQueue';
import { governedAutoEscalationQueue } from '../prioritization/governedAutoEscalationQueue';
import { priorityDriftMonitor } from '../prioritization/priorityDriftMonitor';
import { intelligenceImportanceScorer } from '../prioritization/intelligenceImportanceScorer';
import { regionalCriticalityEngine } from '../prioritization/regionalCriticalityEngine';
import { strategicUrgencyClassifier } from '../prioritization/strategicUrgencyClassifier';
import { opportunityPriorityMatrix } from '../prioritization/opportunityPriorityMatrix';
import { autonomousReviewQueue } from '../prioritization/autonomousReviewQueue';
import { strategicTransformationRadar } from '../strategicMonitoring/strategicTransformationRadar';
import { municipalDecisionMomentum } from '../strategicMonitoring/municipalDecisionMomentum';
import { corridorGrowthDetection } from '../strategicMonitoring/corridorGrowthDetection';
import { emergingHotspotClassifier } from '../strategicMonitoring/emergingHotspotClassifier';
import { strategicDivergenceDetector } from '../strategicMonitoring/strategicDivergenceDetector';
import { regionalSurveillanceEngine } from '../strategicMonitoring/regionalSurveillanceEngine';
import { strategicRegionMonitor } from '../strategicMonitoring/strategicRegionMonitor';
import { municipalityPressureMonitor } from '../strategicMonitoring/municipalityPressureMonitor';
import { infrastructureMomentumMonitor } from '../strategicMonitoring/infrastructureMomentumMonitor';
import { transformationAccelerationMonitor } from '../strategicMonitoring/transformationAccelerationMonitor';
import { suppressionGovernanceRegistry } from '../operations/suppressionGovernanceRegistry';
import { cadenceExecutionAudit } from '../operations/cadenceExecutionAudit';
import { staleConnectorDegradationVisibility } from '../operations/staleConnectorDegradationVisibility';
import { investorOpsControlPanel } from '../operations/investorOpsControlPanel';
import { investorPriorityAlerts } from '../alerts/investorPriorityAlerts';
import { municipalShiftEscalation } from '../escalation/municipalShiftEscalation';
import { infrastructureEscalationEngine } from '../escalation/infrastructureEscalationEngine';
import { degradationEscalationEngine } from '../escalation/degradationEscalationEngine';

export function buildAutonomyIntelligence(input: {
  nowIso: string;
  source: string;
  freshnessScore: number;
  confidenceScore: number;
  governanceState: string;
  evidenceLineage: unknown[];
  trendSignals: string[];
  ingestionSignals: string[];
  developmentSignals: string[];
  strategicLocationSignals: string[];
  marketMomentum: number;
  opportunityScore: number;
  districtHeat: number;
  volatileScore: number;
  connectorStates: Array<{ connectorKey?: string; status?: string; freshnessState?: string }>;
  suppression: boolean;
}) {
  const watchlist = {
    parcel: parcelWatchlistEngine({
      source: input.source,
      timestamp: input.nowIso,
      freshness: input.freshnessScore,
      confidence: input.confidenceScore,
      governanceState: input.governanceState,
      evidenceLineage: input.evidenceLineage,
      parcelSignals: input.trendSignals || [],
    }),
    region: regionWatchlistEngine({
      source: input.source,
      timestamp: input.nowIso,
      freshness: input.freshnessScore,
      confidence: input.confidenceScore,
      governanceState: input.governanceState,
      evidenceLineage: input.evidenceLineage,
      regionalScore: input.marketMomentum || 0,
    }),
    investor: investorWatchPriority({
      source: input.source,
      timestamp: input.nowIso,
      freshness: input.freshnessScore,
      confidence: input.confidenceScore,
      governanceState: input.governanceState,
      evidenceLineage: input.evidenceLineage,
      riskScore: input.volatileScore || 0,
      opportunityScore: input.opportunityScore || 0,
    }),
    strategic: strategicWatchClassifier({
      source: input.source,
      timestamp: input.nowIso,
      freshness: input.freshnessScore,
      confidence: input.confidenceScore,
      governanceState: input.governanceState,
      evidenceLineage: input.evidenceLineage,
      transformationScore: input.marketMomentum || 0,
    }),
    aggregate: watchlistSignalAggregator({
      source: input.source,
      timestamp: input.nowIso,
      freshness: input.freshnessScore,
      confidence: input.confidenceScore,
      governanceState: input.governanceState,
      evidenceLineage: input.evidenceLineage,
      parcelSignals: input.trendSignals || [],
      regionalSignals: input.strategicLocationSignals || [],
    }),
  };

  const feeds = {
    unified: intelligenceFeedGenerator({
      source: input.source,
      timestamp: input.nowIso,
      freshness: input.freshnessScore,
      confidence: input.confidenceScore,
      governanceState: input.governanceState,
      evidenceLineage: input.evidenceLineage,
      events: [
        { type: 'market_momentum', score: input.marketMomentum || 0 },
        { type: 'opportunity', score: input.opportunityScore || 0 },
      ],
    }),
    regional: regionalActivityFeed({
      source: input.source,
      timestamp: input.nowIso,
      freshness: input.freshnessScore,
      confidence: input.confidenceScore,
      governanceState: input.governanceState,
      evidenceLineage: input.evidenceLineage,
      activityScore: input.marketMomentum || 0,
    }),
    zoning: zoningShiftFeed({
      source: input.source,
      timestamp: input.nowIso,
      freshness: input.freshnessScore,
      confidence: input.confidenceScore,
      governanceState: input.governanceState,
      evidenceLineage: input.evidenceLineage,
      zoningShiftScore: input.districtHeat || 0,
    }),
    infrastructure: infrastructureExpansionFeed({
      source: input.source,
      timestamp: input.nowIso,
      freshness: input.freshnessScore,
      confidence: input.confidenceScore,
      governanceState: input.governanceState,
      evidenceLineage: input.evidenceLineage,
      expansionScore: input.marketMomentum || 0,
    }),
    speculative: speculativeRiskFeed({
      source: input.source,
      timestamp: input.nowIso,
      freshness: input.freshnessScore,
      confidence: input.confidenceScore,
      governanceState: input.governanceState,
      evidenceLineage: input.evidenceLineage,
      speculativeScore: input.volatileScore || 0,
    }),
  };

  const portfolio = {
    intelligence: portfolioIntelligenceEngine({
      source: input.source,
      timestamp: input.nowIso,
      freshness: input.freshnessScore,
      confidence: input.confidenceScore,
      governanceState: input.governanceState,
      evidenceLineage: input.evidenceLineage,
      concentrationScore: input.districtHeat || 0,
      volatilityScore: input.volatileScore || 0,
    }),
    riskEvolution: portfolioRiskEvolution({
      source: input.source,
      timestamp: input.nowIso,
      freshness: input.freshnessScore,
      confidence: input.confidenceScore,
      governanceState: input.governanceState,
      evidenceLineage: input.evidenceLineage,
      riskSeries: [input.volatileScore || 0, input.districtHeat || 0, input.marketMomentum || 0],
    }),
    opportunities: portfolioOpportunityTracker({
      source: input.source,
      timestamp: input.nowIso,
      freshness: input.freshnessScore,
      confidence: input.confidenceScore,
      governanceState: input.governanceState,
      evidenceLineage: input.evidenceLineage,
      opportunities: [
        { id: 'momentum', score: input.marketMomentum || 0 },
        { id: 'opportunity', score: input.opportunityScore || 0 },
        { id: 'district', score: input.districtHeat || 0 },
      ],
    }),
    exposure: investorExposureAnalyzer({
      source: input.source,
      timestamp: input.nowIso,
      freshness: input.freshnessScore,
      confidence: input.confidenceScore,
      governanceState: input.governanceState,
      evidenceLineage: input.evidenceLineage,
      exposureScore: input.districtHeat || 0,
    }),
    allocation: strategicAllocationSignals({
      source: input.source,
      timestamp: input.nowIso,
      freshness: input.freshnessScore,
      confidence: input.confidenceScore,
      governanceState: input.governanceState,
      evidenceLineage: input.evidenceLineage,
      allocationSignals: input.developmentSignals || [],
    }),
  };

  const strategic = {
    radar: strategicTransformationRadar({
      source: input.source,
      timestamp: input.nowIso,
      freshness: input.freshnessScore,
      confidence: input.confidenceScore,
      governanceState: input.governanceState,
      evidenceLineage: input.evidenceLineage,
      transformationIndicators: input.strategicLocationSignals || [],
    }),
    municipalMomentum: municipalDecisionMomentum({
      source: input.source,
      timestamp: input.nowIso,
      freshness: input.freshnessScore,
      confidence: input.confidenceScore,
      governanceState: input.governanceState,
      evidenceLineage: input.evidenceLineage,
      approvals: Math.max(0, Math.round((input.marketMomentum || 0) / 10)),
      pending: Math.max(0, Math.round((100 - (input.marketMomentum || 0)) / 12)),
    }),
    corridorGrowth: corridorGrowthDetection({
      source: input.source,
      timestamp: input.nowIso,
      freshness: input.freshnessScore,
      confidence: input.confidenceScore,
      governanceState: input.governanceState,
      evidenceLineage: input.evidenceLineage,
      permitGrowthPct: input.marketMomentum || 0,
      infrastructureGrowthPct: input.districtHeat || 0,
    }),
    hotspot: emergingHotspotClassifier({
      source: input.source,
      timestamp: input.nowIso,
      freshness: input.freshnessScore,
      confidence: input.confidenceScore,
      governanceState: input.governanceState,
      evidenceLineage: input.evidenceLineage,
      hotspotScore: input.opportunityScore || 0,
    }),
    divergence: strategicDivergenceDetector({
      source: input.source,
      timestamp: input.nowIso,
      freshness: input.freshnessScore,
      confidence: input.confidenceScore,
      governanceState: input.governanceState,
      evidenceLineage: input.evidenceLineage,
      expectedTrajectory: input.marketMomentum || 0,
      observedTrajectory: input.opportunityScore || 0,
    }),
    surveillance: regionalSurveillanceEngine({
      source: input.source,
      timestamp: input.nowIso,
      freshness: input.freshnessScore,
      confidence: input.confidenceScore,
      governanceState: input.governanceState,
      evidenceLineage: input.evidenceLineage,
      corridorGrowth: input.marketMomentum || 0,
      municipalMomentum: input.districtHeat || 0,
    }),
    regionMonitor: strategicRegionMonitor({
      source: input.source,
      timestamp: input.nowIso,
      freshness: input.freshnessScore,
      confidence: input.confidenceScore,
      governanceState: input.governanceState,
      evidenceLineage: input.evidenceLineage,
      strategicScore: input.marketMomentum || 0,
    }),
    municipalityPressure: municipalityPressureMonitor({
      source: input.source,
      timestamp: input.nowIso,
      freshness: input.freshnessScore,
      confidence: input.confidenceScore,
      governanceState: input.governanceState,
      evidenceLineage: input.evidenceLineage,
      permitBacklog: input.districtHeat || 0,
      policyVolatility: input.volatileScore || 0,
    }),
    infrastructureMomentum: infrastructureMomentumMonitor({
      source: input.source,
      timestamp: input.nowIso,
      freshness: input.freshnessScore,
      confidence: input.confidenceScore,
      governanceState: input.governanceState,
      evidenceLineage: input.evidenceLineage,
      projectActivation: input.marketMomentum || 0,
      fundingMomentum: input.opportunityScore || 0,
    }),
    transformationAcceleration: transformationAccelerationMonitor({
      source: input.source,
      timestamp: input.nowIso,
      freshness: input.freshnessScore,
      confidence: input.confidenceScore,
      governanceState: input.governanceState,
      evidenceLineage: input.evidenceLineage,
      baselineIndex: input.marketMomentum || 0,
      currentIndex: input.opportunityScore || 0,
    }),
  };

  const prioritization = {
    crossSignal: crossSignalPrioritizationEngine({
      source: input.source,
      timestamp: input.nowIso,
      freshness: input.freshnessScore,
      confidence: input.confidenceScore,
      governanceState: input.governanceState,
      evidenceLineage: input.evidenceLineage,
      watchlistScore: watchlist.investor.score,
      feedScore: feeds.unified.confidence,
      portfolioScore: portfolio.intelligence.score,
    }),
    strategicConfidence: strategicConfidenceScoring({
      source: input.source,
      timestamp: input.nowIso,
      freshness: input.freshnessScore,
      confidence: input.confidenceScore,
      governanceState: input.governanceState,
      evidenceLineage: input.evidenceLineage,
      corroborationCount: input.evidenceLineage.length,
    }),
    investorQueue: investorPriorityQueue({
      source: input.source,
      timestamp: input.nowIso,
      freshness: input.freshnessScore,
      confidence: input.confidenceScore,
      governanceState: input.governanceState,
      evidenceLineage: input.evidenceLineage,
      items: [
        { id: 'priority_momentum', priorityScore: input.marketMomentum || 0 },
        { id: 'priority_opportunity', priorityScore: input.opportunityScore || 0 },
      ],
    }),
    drift: priorityDriftMonitor({
      source: input.source,
      timestamp: input.nowIso,
      freshness: input.freshnessScore,
      confidence: input.confidenceScore,
      governanceState: input.governanceState,
      evidenceLineage: input.evidenceLineage,
      expectedScore: input.marketMomentum || 0,
      observedScore: input.opportunityScore || 0,
    }),
    intelligenceImportance: intelligenceImportanceScorer({
      source: input.source,
      timestamp: input.nowIso,
      freshness: input.freshnessScore,
      confidence: input.confidenceScore,
      governanceState: input.governanceState,
      evidenceLineage: input.evidenceLineage,
      impactScore: input.opportunityScore || 0,
      urgencyScore: input.marketMomentum || 0,
    }),
    regionalCriticality: regionalCriticalityEngine({
      source: input.source,
      timestamp: input.nowIso,
      freshness: input.freshnessScore,
      confidence: input.confidenceScore,
      governanceState: input.governanceState,
      evidenceLineage: input.evidenceLineage,
      regionalPressure: input.marketMomentum || 0,
      infrastructureStress: input.districtHeat || 0,
    }),
    strategicUrgency: strategicUrgencyClassifier({
      source: input.source,
      timestamp: input.nowIso,
      freshness: input.freshnessScore,
      confidence: input.confidenceScore,
      governanceState: input.governanceState,
      evidenceLineage: input.evidenceLineage,
      momentum: input.marketMomentum || 0,
      divergence: Math.abs((input.marketMomentum || 0) - (input.opportunityScore || 0)),
    }),
    opportunityMatrix: opportunityPriorityMatrix({
      source: input.source,
      timestamp: input.nowIso,
      freshness: input.freshnessScore,
      confidence: input.confidenceScore,
      governanceState: input.governanceState,
      evidenceLineage: input.evidenceLineage,
      opportunityScore: input.opportunityScore || 0,
      riskScore: input.volatileScore || 0,
    }),
  };

  const autonomyEnvelope = operationalAutonomyEnvelope({
    source: input.source,
    timestamp: input.nowIso,
    freshness: input.freshnessScore,
    confidence: input.confidenceScore,
    governanceState: input.governanceState,
    evidenceLineage: input.evidenceLineage,
    queueDepth: prioritization.investorQueue.queueDepth,
    restricted: input.governanceState !== 'ALLOW',
    suppression: input.suppression,
    monitoringState: input.marketMomentum >= 70 ? 'HIGH_ACTIVITY' : input.marketMomentum >= 45 ? 'ACTIVE_MONITORING' : 'WATCH',
    anomalyScore: input.volatileScore || 0,
    opportunityScore: input.opportunityScore || 0,
  });

  const escalationQueue = governedAutoEscalationQueue({
    source: input.source,
    timestamp: input.nowIso,
    freshness: input.freshnessScore,
    confidence: input.confidenceScore,
    governanceState: input.governanceState,
    evidenceLineage: input.evidenceLineage,
    blocked: input.suppression,
    escalations: [
      { id: 'municipal', severity: municipalShiftEscalation({
        source: input.source,
        timestamp: input.nowIso,
        freshness: input.freshnessScore,
        confidence: input.confidenceScore,
        governanceState: input.governanceState,
        evidenceLineage: input.evidenceLineage,
        shiftScore: input.marketMomentum || 0,
      }).escalation },
      { id: 'infrastructure', severity: infrastructureEscalationEngine({
        source: input.source,
        timestamp: input.nowIso,
        freshness: input.freshnessScore,
        confidence: input.confidenceScore,
        governanceState: input.governanceState,
        evidenceLineage: input.evidenceLineage,
        momentumScore: input.districtHeat || 0,
      }).escalation },
      { id: 'degradation', severity: degradationEscalationEngine({
        source: input.source,
        timestamp: input.nowIso,
        freshness: input.freshnessScore,
        confidence: input.confidenceScore,
        governanceState: input.governanceState,
        evidenceLineage: input.evidenceLineage,
        degradedConnectorCount: (input.connectorStates || []).filter((c) => c.status !== 'ACTIVE').length,
        noFakeActiveProof: true,
      }).escalation },
    ],
  });

  const operations = {
    reviewQueue: autonomousReviewQueue({
      source: input.source,
      timestamp: input.nowIso,
      freshness: input.freshnessScore,
      confidence: input.confidenceScore,
      governanceState: input.governanceState,
      evidenceLineage: input.evidenceLineage,
      items: autonomyEnvelope.reviewRequired
        ? [{ id: 'autonomy-review', reason: 'governed_manual_review', priority: watchlist.investor.priority }]
        : [],
      hiddenEscalationDetected: false,
    }),
    suppression: suppressionGovernanceRegistry({
      source: input.source,
      timestamp: input.nowIso,
      freshness: input.freshnessScore,
      confidence: input.confidenceScore,
      governanceState: input.governanceState,
      evidenceLineage: input.evidenceLineage,
      activeRules: input.suppression ? [{ id: 'suppression-rule', reason: 'governance_restriction', expiresAt: input.nowIso }] : [],
    }),
    cadenceAudit: cadenceExecutionAudit({
      source: input.source,
      timestamp: input.nowIso,
      freshness: input.freshnessScore,
      confidence: input.confidenceScore,
      governanceState: input.governanceState,
      evidenceLineage: input.evidenceLineage,
      expectedRuns: 1,
      completedRuns: autonomyEnvelope.scheduler.scheduled ? 1 : 0,
    }),
    degradation: staleConnectorDegradationVisibility({
      source: input.source,
      timestamp: input.nowIso,
      freshness: input.freshnessScore,
      confidence: input.confidenceScore,
      governanceState: input.governanceState,
      evidenceLineage: input.evidenceLineage,
      staleConnectors: (input.connectorStates || [])
        .filter((c) => c.freshnessState === 'STALE' || c.status !== 'ACTIVE')
        .map((c) => c.connectorKey || 'unknown_connector'),
    }),
  };

  const controlPanel = investorOpsControlPanel({
    source: input.source,
    timestamp: input.nowIso,
    freshness: input.freshnessScore,
    confidence: input.confidenceScore,
    governanceState: input.governanceState,
    evidenceLineage: input.evidenceLineage,
    reviewQueueDepth: operations.reviewQueue.queueDepth,
    suppressionActive: operations.suppression.activeCount > 0,
  });

  const alerts = {
    investorPriority: investorPriorityAlerts({
      source: input.source,
      timestamp: input.nowIso,
      freshness: input.freshnessScore,
      confidence: input.confidenceScore,
      governanceState: input.governanceState,
      evidenceLineage: input.evidenceLineage,
      investorPriority: watchlist.investor.priority,
      suppressed: input.suppression,
    }),
    municipalShift: municipalShiftEscalation({
      source: input.source,
      timestamp: input.nowIso,
      freshness: input.freshnessScore,
      confidence: input.confidenceScore,
      governanceState: input.governanceState,
      evidenceLineage: input.evidenceLineage,
      shiftScore: input.marketMomentum || 0,
    }),
    infrastructure: infrastructureEscalationEngine({
      source: input.source,
      timestamp: input.nowIso,
      freshness: input.freshnessScore,
      confidence: input.confidenceScore,
      governanceState: input.governanceState,
      evidenceLineage: input.evidenceLineage,
      momentumScore: input.districtHeat || 0,
    }),
    degradation: degradationEscalationEngine({
      source: input.source,
      timestamp: input.nowIso,
      freshness: input.freshnessScore,
      confidence: input.confidenceScore,
      governanceState: input.governanceState,
      evidenceLineage: input.evidenceLineage,
      degradedConnectorCount: operations.degradation.staleConnectorCount,
      noFakeActiveProof: true,
    }),
  };

  return {
    source: input.source,
    timestamp: input.nowIso,
    freshness: input.freshnessScore,
    confidence: input.confidenceScore,
    governanceState: input.governanceState,
    evidenceLineage: input.evidenceLineage,
    inferenceLevel: 'inferred',
    deterministic: true,
    autonomy: autonomyEnvelope,
    watchlist,
    feeds,
    portfolio,
    strategic,
    prioritization: {
      ...prioritization,
      governedEscalationQueue: escalationQueue,
    },
    operations: {
      ...operations,
      controlPanel,
    },
    alerts,
    adminVisibility: {
      governedEscalationVisible: true,
      reviewQueueVisible: true,
      suppressionVisible: true,
      cadenceVisible: true,
      degradationVisible: true,
    },
    policy: {
      noFabrication: true,
      noMunicipalityApprovalClaims: true,
      sourceRequired: true,
      deterministicOnly: true,
    },
  };
}
