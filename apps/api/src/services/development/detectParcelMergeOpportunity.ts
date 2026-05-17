import { PARCEL_MERGE_RULES, MERGE_OPPORTUNITY_SIGNALS } from '../../config/development/parcelMergeRules';

export type ParcelMergeOpportunity = {
  opportunity: boolean;
  score: number;
  signals: string[];
  message: string;
};

export function detectParcelMergeOpportunity(input: {
  areaM2?: number;
  district?: string;
  zoning?: string;
  infraScore?: number;
}): ParcelMergeOpportunity {
  const areaM2 = input.areaM2 || 0;
  const infraScore = input.infraScore || 50;

  const signals: string[] = [];
  let score = 0;

  if (areaM2 >= PARCEL_MERGE_RULES.minMergeSize && areaM2 < PARCEL_MERGE_RULES.optimalMergeSize) {
    signals.push(MERGE_OPPORTUNITY_SIGNALS.assembly);
    score += 35;
  }

  if (areaM2 >= PARCEL_MERGE_RULES.optimalMergeSize && areaM2 <= 10000) {
    signals.push(MERGE_OPPORTUNITY_SIGNALS.developer_aggregation);
    score += 50;
  }

  if (areaM2 >= 5000 && infraScore >= 70) {
    signals.push(MERGE_OPPORTUNITY_SIGNALS.expansion_potential);
    score += 25;
  }

  if (areaM2 >= 8000) {
    signals.push(MERGE_OPPORTUNITY_SIGNALS.consolidation);
    score += 20;
  }

  const opportunity = signals.length > 0;
  const message = opportunity
    ? `${signals.length} merge signal(s) detected. Parcel suitable for aggregation.`
    : 'No significant merge opportunities detected.';

  return {
    opportunity,
    score: Math.min(100, score),
    signals,
    message,
  };
}
