"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureAnalysisWorker = ensureAnalysisWorker;
const workerFactory_1 = require("../runtime/workerFactory");
async function processAnalysisJob(job) {
    return {
        processed: true,
        queue: 'analysis',
        jobId: job.id,
        payloadKeys: Object.keys((job.data || {})),
    };
}
async function ensureAnalysisWorker() {
    return (0, workerFactory_1.ensureWorker)('analysis', 'analysis', processAnalysisJob);
}
