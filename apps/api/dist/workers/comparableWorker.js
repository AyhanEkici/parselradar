"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparableWorker = comparableWorker;
const ingestComparableListings_1 = require("../services/ingestion/ingestComparableListings");
const queuePropertyReanalysis_1 = require("../services/jobs/queuePropertyReanalysis");
function comparableWorker(input) {
    const ingestion = (0, ingestComparableListings_1.ingestComparableListings)({ sourceRows: input.sourceRows });
    const queue = (0, queuePropertyReanalysis_1.queuePropertyReanalysis)({
        propertyId: input.propertyId,
        reason: ingestion.ingestedCount > 0 ? 'comparable_ingestion' : 'comparable_review',
    });
    return {
        worker: 'comparableWorker',
        ingestion,
        queue,
    };
}
