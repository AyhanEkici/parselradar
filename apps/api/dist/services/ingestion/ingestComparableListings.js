"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ingestComparableListings = ingestComparableListings;
const ingestionSources_1 = require("../../config/ingestion/ingestionSources");
const deduplicateComparables_1 = require("./deduplicateComparables");
const normalizeListingData_1 = require("./normalizeListingData");
function ingestComparableListings(input) {
    const normalized = input.sourceRows.map((listing) => (0, normalizeListingData_1.normalizeListingData)({ listing, source: ingestionSources_1.INGESTION_SOURCES.comparableListings.key }));
    const deduplicated = (0, deduplicateComparables_1.deduplicateComparables)(normalized);
    return {
        source: ingestionSources_1.INGESTION_SOURCES.comparableListings.key,
        sourceConfidence: ingestionSources_1.INGESTION_SOURCES.comparableListings.confidence,
        ingestedCount: deduplicated.length,
        droppedCount: normalized.length - deduplicated.length,
        listings: deduplicated,
        signals: deduplicated.length > 0 ? ['comparable_feed_loaded'] : ['comparable_feed_empty'],
    };
}
