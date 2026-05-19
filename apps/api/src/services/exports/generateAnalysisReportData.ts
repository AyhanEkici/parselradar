import { buildReportGovernanceEnvelope } from '../reporting/reportGovernanceEnvelope';
import { buildTerritorialIntelligence } from '../intelligence/buildTerritorialIntelligence';

export function generateAnalysisReportData(input: {
  property: Record<string, unknown>;
  analysis: Record<string, any>;
}) {
  const analysis = input.analysis || {};
  const governanceEnvelope =
    analysis.governanceEnvelope ||
    buildReportGovernanceEnvelope({
      score: analysis.score,
      confidence: analysis.confidence,
      summary: analysis.summary,
      recommendations: analysis.recommendations || [],
      risks: analysis.riskFlags || analysis.risks || [],
      missingInputs: analysis.missingInputs || [],
      staleFlags: analysis.staleFlags || [],
      sourceConfidence: analysis.sourceConfidence,
      freshnessScore: analysis.freshnessScore,
      trendSignals: analysis.trendSignals || [],
      opportunitySignals: analysis.opportunitySignals || [],
      analysisVersion: analysis.analysisVersion,
      reportText: analysis.summary,
    });
  const territorialIntelligence =
    analysis.territorialIntelligence ||
    buildTerritorialIntelligence({
      score: analysis.score,
      confidence: analysis.confidence,
      sourceConfidence: analysis.sourceConfidence,
      freshnessScore: analysis.freshnessScore,
      marketHeat: analysis.marketHeat,
      comparableCount: analysis.comparableCount,
      opportunityScore: analysis.opportunityScore,
      marketMomentum: analysis.marketMomentum,
      districtHeat: analysis.districtHeat,
      volatilityIndex: analysis.volatilityIndex,
      trendVelocityScore: analysis.trendVelocity?.velocityScore,
      liquidityTrendScore: analysis.liquidityTrend?.liquidityTrendScore,
      pricingDeltaRatio: analysis.pricingDeltaRatio,
      overpricingRisk: analysis.overpricingRisk,
      zoningPotential: analysis.zoningPotential,
      developmentSignals: analysis.developmentSignals,
      strategicLocationSignals: analysis.strategicLocationSignals,
      missingInputs: analysis.missingInputs,
      staleFlags: analysis.staleFlags,
      unsupportedAssumptionsCount: (governanceEnvelope.unsupportedAssumptions || []).length,
      infrastructureScore: analysis.infrastructureScore,
      roadAccessScore: analysis.roadAccessScore,
      infrastructureDistances: analysis.infrastructureDistances,
      investorSignal: analysis.investorSignal,
      regionalDemandScore: analysis.regionalDemand?.demandScore,
      riskFlags: analysis.riskFlags,
      recommendations: analysis.recommendations,
    });

  return {
    title: String(input.property?.['addressText'] || 'Property Analysis'),
    score: analysis.score || 0,
    signal: analysis.signal || '-',
    summary: analysis.summary || analysis.previewSummary?.summary || '-',
    intelligence: {
      sourceConfidence: analysis.sourceConfidence || 'low',
      freshnessScore: analysis.freshnessScore || 0,
      analysisVersion: analysis.analysisVersion || '-',
    },
    territorialIntelligence,
    governance: governanceEnvelope,
    ingestionGovernance: analysis.ingestionGovernance || null,
    ingestionCompliance: analysis.ingestionCompliance || null,
    ingestionTrust: analysis.ingestionTrust || null,
    noFakeActiveProof: analysis.noFakeActiveProof,
    operationalIntelligence: analysis.operationalIntelligence || null,
    autonomyIntelligence: analysis.autonomyIntelligence || null,
    recommendations: analysis.recommendations || [],
    generatedAt: new Date().toISOString(),
  };
}
