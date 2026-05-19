"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deduplicateComparables = deduplicateComparables;
const ingestionThresholds_1 = require("../../config/ingestion/ingestionThresholds");
function isNear(left, right, tolerance = 0) {
    if (left === undefined || right === undefined)
        return false;
    return Math.abs(left - right) <= tolerance;
}
function deduplicateComparables(listings) {
    const unique = [];
    for (const listing of listings) {
        const duplicate = unique.find((candidate) => candidate.city === listing.city &&
            candidate.district === listing.district &&
            isNear(candidate.areaM2, listing.areaM2, ingestionThresholds_1.INGESTION_THRESHOLDS.dedupeTolerance.areaM2) &&
            isNear(candidate.pricePerM2, listing.pricePerM2, ingestionThresholds_1.INGESTION_THRESHOLDS.dedupeTolerance.pricePerM2));
        if (!duplicate) {
            unique.push(listing);
        }
    }
    return unique;
}
