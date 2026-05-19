import { IntelligenceSignal } from '../intelligence/intelligenceTypes';

export function buyerDemandEstimator(input: { demandClass?: string; liquidityClass?: string; marketHeat?: string }): IntelligenceSignal<number> {
  const demand = String(input.demandClass || 'BALANCED');
  const liquidity = String(input.liquidityClass || 'SLOW');
  const heat = String(input.marketHeat || 'STABLE').toUpperCase();
  const score =
    (demand === 'SURGING' ? 78 : demand === 'ELEVATED' ? 62 : demand === 'LOW' ? 28 : 45) +
    (liquidity === 'HIGH_ACTIVITY' ? 18 : liquidity === 'ACTIVE' ? 10 : liquidity === 'ILLIQUID' ? -10 : 0) +
    (heat === 'HOT' ? 8 : heat === 'COLD' ? -8 : 0);
  const value = Math.max(0, Math.min(100, score));
  return {
    value,
    source: 'regional demand class + liquidity class + market heat',
    freshnessDays: 18,
    confidence: 66,
    inferenceLevel: 'inferred',
    notes: ['Buyer demand estimate reflects signal composition, not direct orderbook data.'],
  };
}
