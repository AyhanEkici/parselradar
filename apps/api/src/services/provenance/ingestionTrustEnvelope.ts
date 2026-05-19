import { connectorReliabilityIndex } from './connectorReliabilityIndex';

export function ingestionTrustEnvelope(input: {
  successCount: number;
  failCount: number;
  staleCount: number;
  rateLimitedCount: number;
  restrictedCount: number;
}) {
  const reliability = connectorReliabilityIndex({
    successCount: input.successCount,
    failCount: input.failCount,
    staleCount: input.staleCount,
    rateLimitedCount: input.rateLimitedCount,
  });

  const trustScore = Math.max(0, Math.min(100, reliability.reliability - input.restrictedCount * 7));

  return {
    trustScore,
    trustLabel: trustScore >= 80 ? 'TRUSTED' : trustScore >= 55 ? 'WATCH' : 'LIMITED',
    reliability,
  };
}
