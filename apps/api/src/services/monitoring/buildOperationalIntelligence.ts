import { territorialMonitoringEngine } from './territorialMonitoringEngine';
import { governedRefreshOrchestrator } from './governedRefreshOrchestrator';
import { sourceChangeDetector } from './sourceChangeDetector';
import { connectorDriftDetector } from './connectorDriftDetector';
import { regionalActivityMonitor } from './regionalActivityMonitor';
import { parcelEvolutionTimeline } from '../timeline/parcelEvolutionTimeline';
import { zoningChangeHistory } from '../timeline/zoningChangeHistory';
import { regionalTransformationTracker } from '../timeline/regionalTransformationTracker';
import { settlementGrowthTimeline } from '../timeline/settlementGrowthTimeline';
import { infrastructureExpansionHistory } from '../timeline/infrastructureExpansionHistory';
import { speculativeAnomalyDetector } from '../anomaly/speculativeAnomalyDetector';
import { abnormalPricingMovement } from '../anomaly/abnormalPricingMovement';
import { suspiciousMarketVelocity } from '../anomaly/suspiciousMarketVelocity';
import { inconsistentPlanningSignalDetector } from '../anomaly/inconsistentPlanningSignalDetector';
import { artificialDemandSpikeDetector } from '../anomaly/artificialDemandSpikeDetector';
import { strategicOpportunityEngine } from '../opportunities/strategicOpportunityEngine';
import { undervaluedClusterDetector } from '../opportunities/undervaluedClusterDetector';
import { infrastructureUpsideOpportunity } from '../opportunities/infrastructureUpsideOpportunity';
import { municipalityExpansionOpportunity } from '../opportunities/municipalityExpansionOpportunity';
import { developerPressureOpportunity } from '../opportunities/developerPressureOpportunity';
import { investorAlertEngine } from '../alerts/investorAlertEngine';
import { zoningChangeAlert } from '../alerts/zoningChangeAlert';
import { infrastructureAnnouncementAlert } from '../alerts/infrastructureAnnouncementAlert';
import { speculativeHeatAlert } from '../alerts/speculativeHeatAlert';
import { territorialShiftAlert } from '../alerts/territorialShiftAlert';
import { historicalEvidenceArchive } from '../history/historicalEvidenceArchive';
import { regionalEvolutionForecast } from '../history/regionalEvolutionForecast';
import { parcelTransformationForecast } from '../history/parcelTransformationForecast';
import { infrastructurePressureForecast } from '../history/infrastructurePressureForecast';
import { municipalDirectionForecast } from '../history/municipalDirectionForecast';

function toNumber(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeGovernanceState(state?: string) {
  return state === 'ALLOW' ? 'ALLOW' : 'RESTRICTED';
}

export function buildOperationalIntelligence(input: {
  nowIso: string;
  propertyId: string;
  source?: string;
  freshnessScore?: number;
  confidenceScore?: number;
  evidenceLineage?: unknown[];
  governanceState?: string;
  ingestionSignals?: string[];
  trendSignals?: string[];
  staleFlags?: string[];
  connectorStates?: Array<{ connectorKey?: string; status?: string; freshnessState?: string }>;
  historicalRecords?: Array<{ at: string; source: string; label: string; value?: unknown }>;
  pricingDeltaRatio?: number;
  velocityScore?: number;
  liquidityScore?: number;
  speculativeHeat?: number;
  planningSignals?: string[];
  demandSeries?: number[];
  opportunityScore?: number;
  clusterStrength?: number;
  infrastructurePressure?: number;
  roadAccessScore?: number;
  municipalitySignalCount?: number;
  planningProbability?: number;
  developerInterest?: number;
  shiftScore?: number;
  growthScore?: number;
  developmentProbability?: number;
  pressureScore?: number;
  municipalitySignalScore?: number;
  suppression?: boolean;
}) {
  const source = input.source || 'operational_intelligence_v27';
  const freshness = Math.max(0, Math.min(100, toNumber(input.freshnessScore, 0)));
  const confidence = Math.max(0, Math.min(100, toNumber(input.confidenceScore, 0)));
  const governanceState = normalizeGovernanceState(input.governanceState);
  const evidenceLineage = input.evidenceLineage || [];
  const history = (input.historicalRecords || []).slice().sort((a, b) => a.at.localeCompare(b.at));

  const activityScore = Math.max(
    0,
    Math.min(
      100,
      (input.ingestionSignals || []).length * 6 +
        (input.trendSignals || []).length * 4 +
        (input.staleFlags || []).length * 8 +
        (input.connectorStates || []).filter((x) => String(x.status || '').toUpperCase() === 'ACTIVE').length * 10
    )
  );

  const monitoring = territorialMonitoringEngine({
    source,
    timestamp: input.nowIso,
    freshness,
    confidence,
    evidenceLineage,
    governanceState,
    activityScore,
  });

  const refresh = governedRefreshOrchestrator({
    source,
    state: monitoring.state,
    freshnessScore: freshness,
    governanceState,
    suppression: input.suppression,
  });

  const sourceChange = sourceChangeDetector({
    source,
    timestamp: input.nowIso,
    freshness,
    confidence,
    governanceState,
    evidenceLineage,
    previousHash: history.length > 1 ? Buffer.from(JSON.stringify(history.slice(0, -1))).toString('hex').slice(0, 24) : '',
    currentHash: Buffer.from(JSON.stringify(history)).toString('hex').slice(0, 24),
  });

  const connectorDrift = connectorDriftDetector({
    source,
    timestamp: input.nowIso,
    freshness,
    confidence,
    governanceState,
    evidenceLineage,
    baselineStatus: (input.connectorStates || []).map((x) => x.status || 'UNKNOWN').sort().join('|') || 'UNKNOWN',
    currentStatus: (input.connectorStates || []).map((x) => `${x.status || 'UNKNOWN'}:${x.freshnessState || 'UNKNOWN'}`).sort().join('|') || 'UNKNOWN',
  });

  const activity = regionalActivityMonitor({
    source,
    timestamp: input.nowIso,
    freshness,
    confidence,
    evidenceLineage,
    governanceState,
    changeCount: history.length,
    alertCount: (input.trendSignals || []).length,
  });

  const parcelTimeline = parcelEvolutionTimeline({
    source,
    timestamp: input.nowIso,
    freshness,
    confidence,
    evidenceLineage,
    governanceState,
    events: history.map((h) => ({ at: h.at, label: h.label, source: h.source })),
  });

  const zoningHistory = zoningChangeHistory({
    source,
    timestamp: input.nowIso,
    freshness,
    confidence,
    evidenceLineage,
    governanceState,
    references: history.map((h) => ({ at: h.at, zoneCode: String(h.label || '-'), source: h.source })),
  });

  const regionalTransformation = regionalTransformationTracker({
    source,
    timestamp: input.nowIso,
    freshness,
    confidence,
    evidenceLineage,
    governanceState,
    indicators: [
      { key: 'activity', score: activity.activityScore },
      { key: 'monitoring', score: activity.activityScore },
      { key: 'freshness', score: freshness },
    ],
  });

  const settlementGrowth = settlementGrowthTimeline({
    source,
    timestamp: input.nowIso,
    freshness,
    confidence,
    evidenceLineage,
    governanceState,
    periodScores: history.map((h, idx) => ({ period: `${idx}`, score: toNumber(h.value, idx * 10) })),
  });

  const infrastructureHistory = infrastructureExpansionHistory({
    source,
    timestamp: input.nowIso,
    freshness,
    confidence,
    evidenceLineage,
    governanceState,
    projects: history.map((h) => ({ at: h.at, project: h.label, status: 'announced', source: h.source })),
  });

  const speculativeAnomaly = speculativeAnomalyDetector({
    source,
    timestamp: input.nowIso,
    freshness,
    confidence,
    evidenceLineage,
    governanceState,
    speculativeHeat: toNumber(input.speculativeHeat, 0),
    unsupportedAssumptions: Math.max(0, (input.staleFlags || []).length - 1),
  });

  const pricingAnomaly = abnormalPricingMovement({
    source,
    timestamp: input.nowIso,
    freshness,
    confidence,
    evidenceLineage,
    governanceState,
    deltaRatio: toNumber(input.pricingDeltaRatio, 0),
  });

  const velocityAnomaly = suspiciousMarketVelocity({
    source,
    timestamp: input.nowIso,
    freshness,
    confidence,
    evidenceLineage,
    governanceState,
    velocityScore: toNumber(input.velocityScore, 0),
    liquidityScore: toNumber(input.liquidityScore, 0),
  });

  const planningAnomaly = inconsistentPlanningSignalDetector({
    source,
    timestamp: input.nowIso,
    freshness,
    confidence,
    evidenceLineage,
    governanceState,
    planSignals: input.planningSignals || [],
  });

  const demandAnomaly = artificialDemandSpikeDetector({
    source,
    timestamp: input.nowIso,
    freshness,
    confidence,
    evidenceLineage,
    governanceState,
    demandSeries: input.demandSeries || [],
  });

  const anomalyPenalty =
    (speculativeAnomaly.level === 'CRITICAL' ? 20 : speculativeAnomaly.level === 'HIGH' ? 12 : speculativeAnomaly.level === 'MODERATE' ? 6 : 0) +
    (pricingAnomaly.level === 'CRITICAL' ? 12 : pricingAnomaly.level === 'HIGH' ? 8 : pricingAnomaly.level === 'MODERATE' ? 4 : 0);

  const strategicOpportunity = strategicOpportunityEngine({
    source,
    timestamp: input.nowIso,
    freshness,
    confidence,
    evidenceLineage,
    governanceState,
    opportunityScore: toNumber(input.opportunityScore, 0),
    anomalyPenalty,
  });

  const undervaluedCluster = undervaluedClusterDetector({
    source,
    timestamp: input.nowIso,
    freshness,
    confidence,
    evidenceLineage,
    governanceState,
    valuationGapPct: Math.max(0, toNumber(input.opportunityScore, 0) - 30),
    clusterStrength: toNumber(input.clusterStrength, 0),
  });

  const infrastructureUpside = infrastructureUpsideOpportunity({
    source,
    timestamp: input.nowIso,
    freshness,
    confidence,
    evidenceLineage,
    governanceState,
    infrastructurePressure: toNumber(input.infrastructurePressure, 0),
    roadAccessScore: toNumber(input.roadAccessScore, 0),
  });

  const municipalityExpansion = municipalityExpansionOpportunity({
    source,
    timestamp: input.nowIso,
    freshness,
    confidence,
    evidenceLineage,
    governanceState,
    municipalitySignals: toNumber(input.municipalitySignalCount, 0),
    planningProbability: toNumber(input.planningProbability, 0),
  });

  const developerPressure = developerPressureOpportunity({
    source,
    timestamp: input.nowIso,
    freshness,
    confidence,
    evidenceLineage,
    governanceState,
    developerInterest: toNumber(input.developerInterest, 0),
    liquidityScore: toNumber(input.liquidityScore, 0),
  });

  const investorAlert = investorAlertEngine({
    source,
    timestamp: input.nowIso,
    freshness,
    confidence,
    evidenceLineage,
    governanceState,
    alertScore: Math.max(0, Math.min(100, anomalyPenalty + activity.activityScore * 0.7)),
    suppressed: Boolean(input.suppression),
  });

  const zoningAlert = zoningChangeAlert({
    source,
    timestamp: input.nowIso,
    freshness,
    confidence,
    evidenceLineage,
    governanceState,
    zoningChanged: sourceChange.changed,
  });

  const infrastructureAlert = infrastructureAnnouncementAlert({
    source,
    timestamp: input.nowIso,
    freshness,
    confidence,
    evidenceLineage,
    governanceState,
    announcementCount: history.length,
  });

  const speculativeAlert = speculativeHeatAlert({
    source,
    timestamp: input.nowIso,
    freshness,
    confidence,
    evidenceLineage,
    governanceState,
    speculativeHeat: toNumber(input.speculativeHeat, 0),
  });

  const shiftAlert = territorialShiftAlert({
    source,
    timestamp: input.nowIso,
    freshness,
    confidence,
    evidenceLineage,
    governanceState,
    shiftScore: toNumber(input.shiftScore, 0),
  });

  const archive = historicalEvidenceArchive({
    source,
    timestamp: input.nowIso,
    freshness,
    confidence,
    evidenceLineage,
    governanceState,
    records: history,
  });

  const regionalForecast = regionalEvolutionForecast({
    source,
    timestamp: input.nowIso,
    freshness,
    confidence,
    evidenceLineage,
    governanceState,
    growthScore: toNumber(input.growthScore, activity.activityScore),
  });

  const parcelForecast = parcelTransformationForecast({
    source,
    timestamp: input.nowIso,
    freshness,
    confidence,
    evidenceLineage,
    governanceState,
    planningProbability: toNumber(input.planningProbability, 0),
    developmentProbability: toNumber(input.developmentProbability, 0),
  });

  const infrastructureForecast = infrastructurePressureForecast({
    source,
    timestamp: input.nowIso,
    freshness,
    confidence,
    evidenceLineage,
    governanceState,
    pressureScore: toNumber(input.pressureScore, toNumber(input.infrastructurePressure, 0)),
  });

  const municipalForecast = municipalDirectionForecast({
    source,
    timestamp: input.nowIso,
    freshness,
    confidence,
    evidenceLineage,
    governanceState,
    municipalitySignalScore: toNumber(input.municipalitySignalScore, toNumber(input.municipalitySignalCount, 0) * 15),
  });

  return {
    source,
    timestamp: input.nowIso,
    freshness,
    confidence,
    evidenceLineage,
    governanceState,
    monitoring,
    refresh,
    sourceChange,
    connectorDrift,
    regionalActivity: activity,
    parcelTimeline,
    zoningHistory,
    regionalTransformation,
    settlementGrowth,
    infrastructureHistory,
    anomalies: {
      speculativeAnomaly,
      pricingAnomaly,
      velocityAnomaly,
      planningAnomaly,
      demandAnomaly,
    },
    opportunities: {
      strategicOpportunity,
      undervaluedCluster,
      infrastructureUpside,
      municipalityExpansion,
      developerPressure,
    },
    alerts: {
      investorAlert,
      zoningAlert,
      infrastructureAlert,
      speculativeAlert,
      shiftAlert,
    },
    history: {
      archive,
      regionalForecast,
      parcelForecast,
      infrastructureForecast,
      municipalForecast,
    },
    adminControls: {
      alertGovernance: true,
      alertSuppression: Boolean(input.suppression),
      sourceReliabilityDowngrade: freshness < 60,
      anomalyReviewQueue: [speculativeAnomaly.level, pricingAnomaly.level, velocityAnomaly.level].filter((x) => x !== 'NONE'),
      temporalEvidenceReview: archive.retainedCount,
      refreshCadenceVisibility: refresh.action,
      regionalActivityMonitoring: activity.state,
      staleIntelligenceVisibility: freshness < 55,
    },
    deterministic: true,
    noFabricatedHistory: archive.noFabricatedHistory,
    noInvestmentGuarantee: true,
  };
}
