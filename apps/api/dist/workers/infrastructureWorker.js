"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.infrastructureWorker = infrastructureWorker;
const ingestInfrastructureSignals_1 = require("../services/ingestion/ingestInfrastructureSignals");
const invalidateRegionalCache_1 = require("../services/cache/invalidateRegionalCache");
function infrastructureWorker(input) {
    const infrastructureSignals = (0, ingestInfrastructureSignals_1.ingestInfrastructureSignals)({ city: input.city });
    const invalidation = (0, invalidateRegionalCache_1.invalidateRegionalCache)({ districtKey: input.districtKey });
    return {
        worker: 'infrastructureWorker',
        infrastructureSignals,
        invalidation,
    };
}
