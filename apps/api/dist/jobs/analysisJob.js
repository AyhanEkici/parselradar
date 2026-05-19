"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analysisJob = analysisJob;
const analysisQueue_1 = require("../queues/analysisQueue");
function analysisJob(input) {
    return (0, analysisQueue_1.enqueueAnalysis)({
        propertyId: input.propertyId,
        force: Boolean(input.force),
        type: 'analysis_job',
        queuedAt: new Date().toISOString(),
    });
}
