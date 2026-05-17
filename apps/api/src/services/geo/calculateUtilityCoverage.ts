import { UTILITY_KEYWORDS, UTILITY_WEIGHTS, UTILITY_MAX_SCORE } from '../../config/geo/utilityWeights';

export type UtilityCoverageResult = {
  electricityScore: number;
  waterScore: number;
  gasScore: number;
  internetScore: number;
  totalScore: number;
};

function parseUtility(value?: string) {
  if (!value) return 'unknown';
  const normalized = (value || '').trim().toLowerCase();
  if (UTILITY_KEYWORDS.available.some((k) => normalized.includes(k))) return 'available';
  if (UTILITY_KEYWORDS.partial.some((k) => normalized.includes(k))) return 'partial';
  if (UTILITY_KEYWORDS.unavailable.some((k) => normalized.includes(k))) return 'unavailable';
  return 'unknown';
}

export function calculateUtilityCoverage(input: {
  electricity?: string;
  water?: string;
}): UtilityCoverageResult {
  const electric = parseUtility(input.electricity);
  const water = parseUtility(input.water);

  const electricityScore = UTILITY_WEIGHTS.electricity[electric === 'available' ? 'available' : electric === 'partial' ? 'partial' : 'unavailable'];
  const waterScore = UTILITY_WEIGHTS.water[water === 'available' ? 'available' : water === 'partial' ? 'partial' : 'unavailable'];
  const gasScore = UTILITY_WEIGHTS.natural_gas.unavailable;
  const internetScore = UTILITY_WEIGHTS.internet_fiber.unavailable;

  const totalScore = Math.round((electricityScore + waterScore + gasScore + internetScore) / 4);

  return {
    electricityScore,
    waterScore,
    gasScore,
    internetScore,
    totalScore,
  };
}
