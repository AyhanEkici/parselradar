import { regionalGrowthEngine } from '../macro/regionalGrowthEngine';
import { migrationPressureAnalyzer } from '../macro/migrationPressureAnalyzer';
import { regionalDemandClassifier } from '../macro/regionalDemandClassifier';
import { macroEconomicPressureEngine } from '../macro/macroEconomicPressureEngine';
import { strategicRegionScorer } from '../macro/strategicRegionScorer';
import { planningHierarchyInterpreter } from '../planning/planningHierarchyInterpreter';
import { zoningTransitionScorer } from '../planning/zoningTransitionScorer';
import { municipalExpansionPressure } from '../planning/municipalExpansionPressure';
import { planningProbabilityEngine } from '../planning/planningProbabilityEngine';
import { imarSignalStrengthEngine } from '../planning/imarSignalStrengthEngine';
import { logisticsCorridorDetector } from '../infrastructure/logisticsCorridorDetector';
import { transportationImpactScorer } from '../infrastructure/transportationImpactScorer';
import { infrastructurePressureEngine } from '../infrastructure/infrastructurePressureEngine';
import { industrialExpansionAnalyzer } from '../infrastructure/industrialExpansionAnalyzer';
import { publicInvestmentSignalEngine } from '../infrastructure/publicInvestmentSignalEngine';
import { liquidityScoreEngine } from '../liquidity/liquidityScoreEngine';
import { marketVelocityAnalyzer } from '../liquidity/marketVelocityAnalyzer';
import { regionalPricePressure } from '../liquidity/regionalPricePressure';
import { buyerDemandEstimator } from '../liquidity/buyerDemandEstimator';
import { developerInterestScorer } from '../liquidity/developerInterestScorer';
import { demographicTrendAnalyzer } from '../demographics/demographicTrendAnalyzer';
import { populationPressureScorer } from '../demographics/populationPressureScorer';
import { educationProfileAnalyzer } from '../demographics/educationProfileAnalyzer';
import { ageDistributionEngine } from '../demographics/ageDistributionEngine';
import { workforceDemandClassifier } from '../demographics/workforceDemandClassifier';
import { speculativeHeatDetector } from '../forecasting/speculativeHeatDetector';
import { settlementExpansionForecast } from '../forecasting/settlementExpansionForecast';
import { developmentProbabilityModel } from '../forecasting/developmentProbabilityModel';
import { territorialEvolutionEngine } from '../forecasting/territorialEvolutionEngine';
import { longTermRegionalOutlook } from '../forecasting/longTermRegionalOutlook';
import { DevelopmentProbability } from './intelligenceTypes';

export function buildTerritorialIntelligence(input: {
  score?: number;
  confidence?: number;
  sourceConfidence?: string;
  freshnessScore?: number;
  marketHeat?: string;
  comparableCount?: number;
  opportunityScore?: number;
  marketMomentum?: number;
  districtHeat?: number;
  volatilityIndex?: number;
  trendVelocityScore?: number;
  liquidityTrendScore?: number;
  pricingDeltaRatio?: number;
  overpricingRisk?: string;
  zoningPotential?: string;
  developmentSignals?: string[];
  strategicLocationSignals?: string[];
  missingInputs?: string[];
  staleFlags?: string[];
  unsupportedAssumptionsCount?: number;
  infrastructureScore?: number;
  roadAccessScore?: number;
  infrastructureDistances?: Record<string, number | undefined>;
  investorSignal?: string;
  regionalDemandScore?: number;
  riskFlags?: string[];
  recommendations?: string[];
}) {
  const growth = regionalGrowthEngine({
    opportunityScore: input.opportunityScore,
    marketMomentum: input.marketMomentum,
    freshnessScore: input.freshnessScore,
  });
  const migration = migrationPressureAnalyzer({
    regionalDemandScore: input.regionalDemandScore,
    districtHeat: input.districtHeat,
    staleFlags: input.staleFlags,
  });
  const demand = regionalDemandClassifier({
    marketHeat: input.marketHeat,
    comparableCount: input.comparableCount,
    regionalDemandScore: input.regionalDemandScore,
  });
  const liquidity = liquidityScoreEngine({
    marketMomentum: input.marketMomentum,
    comparableCount: input.comparableCount,
    freshnessScore: input.freshnessScore,
  });
  const velocity = marketVelocityAnalyzer({
    trendVelocityScore: input.trendVelocityScore,
    liquidityTrendScore: input.liquidityTrendScore,
    volatilityIndex: input.volatilityIndex,
  });
  const pricePressure = regionalPricePressure({
    pricingDeltaRatio: input.pricingDeltaRatio,
    overpricingRisk: input.overpricingRisk,
    districtHeat: input.districtHeat,
  });

  const logistics = logisticsCorridorDetector({
    roadCorridorDistanceKm: input.infrastructureDistances?.road_corridor,
    transportImpactScore: 0,
  });
  const transport = transportationImpactScorer({
    roadAccessScore: input.roadAccessScore,
    airportDistanceKm: input.infrastructureDistances?.airport,
    corridorDistanceKm: input.infrastructureDistances?.road_corridor,
  });
  const infrastructurePressure = infrastructurePressureEngine({
    infrastructureScore: input.infrastructureScore,
    nearbyInfrastructureCount: input.strategicLocationSignals?.length,
    logisticsCorridorScore: logistics.value,
  });
  const industrial = industrialExpansionAnalyzer({
    industrialZoneDistanceKm: input.infrastructureDistances?.industrial_zone,
    infrastructurePressureScore: Number(infrastructurePressure.value === 'STRATEGIC' ? 95 : infrastructurePressure.value === 'STRONG' ? 78 : infrastructurePressure.value === 'MODERATE' ? 58 : infrastructurePressure.value === 'LOW' ? 32 : 10),
    districtHeat: input.districtHeat,
  });

  const planningLayer = planningHierarchyInterpreter({
    zoningPotential: input.zoningPotential,
    municipalSignals: input.strategicLocationSignals?.length,
    missingInputs: input.missingInputs,
  });
  const zoningTransition = zoningTransitionScorer({
    zoningPotential: input.zoningPotential,
    developmentSignals: input.developmentSignals,
    missingInputs: input.missingInputs,
  });
  const municipalPressure = municipalExpansionPressure({
    strategicLocationSignals: input.strategicLocationSignals,
    infrastructureScore: input.infrastructureScore,
    regionalDemandScore: input.regionalDemandScore,
  });
  const imarSignalStrength = imarSignalStrengthEngine({
    planningLayer: planningLayer.value,
    missingInputs: input.missingInputs,
    sourceConfidence: input.sourceConfidence,
  });
  const planningProbability = planningProbabilityEngine({
    planningLayer: planningLayer.value,
    zoningTransitionScore: zoningTransition.value,
    municipalExpansionPressure: municipalPressure.value,
    unsupportedClaims: input.unsupportedAssumptionsCount,
  });

  const publicInvestment = publicInvestmentSignalEngine({
    strategicSignals: input.strategicLocationSignals,
    infrastructurePressure: infrastructurePressure.value,
    municipalPressureScore: municipalPressure.value,
  });

  const demographics = demographicTrendAnalyzer({
    migrationPressure: migration.value,
    demandClass: demand.value,
    staleFlags: input.staleFlags,
  });
  const populationPressure = populationPressureScorer({
    migrationPressure: migration.value,
    infrastructurePressureScore: Number(infrastructurePressure.value === 'STRATEGIC' ? 95 : infrastructurePressure.value === 'STRONG' ? 78 : infrastructurePressure.value === 'MODERATE' ? 58 : infrastructurePressure.value === 'LOW' ? 32 : 10),
    liquidityScore: Number(liquidity.value === 'HIGH_ACTIVITY' ? 90 : liquidity.value === 'ACTIVE' ? 72 : liquidity.value === 'SLOW' ? 42 : 18),
  });
  const education = educationProfileAnalyzer({
    universityDistanceKm: input.infrastructureDistances?.university,
    districtHeat: input.districtHeat,
  });
  const ageDistribution = ageDistributionEngine({
    investorSignal: input.investorSignal,
    marketMomentum: input.marketMomentum,
  });
  const workforceDemand = workforceDemandClassifier({
    industrialExpansionScore: industrial.value,
    logisticsCorridorScore: logistics.value,
    publicInvestmentScore: publicInvestment.value,
  });

  const speculativeHeat = speculativeHeatDetector({
    volatilityIndex: input.volatilityIndex,
    pricePressureScore: pricePressure.value,
    unsupportedAssumptionsCount: input.unsupportedAssumptionsCount,
  });

  const settlementForecast = settlementExpansionForecast({
    municipalPressureScore: municipalPressure.value,
    migrationPressure: migration.value,
    infrastructurePressureScore: Number(infrastructurePressure.value === 'STRATEGIC' ? 95 : infrastructurePressure.value === 'STRONG' ? 78 : infrastructurePressure.value === 'MODERATE' ? 58 : infrastructurePressure.value === 'LOW' ? 32 : 10),
  });

  const strategicRegion = strategicRegionScorer({
    growthDirection: growth.value,
    infrastructurePressure: infrastructurePressure.value,
    planningProbability: planningProbability.value === 'VERY_HIGH' ? 90 : planningProbability.value === 'HIGH' ? 72 : planningProbability.value === 'MODERATE' ? 55 : planningProbability.value === 'LOW' ? 35 : 18,
    demandClass: demand.value,
  });

  const devModel = developmentProbabilityModel({
    planningProbability: planningProbability.value as DevelopmentProbability,
    strategicRegionScore: strategicRegion.value,
    speculativeHeat: speculativeHeat.value,
  });

  const territorialEvolution = territorialEvolutionEngine({
    regionalGrowth: growth.value,
    planningProbability: devModel.value,
    infrastructurePressure: infrastructurePressure.value,
    demographicTrend: demographics.value,
  });

  const macroPressure = macroEconomicPressureEngine({
    volatilityIndex: input.volatilityIndex,
    liquidityScore: Number(liquidity.value === 'HIGH_ACTIVITY' ? 90 : liquidity.value === 'ACTIVE' ? 72 : liquidity.value === 'SLOW' ? 42 : 18),
    inflationProxy: 54,
  });

  const longTermOutlook = longTermRegionalOutlook({
    territorialEvolution: territorialEvolution.value,
    demographicTrend: demographics.value,
    macroPressure: macroPressure.value,
  });

  const buyerDemand = buyerDemandEstimator({
    demandClass: demand.value,
    liquidityClass: liquidity.value,
    marketHeat: input.marketHeat,
  });

  const developerInterest = developerInterestScorer({
    developerFit: input.recommendations?.join(' ').toUpperCase().includes('DEVELOPER') ? 'HIGH' : 'MEDIUM',
    planningProbability: devModel.value,
    strategicRegionScore: strategicRegion.value,
  });

  return {
    macroDirection: growth,
    migrationPressure: migration,
    regionalDemand: demand,
    macroEconomicPressure: macroPressure,
    strategicRegionScore: strategicRegion,
    planningLayer: planningLayer,
    planningProbability,
    zoningTransition: zoningTransition,
    imarSignalStrength,
    municipalExpansionPressure: municipalPressure,
    infrastructurePressure,
    transportationImpact: transport,
    industrialExpansion: industrial,
    logisticsCorridor: logistics,
    publicInvestmentSignals: publicInvestment,
    demographicTrajectory: demographics,
    populationPressure,
    educationProfile: education,
    ageDistribution,
    workforceDemand,
    liquidityProfile: liquidity,
    marketVelocity: velocity,
    regionalPricePressure: pricePressure,
    buyerDemand,
    developerInterest,
    territorialEvolution,
    settlementExpansionForecast: settlementForecast,
    developmentProbability: devModel,
    speculativeRisk: speculativeHeat,
    longTermRegionalOutlook: longTermOutlook,
  };
}
