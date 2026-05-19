export function buildReportConfidenceSummary(input: {
  confidenceScore: number;
  confidenceClass: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
  penalties: string[];
  missingDataImpact: number;
}) {
  return {
    score: input.confidenceScore,
    classification: input.confidenceClass,
    missingDataImpact: input.missingDataImpact,
    penaltyReasons: input.penalties,
  };
}
