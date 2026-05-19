import { operationalExecutionEnvelope } from '../execution/operationalExecutionEnvelope';
import { strategicDecisionEngine } from '../strategy/strategicDecisionEngine';
import { territorialPriorityMatrix } from '../strategy/territorialPriorityMatrix';
import { multiRegionStrategyEngine } from '../strategy/multiRegionStrategyEngine';
import { strategicPressureBalancer } from '../strategy/strategicPressureBalancer';
import { investmentDirectionEngine } from '../strategy/investmentDirectionEngine';
import { strategicOutcomeSimulator } from '../simulation/strategicOutcomeSimulator';
import { decisionConfidenceEngine } from '../decisioning/decisionConfidenceEngine';
import { evidenceWeightingEngine } from '../decisioning/evidenceWeightingEngine';
import { strategicRecommendationEngine } from '../decisioning/strategicRecommendationEngine';
import { executionRiskClassifier } from '../decisioning/executionRiskClassifier';
import { readinessClassificationEngine } from '../decisioning/readinessClassificationEngine';
import { regionalCoordinationEngine } from '../coordination/regionalCoordinationEngine';
import { investorCoordinationLayer } from '../coordination/investorCoordinationLayer';
import { municipalSignalCoordinator } from '../coordination/municipalSignalCoordinator';
import { infrastructureCoordinationEngine } from '../coordination/infrastructureCoordinationEngine';
import { strategicEscalationCoordinator } from '../coordination/strategicEscalationCoordinator';
import { operationalReadinessEngine } from '../readiness/operationalReadinessEngine';
import { territorialRiskMatrix } from '../readiness/territorialRiskMatrix';
import { strategicExposureEngine } from '../readiness/strategicExposureEngine';
import { regionalDependencyAnalyzer } from '../readiness/regionalDependencyAnalyzer';
import { executionBottleneckDetector } from '../readiness/executionBottleneckDetector';
import { strategicStateManager } from './strategicStateManager';
import { operationalSignalBus } from './operationalSignalBus';
import { intelligenceExecutionBridge } from './intelligenceExecutionBridge';
import { governedCommandEnvelope } from './governedCommandEnvelope';

export function territorialOperatingSystem(input: {
  nowIso: string;
  source: string;
  freshnessScore: number;
  confidenceScore: number;
  governanceState: string;
  evidenceLineage: unknown[];
  opportunityScore: number;
  riskScore: number;
  pressureScore: number;
  regions: Array<{ name: string; score: number }>;
  signals: string[];
  connectorDegradedCount: number;
  legalRestrictionCount: number;
  dependencyHotspots: number;
  suppression: boolean;
  dependencies: Array<{ key: string; status: string }>;
  bottlenecks: Array<{ id: string; severity: number }>;
}) {
  const base = {
    source: input.source,
    timestamp: input.nowIso,
    freshness: input.freshnessScore,
    confidence: input.confidenceScore,
    governanceState: input.governanceState,
    evidenceLineage: input.evidenceLineage,
  };

  const execution = operationalExecutionEnvelope({
    ...base,
    connectorDegradedCount: input.connectorDegradedCount,
    legalRestrictionCount: input.legalRestrictionCount,
    dependencyHotspots: input.dependencyHotspots,
    dependencyScore: Math.max(0, Math.min(100, 100 - input.dependencyHotspots * 15)),
    riskScore: input.riskScore,
    suppression: input.suppression,
  });

  const strategyDirection = investmentDirectionEngine({ ...base, directionScore: input.opportunityScore });
  const pressure = strategicPressureBalancer({ ...base, municipalPressure: input.pressureScore, infrastructurePressure: input.riskScore, investorPressure: input.opportunityScore });
  const decision = strategicDecisionEngine({ ...base, directionScore: input.opportunityScore, pressureScore: pressure.pressureScore });
  const priority = territorialPriorityMatrix({ ...base, readinessScore: execution.intelligence.readiness.readinessScore, opportunityScore: input.opportunityScore, riskScore: input.riskScore });
  const regions = multiRegionStrategyEngine({ ...base, regions: input.regions || [] });

  const simulation = strategicOutcomeSimulator({
    ...base,
    zoningSignal: input.opportunityScore,
    infrastructureScore: input.pressureScore,
    demographicPressure: input.riskScore,
    growthSignal: input.opportunityScore,
  });

  const risk = executionRiskClassifier({ ...base, riskScore: input.riskScore });
  const confidence = decisionConfidenceEngine({ ...base, supportScore: decision.decisionScore, conflictScore: input.riskScore });
  const evidence = evidenceWeightingEngine({ ...base, sourceCount: input.evidenceLineage.length || 1, verifiedCount: Math.max(1, Math.round((input.confidenceScore / 100) * (input.evidenceLineage.length || 1))) });
  const recommendation = strategicRecommendationEngine({ ...base, decisionConfidenceScore: confidence.decisionConfidenceScore, executionRiskScore: risk.executionRiskScore });
  const readiness = readinessClassificationEngine({ ...base, readinessScore: execution.intelligence.readiness.readinessScore });

  const regionalCoordination = regionalCoordinationEngine({ ...base, activeRegions: (input.regions || []).length, dependentRegions: input.dependencies.length });
  const investorCoordination = investorCoordinationLayer({ ...base, investorQueueDepth: input.dependencyHotspots, handoffCount: Math.max(1, Math.round(input.opportunityScore / 20)) });
  const municipalCoordination = municipalSignalCoordinator({ ...base, municipalSignalCount: Math.max(0, Math.round(input.pressureScore / 12)), certaintyLevel: 'UNVERIFIED' });
  const infrastructureCoordination = infrastructureCoordinationEngine({ ...base, infrastructureDependencies: input.dependencies.length, bottlenecks: input.bottlenecks.length });
  const escalation = strategicEscalationCoordinator({ ...base, escalationEvents: input.bottlenecks.length, hiddenEscalationDetected: false });

  const readinessEnvelope = operationalReadinessEngine({ ...base, readinessScore: execution.intelligence.readiness.readinessScore });
  const riskMatrix = territorialRiskMatrix({ ...base, exposureRisk: input.riskScore, dependencyRisk: input.dependencyHotspots * 12, executionRisk: risk.executionRiskScore });
  const exposure = strategicExposureEngine({ ...base, concentration: input.opportunityScore, volatility: input.riskScore });
  const dependencies = regionalDependencyAnalyzer({ ...base, dependencies: input.dependencies || [] });
  const bottlenecks = executionBottleneckDetector({ ...base, bottlenecks: input.bottlenecks || [] });

  const state = strategicStateManager({ ...base, readinessScore: readinessEnvelope.readinessScore, pressureScore: pressure.pressureScore });
  const signalBus = operationalSignalBus({ ...base, signals: input.signals || [] });
  const bridge = intelligenceExecutionBridge({ ...base, recommendation: recommendation.recommendation, readiness: readiness.readinessClassification });
  const command = governedCommandEnvelope({ ...base, command: recommendation.recommendation, readiness: readiness.readinessClassification });

  return {
    source: input.source,
    timestamp: input.nowIso,
    freshness: input.freshnessScore,
    confidence: input.confidenceScore,
    governanceState: input.governanceState,
    evidenceLineage: input.evidenceLineage,
    inferenceLevel: 'inferred',
    executionReadiness: readiness.readinessClassification,
    deterministic: true,
    execution,
    strategy: { decision, priority, regions, pressure, direction: strategyDirection },
    simulation,
    decisioning: { confidence, evidence, recommendation, risk, readiness },
    coordination: { regionalCoordination, investorCoordination, municipalCoordination, infrastructureCoordination, escalation },
    readiness: { readinessEnvelope, riskMatrix, exposure, dependencies, bottlenecks },
    operatingSystem: { state, signalBus, bridge, command },
    policy: {
      noFakeExecutionCertainty: true,
      noInvestmentGuarantee: true,
      noFabricatedMunicipalityCertainty: true,
      noHiddenAutonomousEscalation: true,
      noUncontrolledExecutionAuthority: true,
      humanGovernedExecutionOnly: true,
      deterministicOnly: true,
    },
  };
}
