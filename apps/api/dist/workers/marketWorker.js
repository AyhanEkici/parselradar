"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.marketWorker = marketWorker;
exports.ensureMarketWorker = ensureMarketWorker;
const ingestComparableListings_1 = require("../services/ingestion/ingestComparableListings");
const buildMarketCache_1 = require("../services/cache/buildMarketCache");
const warmComparableCache_1 = require("../services/cache/warmComparableCache");
const processMarketRefresh_1 = require("../services/jobs/processMarketRefresh");
const workerFactory_1 = require("../runtime/workerFactory");
function marketWorker(input) {
    const ingestion = (0, ingestComparableListings_1.ingestComparableListings)({ sourceRows: input.sourceRows });
    const cacheEntry = (0, buildMarketCache_1.buildMarketCache)({
        districtKey: input.districtKey,
        payload: { ingestedCount: ingestion.ingestedCount, source: ingestion.source },
    });
    const comparableCache = (0, warmComparableCache_1.warmComparableCache)({
        districtKey: input.districtKey,
        comparableCount: ingestion.ingestedCount,
    });
    const refresh = (0, processMarketRefresh_1.processMarketRefresh)({ propertyId: input.propertyId, staleFlags: input.staleFlags });
    return {
        worker: 'marketWorker',
        ingestion,
        cacheEntry,
        comparableCache,
        refresh,
    };
}
async function processMarketJob(job) {
    const data = (job.data || {});
    return {
        processed: true,
        queue: 'market',
        jobId: job.id,
        propertyId: String(data.propertyId || ''),
    };
}
async function ensureMarketWorker() {
    return (0, workerFactory_1.ensureWorker)('market', 'market', processMarketJob);
}
