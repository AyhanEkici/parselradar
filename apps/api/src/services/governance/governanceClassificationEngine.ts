import { GovernanceClassification } from './governanceTypes';

export function classifyGovernance(params: {
  evidenceStrength: 'VERY_WEAK' | 'WEAK' | 'MODERATE' | 'STRONG' | 'VERIFIED';
  confidence: number;
  missingDataImpact: number;
  speculativeSignals: number;
  unsupportedClaims: number;
}): GovernanceClassification {
  if (params.evidenceStrength === 'VERY_WEAK' || params.confidence < 35 || params.missingDataImpact >= 75) {
    return 'INSUFFICIENT_DATA';
  }
  if (params.unsupportedClaims > 0 || params.speculativeSignals >= 3) {
    return 'SPECULATIVE';
  }
  if (params.evidenceStrength === 'WEAK' || params.confidence < 60 || params.missingDataImpact >= 40) {
    return 'CAUTION';
  }
  return 'SAFE';
}
