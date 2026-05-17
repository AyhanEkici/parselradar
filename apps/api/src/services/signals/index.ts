import { detectDistrictHeat } from './detectDistrictHeat';
import { detectInfrastructureImpact } from './detectInfrastructureImpact';
import { detectInvestorOpportunity } from './detectInvestorOpportunity';
import { detectMarketMomentum } from './detectMarketMomentum';
import { detectPriceAcceleration } from './detectPriceAcceleration';

export function buildSignalNetwork(input: {
  score?: number;
  marketHeat?: string;
  pricingDeltaRatio?: number;
  freshnessScore?: number;
  connectorLiveRatio?: number;
  currentAvgPricePerM2?: number;
  baselinePricePerM2?: number;
  infrastructureScore?: number;
  roadAccessScore?: number;
  strategicLocationSignals?: string[];
  comparableCount?: number;
  liquidityScore?: number;
  volatilityIndex?: number;
  overpricingRisk?: string;
}) {
  const momentum = detectMarketMomentum({
    marketHeat: input.marketHeat,
    pricingDeltaRatio: input.pricingDeltaRatio,
    freshnessScore: input.freshnessScore,
    connectorLiveRatio: input.connectorLiveRatio,
  });

  const acceleration = detectPriceAcceleration({
    currentAvgPricePerM2: input.currentAvgPricePerM2,
    baselinePricePerM2: input.baselinePricePerM2,
  });

  const infrastructureImpact = detectInfrastructureImpact({
    infrastructureScore: input.infrastructureScore,
    roadAccessScore: input.roadAccessScore,
    strategicLocationSignals: input.strategicLocationSignals,
  });

  const districtHeat = detectDistrictHeat({
    pricingDeltaRatio: input.pricingDeltaRatio,
    marketHeat: input.marketHeat,
    comparableCount: input.comparableCount,
    infrastructureImpact: infrastructureImpact.infrastructureImpact,
    liquidityScore: input.liquidityScore,
  });

  const investor = detectInvestorOpportunity({
    score: input.score,
    marketMomentum: momentum.marketMomentum,
    districtHeat: districtHeat.districtHeat,
    volatilityIndex: input.volatilityIndex,
    overpricingRisk: input.overpricingRisk,
  });

  const trendSignals = [
    ...momentum.trendSignals,
    acceleration.signal,
    infrastructureImpact.signal,
    districtHeat.signal,
    investor.signal,
  ];

  return {
    marketMomentum: momentum.marketMomentum,
    districtHeat: districtHeat.districtHeat,
    opportunityScore: investor.opportunityScore,
    investorSignal: investor.investorSignal,
    priceAcceleration: acceleration,
    infrastructureImpact: infrastructureImpact.infrastructureImpact,
    trendSignals,
  };
}
