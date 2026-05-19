"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureIngestionWorker = ensureIngestionWorker;
const workerFactory_1 = require("../runtime/workerFactory");
async function processIngestionJob(job) {
    return {
        processed: true,
        queue: 'ingestion',
        jobId: job.id,
        source: String(job.data?.source || 'unknown'),
    };
}
async function ensureIngestionWorker() {
    return (0, workerFactory_1.ensureWorker)('ingestion', 'ingestion', processIngestionJob);
}
