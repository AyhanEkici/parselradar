"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geoWorker = geoWorker;
exports.ensureGeoWorker = ensureGeoWorker;
const processSpatialRefresh_1 = require("../services/jobs/processSpatialRefresh");
const ingestMunicipalitySignals_1 = require("../services/ingestion/ingestMunicipalitySignals");
const workerFactory_1 = require("../runtime/workerFactory");
function geoWorker(input) {
    const municipalitySignals = (0, ingestMunicipalitySignals_1.ingestMunicipalitySignals)({ city: input.city, district: input.district });
    const refresh = (0, processSpatialRefresh_1.processSpatialRefresh)({ propertyId: input.propertyId, staleFlags: input.staleFlags });
    return {
        worker: 'geoWorker',
        municipalitySignals,
        refresh,
    };
}
async function processGeoJob(job) {
    const data = (job.data || {});
    return {
        processed: true,
        queue: 'geo',
        jobId: job.id,
        propertyId: String(data.propertyId || ''),
    };
}
async function ensureGeoWorker() {
    return (0, workerFactory_1.ensureWorker)('geo', 'geo', processGeoJob);
}
