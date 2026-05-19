"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePortfolioExposureMap = calculatePortfolioExposureMap;
function calculatePortfolioExposureMap(input) {
    const total = input.totalValue || 1;
    const toRows = (bucket) => Object.entries(bucket)
        .map(([key, value]) => {
        const numeric = Number(value || 0);
        return {
            key,
            value: numeric,
            weightPercent: Number(((numeric / total) * 100).toFixed(2)),
        };
    })
        .sort((a, b) => b.value - a.value);
    return {
        totalValue: input.totalValue,
        byCity: toRows(input.byCity),
        byAssetType: toRows(input.byAssetType),
        byLiquidityBand: toRows(input.byLiquidityBand),
    };
}
