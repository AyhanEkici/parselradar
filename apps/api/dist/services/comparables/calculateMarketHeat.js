"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateMarketHeat = calculateMarketHeat;
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
function volatility(values) {
    if (values.length <= 1)
        return 0;
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
    const std = Math.sqrt(variance);
    return mean > 0 ? std / mean : 0;
}
function calculateMarketHeat(input) {
    const count = input.comparables.length;
    if (count === 0)
        return { marketHeat: 'COLD', evidenceScore: 20 };
    const avgRecencyDays = input.comparables.reduce((sum, item) => sum + item.daysSinceCreated, 0) / Math.max(1, count);
    const recencyScore = avgRecencyDays <= 30 ? 100 : avgRecencyDays <= 90 ? 82 : avgRecencyDays <= 180 ? 62 : 40;
    const avgSimilarity = input.comparables.reduce((sum, item) => sum + item.similarityScore, 0) / Math.max(1, count);
    const vol = volatility(input.comparables.map((c) => c.normalizedPricePerM2));
    const stabilityScore = vol <= 0.12 ? 82 : vol <= 0.2 ? 68 : vol <= 0.32 ? 52 : 36;
    const evidenceScore = Math.round(clamp(count * 12 + recencyScore * 0.36 + avgSimilarity * 0.34 + stabilityScore * 0.3, 0, 100));
    let marketHeat = 'STABLE';
    if (evidenceScore >= 82)
        marketHeat = 'HOT';
    else if (evidenceScore >= 66)
        marketHeat = 'ACTIVE';
    else if (evidenceScore < 45)
        marketHeat = 'COLD';
    return { marketHeat, evidenceScore };
}
