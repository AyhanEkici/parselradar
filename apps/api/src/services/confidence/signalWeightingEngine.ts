export function calculateSignalWeighting(input: {
  positiveSignals?: string[];
  riskSignals?: string[];
  verifiedSignals?: number;
  inferredSignals?: number;
}) {
  const positives = input.positiveSignals?.length || 0;
  const risks = input.riskSignals?.length || 0;
  const verified = input.verifiedSignals || 0;
  const inferred = input.inferredSignals || 0;

  const raw = 50 + positives * 4 - risks * 5 + verified * 6 - inferred * 2;
  const score = Math.max(0, Math.min(100, raw));

  return {
    score,
    spread: {
      positives,
      risks,
      verified,
      inferred,
    },
  };
}
