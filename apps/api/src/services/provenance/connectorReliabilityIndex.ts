export function connectorReliabilityIndex(input: {
  successCount: number;
  failCount: number;
  staleCount: number;
  rateLimitedCount: number;
}) {
  const total = Math.max(1, input.successCount + input.failCount + input.staleCount + input.rateLimitedCount);
  const reliability = Math.max(
    0,
    Math.min(100, Math.round(((input.successCount * 1.0 + input.staleCount * 0.4) / total) * 100 - input.rateLimitedCount * 4))
  );

  return {
    reliability,
    label: reliability >= 80 ? 'HIGH' : reliability >= 55 ? 'MEDIUM' : 'LOW',
  };
}
