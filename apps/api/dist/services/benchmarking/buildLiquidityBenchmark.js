"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildLiquidityBenchmark = buildLiquidityBenchmark;
function buildLiquidityBenchmark(input) {
    const baseline = {
        high: 34,
        medium: 33,
        low: 33,
    };
    return {
        methodology: 'Internal operating benchmark for liquidity balance. Not external market data.',
        rows: input.exposureByLiquidityBand.map((row) => ({
            liquidityBand: row.key,
            portfolioWeightPercent: row.weightPercent,
            baselineWeightPercent: baseline[row.key] || 0,
            deltaPercent: Number((row.weightPercent - (baseline[row.key] || 0)).toFixed(2)),
        })),
    };
}
