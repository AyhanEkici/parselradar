import { GovernanceClassification } from './governanceTypes';

export function calculateClientTrustScore(input: {
  governance: GovernanceClassification;
  confidence: number;
  evidenceStrength: 'VERY_WEAK' | 'WEAK' | 'MODERATE' | 'STRONG' | 'VERIFIED';
  freshnessScore: number;
  unsupportedClaims: number;
}): number {
  const governanceBase =
    input.governance === 'SAFE' ? 84 : input.governance === 'CAUTION' ? 63 : input.governance === 'SPECULATIVE' ? 38 : 24;
  const evidenceBonus =
    input.evidenceStrength === 'VERIFIED'
      ? 10
      : input.evidenceStrength === 'STRONG'
      ? 7
      : input.evidenceStrength === 'MODERATE'
      ? 3
      : 0;
  const unsupportedPenalty = input.unsupportedClaims * 8;
  const confidenceInfluence = Math.round((Math.max(0, Math.min(100, input.confidence)) - 50) * 0.22);
  const freshnessInfluence = Math.round((Math.max(0, Math.min(100, input.freshnessScore)) - 50) * 0.16);

  return Math.max(0, Math.min(100, governanceBase + evidenceBonus + confidenceInfluence + freshnessInfluence - unsupportedPenalty));
}
