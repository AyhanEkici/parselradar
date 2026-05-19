export function calculateConfidencePenalty(input: {
  missingDataImpact: number;
  staleData: boolean;
  speculativeSignals: number;
  unsupportedClaims: number;
}): { totalPenalty: number; reasons: string[] } {
  const reasons: string[] = [];
  let totalPenalty = Math.round(input.missingDataImpact * 0.45);

  if (input.staleData) {
    totalPenalty += 12;
    reasons.push('Stale data reduced confidence.');
  }
  if (input.speculativeSignals > 0) {
    totalPenalty += input.speculativeSignals * 5;
    reasons.push('Speculative assumptions detected.');
  }
  if (input.unsupportedClaims > 0) {
    totalPenalty += input.unsupportedClaims * 9;
    reasons.push('Unsupported claims detected.');
  }

  return { totalPenalty: Math.max(0, Math.min(95, totalPenalty)), reasons };
}
