"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateMarketPosition = calculateMarketPosition;
const districtMultipliers_1 = require("../../config/analysis/districtMultipliers");
const liquidityWeights_1 = require("../../config/analysis/liquidityWeights");
const valuationMatrix_1 = require("../../config/analysis/valuationMatrix");
function normalize(value) {
    return (value || '').trim().toLowerCase();
}
function districtMultiplier(ilce) {
    const district = normalize(ilce);
    if (!district)
        return districtMultipliers_1.DEFAULT_DISTRICT_MULTIPLIER;
    if (districtMultipliers_1.DISTRICT_KEYWORD_MULTIPLIERS.premium.keywords.some((k) => district.includes(k))) {
        return districtMultipliers_1.DISTRICT_KEYWORD_MULTIPLIERS.premium.multiplier;
    }
    if (districtMultipliers_1.DISTRICT_KEYWORD_MULTIPLIERS.rural.keywords.some((k) => district.includes(k))) {
        return districtMultipliers_1.DISTRICT_KEYWORD_MULTIPLIERS.rural.multiplier;
    }
    if (districtMultipliers_1.DISTRICT_KEYWORD_MULTIPLIERS.cityEdge.keywords.some((k) => district.includes(k))) {
        return districtMultipliers_1.DISTRICT_KEYWORD_MULTIPLIERS.cityEdge.multiplier;
    }
    if (districtMultipliers_1.DISTRICT_KEYWORD_MULTIPLIERS.industrial.keywords.some((k) => district.includes(k))) {
        return districtMultipliers_1.DISTRICT_KEYWORD_MULTIPLIERS.industrial.multiplier;
    }
    return districtMultipliers_1.DEFAULT_DISTRICT_MULTIPLIER;
}
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
function liquiditySignalFromScore(score) {
    if (score >= liquidityWeights_1.LIQUIDITY_SIGNAL_THRESHOLDS.HIGH)
        return 'HIGH';
    if (score >= liquidityWeights_1.LIQUIDITY_SIGNAL_THRESHOLDS.MEDIUM)
        return 'MEDIUM';
    return 'LOW';
}
function liquidityScore(input) {
    let score = liquidityWeights_1.LIQUIDITY_BASE_BY_MARKET_POSITION[input.marketPosition];
    if (typeof input.areaM2 === 'number' && input.areaM2 > 0) {
        if (input.areaM2 < liquidityWeights_1.LIQUIDITY_AREA_ADJUSTMENTS.verySmallThresholdM2) {
            score += liquidityWeights_1.LIQUIDITY_AREA_ADJUSTMENTS.verySmallAdjustment;
        }
        else if (input.areaM2 >= liquidityWeights_1.LIQUIDITY_AREA_ADJUSTMENTS.idealMinM2 &&
            input.areaM2 <= liquidityWeights_1.LIQUIDITY_AREA_ADJUSTMENTS.idealMaxM2) {
            score += liquidityWeights_1.LIQUIDITY_AREA_ADJUSTMENTS.idealAdjustment;
        }
        else if (input.areaM2 > liquidityWeights_1.LIQUIDITY_AREA_ADJUSTMENTS.veryLargeThresholdM2) {
            score += liquidityWeights_1.LIQUIDITY_AREA_ADJUSTMENTS.veryLargeAdjustment;
        }
        else if (input.areaM2 > liquidityWeights_1.LIQUIDITY_AREA_ADJUSTMENTS.largeThresholdM2) {
            score += liquidityWeights_1.LIQUIDITY_AREA_ADJUSTMENTS.largeAdjustment;
        }
    }
    if (input.docCount < liquidityWeights_1.LIQUIDITY_DOCUMENT_ADJUSTMENTS.minDocsForBaseline) {
        score += liquidityWeights_1.LIQUIDITY_DOCUMENT_ADJUSTMENTS.adjustmentBelowBaseline;
    }
    else if (input.docCount >= liquidityWeights_1.LIQUIDITY_DOCUMENT_ADJUSTMENTS.minDocsForHighConfidence) {
        score += liquidityWeights_1.LIQUIDITY_DOCUMENT_ADJUSTMENTS.adjustmentStrongDocs;
    }
    return clamp(score, 0, 100);
}
function calculateMarketPosition(input) {
    const cityKey = normalize(input.il);
    const cityBase = valuationMatrix_1.REGION_VALUATION_MATRIX[cityKey]?.basePricePerM2 || valuationMatrix_1.REGION_VALUATION_MATRIX.default.basePricePerM2;
    let comparablePricePerM2 = cityBase;
    const districtMul = districtMultiplier(input.ilce);
    comparablePricePerM2 = Math.round(comparablePricePerM2 * districtMul);
    if (districtMul >= valuationMatrix_1.DISTRICT_TIER_MULTIPLIERS.CITY_CORE) {
        comparablePricePerM2 = Math.round(comparablePricePerM2 * 1.02);
    }
    else if (districtMul <= valuationMatrix_1.DISTRICT_TIER_MULTIPLIERS.RURAL) {
        comparablePricePerM2 = Math.round(comparablePricePerM2 * 0.98);
    }
    const derivedSubjectPrice = typeof input.pricePerM2 === 'number' && input.pricePerM2 > 0
        ? input.pricePerM2
        : typeof input.askingPriceTRY === 'number' && input.askingPriceTRY > 0 && typeof input.areaM2 === 'number' && input.areaM2 > 0
            ? input.askingPriceTRY / input.areaM2
            : comparablePricePerM2;
    const subjectPricePerM2 = Math.round(derivedSubjectPrice);
    const priceDeviationRatio = (subjectPricePerM2 - comparablePricePerM2) / comparablePricePerM2;
    let marketPosition = 'FAIR';
    if (priceDeviationRatio <= -0.25)
        marketPosition = 'DEEP_DISCOUNT';
    else if (priceDeviationRatio <= -0.1)
        marketPosition = 'DISCOUNT';
    else if (priceDeviationRatio >= 0.35)
        marketPosition = 'STRETCHED';
    else if (priceDeviationRatio >= 0.12)
        marketPosition = 'PREMIUM';
    const areaForValuation = typeof input.areaM2 === 'number' && input.areaM2 > 0 ? input.areaM2 : 1000;
    const mid = Math.round(comparablePricePerM2 * areaForValuation);
    const low = Math.round(mid * valuationMatrix_1.VALUATION_BAND_WIDTH.lowFactor);
    const high = Math.round(mid * valuationMatrix_1.VALUATION_BAND_WIDTH.highFactor);
    const liqScore = liquidityScore({ marketPosition, areaM2: input.areaM2, docCount: input.docCount });
    const liquiditySignal = liquiditySignalFromScore(liqScore);
    const pricingConfidenceBase = typeof input.pricePerM2 === 'number' && input.pricePerM2 > 0
        ? 82
        : typeof input.askingPriceTRY === 'number' && typeof input.areaM2 === 'number'
            ? 72
            : 55;
    const pricingConfidence = clamp(pricingConfidenceBase + Math.min(10, input.docCount * 2), 40, 95);
    return {
        comparablePricePerM2,
        subjectPricePerM2,
        priceDeviationRatio: Number(priceDeviationRatio.toFixed(3)),
        marketPosition,
        valuationBand: { low, mid, high, currency: 'TRY' },
        liquiditySignal,
        pricingConfidence,
    };
}
