"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ingestionJob = ingestionJob;
const ingestionQueue_1 = require("../queues/ingestionQueue");
function ingestionJob(input) {
    return (0, ingestionQueue_1.enqueueIngestion)({
        propertyId: input.propertyId,
        source: input.source,
        type: 'ingestion_job',
        queuedAt: new Date().toISOString(),
    });
}
