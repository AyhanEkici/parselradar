"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSignalNetwork = buildSignalNetwork;
const detectDistrictHeat_1 = require("./detectDistrictHeat");
const detectInfrastructureImpact_1 = require("./detectInfrastructureImpact");
const detectInvestorOpportunity_1 = require("./detectInvestorOpportunity");
const detectMarketMomentum_1 = require("./detectMarketMomentum");
const detectPriceAcceleration_1 = require("./detectPriceAcceleration");
function buildSignalNetwork(input) {
    const momentum = (0, detectMarketMomentum_1.detectMarketMomentum)({
        marketHeat: input.marketHeat,
        pricingDeltaRatio: input.pricingDeltaRatio,
        freshnessScore: input.freshnessScore,
        connectorLiveRatio: input.connectorLiveRatio,
    });
    const acceleration = (0, detectPriceAcceleration_1.detectPriceAcceleration)({
        currentAvgPricePerM2: input.currentAvgPricePerM2,
        baselinePricePerM2: input.baselinePricePerM2,
    });
    const infrastructureImpact = (0, detectInfrastructureImpact_1.detectInfrastructureImpact)({
        infrastructureScore: input.infrastructureScore,
        roadAccessScore: input.roadAccessScore,
        strategicLocationSignals: input.strategicLocationSignals,
    });
    const districtHeat = (0, detectDistrictHeat_1.detectDistrictHeat)({
        pricingDeltaRatio: input.pricingDeltaRatio,
        marketHeat: input.marketHeat,
        comparableCount: input.comparableCount,
        infrastructureImpact: infrastructureImpact.infrastructureImpact,
        liquidityScore: input.liquidityScore,
    });
    const investor = (0, detectInvestorOpportunity_1.detectInvestorOpportunity)({
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
