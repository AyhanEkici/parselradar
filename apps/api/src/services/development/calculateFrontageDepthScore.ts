import { FRONTAGE_DEPTH_WEIGHTS, GEOMETRY_HEURISTIC_KEYWORDS } from '../../config/development/frontageDepthWeights';

export type FrontageDepthScoreResult = {
  score: number;
  geometrySignals: string[];
};

function roadKey(roadAccess?: string) {
  const value = (roadAccess || '').toLowerCase();
  if (value.includes('highway') || value.includes('otoyol')) return 'highway';
  if (value.includes('anayol') || value.includes('bulvar')) return 'anayol';
  if (value.includes('arter') || value.includes('cadde')) return 'arterial';
  if (value.includes('village') || value.includes('koy') || value.includes('köy')) return 'village';
  if (value.trim()) return 'local';
  return 'unknown';
}

export function calculateFrontageDepthScore(input: {
  areaM2?: number;
  roadAccess?: string;
  addressText?: string;
  mahalleOrKoy?: string;
}): FrontageDepthScoreResult {
  const area = input.areaM2 || 0;
  const text = `${input.addressText || ''} ${input.mahalleOrKoy || ''}`.toLowerCase();
  const signals: string[] = [];
  let score = FRONTAGE_DEPTH_WEIGHTS.baseScore;

  score += FRONTAGE_DEPTH_WEIGHTS.roadAccessBonus[roadKey(input.roadAccess) as keyof typeof FRONTAGE_DEPTH_WEIGHTS.roadAccessBonus];

  if (area <= FRONTAGE_DEPTH_WEIGHTS.areaBands.compact.max) {
    score += FRONTAGE_DEPTH_WEIGHTS.areaBands.compact.score;
    signals.push('compact_geometry');
  } else if (area <= FRONTAGE_DEPTH_WEIGHTS.areaBands.balanced.max) {
    score += FRONTAGE_DEPTH_WEIGHTS.areaBands.balanced.score;
    signals.push('balanced_depth_ratio_proxy');
  } else if (area <= FRONTAGE_DEPTH_WEIGHTS.areaBands.deep.max) {
    score += FRONTAGE_DEPTH_WEIGHTS.areaBands.deep.score;
    signals.push('deep_lot_proxy');
  } else {
    score += FRONTAGE_DEPTH_WEIGHTS.areaBands.oversized.score;
    signals.push('oversized_depth_penalty');
  }

  if (GEOMETRY_HEURISTIC_KEYWORDS.corner.some((keyword) => text.includes(keyword))) {
    score += FRONTAGE_DEPTH_WEIGHTS.cornerKeywordBonus;
    signals.push('corner_opportunity_bonus');
  }

  if (GEOMETRY_HEURISTIC_KEYWORDS.narrow.some((keyword) => text.includes(keyword))) {
    score += FRONTAGE_DEPTH_WEIGHTS.narrowKeywordPenalty;
    signals.push('narrow_parcel_penalty');
  }

  if (GEOMETRY_HEURISTIC_KEYWORDS.deep.some((keyword) => text.includes(keyword)) || area > 4000) {
    score += FRONTAGE_DEPTH_WEIGHTS.deepShapePenalty;
    signals.push('deep_parcel_penalty');
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    geometrySignals: signals,
  };
}
