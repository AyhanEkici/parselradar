"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LIQUIDITY_SIGNAL_THRESHOLDS = exports.LIQUIDITY_DOCUMENT_ADJUSTMENTS = exports.LIQUIDITY_AREA_ADJUSTMENTS = exports.LIQUIDITY_BASE_BY_MARKET_POSITION = void 0;
exports.LIQUIDITY_BASE_BY_MARKET_POSITION = {
    DEEP_DISCOUNT: 80,
    DISCOUNT: 85,
    FAIR: 82,
    PREMIUM: 58,
    STRETCHED: 38,
};
exports.LIQUIDITY_AREA_ADJUSTMENTS = {
    verySmallThresholdM2: 200,
    verySmallAdjustment: -8,
    idealMinM2: 250,
    idealMaxM2: 12000,
    idealAdjustment: 6,
    largeThresholdM2: 30000,
    largeAdjustment: -12,
    veryLargeThresholdM2: 50000,
    veryLargeAdjustment: -18,
};
exports.LIQUIDITY_DOCUMENT_ADJUSTMENTS = {
    minDocsForHighConfidence: 3,
    minDocsForBaseline: 2,
    adjustmentBelowBaseline: -8,
    adjustmentStrongDocs: 5,
};
exports.LIQUIDITY_SIGNAL_THRESHOLDS = {
    HIGH: 76,
    MEDIUM: 52,
};
