"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateComparablePricing = calculateComparablePricing;
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
function percentile(sorted, p) {
    if (sorted.length === 0)
        return 0;
    const idx = (sorted.length - 1) * p;
    const lower = Math.floor(idx);
    const upper = Math.ceil(idx);
    if (lower === upper)
        return sorted[lower];
    const weight = idx - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}
function calculateComparablePricing(input) {
    const values = input.comparables.map((c) => c.normalizedPricePerM2).filter((v) => v > 0);
    const comparableCount = values.length;
    if (comparableCount === 0) {
        return {
            comparableCount: 0,
            avgComparablePricePerM2: input.subjectPricePerM2,
            medianComparablePricePerM2: input.subjectPricePerM2,
            subjectPricePerM2: input.subjectPricePerM2,
            pricingDeltaRatio: 0,
            pricingPosition: 'FAIR_MARKET',
        };
    }
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0 ? Math.round((sorted[middle - 1] + sorted[middle]) / 2) : sorted[middle];
    // Trim outliers for average (deterministic) using IQR bounds.
    const q1 = percentile(sorted, 0.25);
    const q3 = percentile(sorted, 0.75);
    const iqr = Math.max(1, q3 - q1);
    const low = q1 - 1.5 * iqr;
    const high = q3 + 1.5 * iqr;
    const trimmed = sorted.filter((v) => v >= low && v <= high);
    const avg = Math.round(trimmed.reduce((sum, v) => sum + v, 0) / Math.max(1, trimmed.length));
    // Baseline uses median to reduce sensitivity to outliers.
    const baseline = Math.max(1, median);
    const delta = (input.subjectPricePerM2 - baseline) / baseline;
    let pricingPosition = 'FAIR_MARKET';
    if (delta <= -0.12)
        pricingPosition = 'UNDER_MARKET';
    else if (delta >= 0.28)
        pricingPosition = 'HEAVILY_OVERPRICED';
    else if (delta >= 0.12)
        pricingPosition = 'ABOVE_MARKET';
    return {
        comparableCount,
        avgComparablePricePerM2: avg,
        medianComparablePricePerM2: median,
        subjectPricePerM2: Math.round(clamp(input.subjectPricePerM2, 1, 10000000)),
        pricingDeltaRatio: Number(delta.toFixed(3)),
        pricingPosition,
    };
}
