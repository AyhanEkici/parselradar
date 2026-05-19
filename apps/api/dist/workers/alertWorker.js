"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureAlertWorker = ensureAlertWorker;
const workerFactory_1 = require("../runtime/workerFactory");
async function processAlertJob(job) {
    return {
        processed: true,
        queue: 'alert',
        jobId: job.id,
        signalCount: Number(job.data?.signalCount || 0),
    };
}
async function ensureAlertWorker() {
    return (0, workerFactory_1.ensureWorker)('alert', 'alert', processAlertJob);
}
