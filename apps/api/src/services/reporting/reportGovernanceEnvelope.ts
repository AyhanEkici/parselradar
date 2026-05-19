import { classifyGovernance } from '../governance/governanceClassificationEngine';
import { classifyEvidenceStrength } from '../governance/evidenceStrengthClassifier';
import { generateReportDisclosure } from '../governance/reportDisclosureGenerator';
import { calculateClientTrustScore } from '../governance/clientTrustScore';
import { GovernanceContext } from '../governance/governanceTypes';
import { buildSourceProvenanceRegistry } from '../provenance/sourceProvenanceRegistry';
import { buildEvidenceTrace } from '../provenance/evidenceTraceBuilder';
import { evaluateDataFreshness } from '../provenance/dataFreshnessEvaluator';
import { calculateMissingDataImpact } from '../confidence/missingDataImpactCalculator';
import { calculateSignalWeighting } from '../confidence/signalWeightingEngine';
import { calculateConfidencePenalty } from '../confidence/confidencePenaltyEngine';
import { buildConfidenceScore } from '../confidence/confidenceScoreEngine';
import { detectSpeculativeRisk } from '../risk/speculativeRiskDetector';
import { detectUnsupportedClaims } from '../risk/unsupportedClaimDetector';
import { generateLegalDisclosures } from '../disclosure/legalDisclosureGenerator';
import { classifyCompliance } from '../compliance/complianceClassificationEngine';
import { buildReportEvidenceSummary } from './reportEvidenceSummary';
import { buildReportConfidenceSummary } from './reportConfidenceSummary';
import { buildReportDisclosureSummary } from './reportDisclosureSummary';

export function buildReportGovernanceEnvelope(context: GovernanceContext) {
  const provenanceSources = buildSourceProvenanceRegistry(context);
  const evidenceStrength = classifyEvidenceStrength(provenanceSources);
  const freshness = evaluateDataFreshness({ freshnessScore: context.freshnessScore });
  const missingImpact = calculateMissingDataImpact({
    missingInputs: context.missingInputs,
    staleFlags: context.staleFlags,
    hasPlanningData: !(context.missingInputs || []).some((x) => x.toLowerCase().includes('zoning')),
    weakComparables: (context.opportunitySignals || []).length < 2,
  });

  const speculativeRisk = detectSpeculativeRisk({
    recommendations: context.recommendations,
    trendSignals: context.trendSignals,
    staleFlags: context.staleFlags,
  });

  const unsupportedClaims = detectUnsupportedClaims([
    context.summary || '',
    ...(context.recommendations || []),
    context.reportText || '',
  ]);

  const signalWeight = calculateSignalWeighting({
    positiveSignals: context.opportunitySignals,
    riskSignals: context.risks,
    verifiedSignals: provenanceSources.filter((s) => s.state === 'verified').length,
    inferredSignals: provenanceSources.filter((s) => s.state === 'inferred').length,
  });

  const penalty = calculateConfidencePenalty({
    missingDataImpact: missingImpact.score,
    staleData: freshness.freshnessBand === 'stale',
    speculativeSignals: speculativeRisk.speculativeSignals.length,
    unsupportedClaims: unsupportedClaims.count,
  });

  const confidence = buildConfidenceScore({
    baseConfidence: Number(context.confidence || 0),
    signalWeightScore: signalWeight.score,
    penalty: penalty.totalPenalty,
    freshnessScore: freshness.freshnessScore,
  });

  const governance = classifyGovernance({
    evidenceStrength,
    confidence: confidence.score,
    missingDataImpact: missingImpact.score,
    speculativeSignals: speculativeRisk.speculativeSignals.length,
    unsupportedClaims: unsupportedClaims.count,
  });

  const disclosure = generateReportDisclosure({
    governance,
    prohibitedClaims: unsupportedClaims.count,
    missingInputs: context.missingInputs || [],
  });

  const compliance = classifyCompliance({
    unsupportedClaimCount: unsupportedClaims.count,
    governance,
  });

  const legalDisclosures = generateLegalDisclosures({
    missingInputs: context.missingInputs,
    speculativeSignals: speculativeRisk.speculativeSignals,
    unsupportedClaimCount: unsupportedClaims.count,
  });

  const trustScore = calculateClientTrustScore({
    governance,
    confidence: confidence.score,
    evidenceStrength,
    freshnessScore: freshness.freshnessScore,
    unsupportedClaims: unsupportedClaims.count,
  });

  return {
    governanceClassification: governance,
    trustScore,
    freshness,
    evidenceTrace: buildEvidenceTrace(provenanceSources),
    evidenceSummary: buildReportEvidenceSummary(provenanceSources, evidenceStrength),
    confidenceSummary: buildReportConfidenceSummary({
      confidenceScore: confidence.score,
      confidenceClass: confidence.classification,
      penalties: penalty.reasons,
      missingDataImpact: missingImpact.score,
    }),
    disclosureSummary: buildReportDisclosureSummary({
      mode: disclosure.mode,
      lines: [...disclosure.lines, ...legalDisclosures],
      compliance,
    }),
    speculativeIndicators: speculativeRisk.speculativeSignals,
    unsupportedAssumptions: unsupportedClaims.flags,
    verificationStates: {
      verified: provenanceSources.filter((s) => s.state === 'verified').length,
      inferred: provenanceSources.filter((s) => s.state === 'inferred').length,
      estimated: provenanceSources.filter((s) => s.state === 'estimated').length,
      unavailable: provenanceSources.filter((s) => s.state === 'unavailable').length,
    },
  };
}
