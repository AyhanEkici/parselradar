"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enqueueIngestion = enqueueIngestion;
exports.getIngestionQueueState = getIngestionQueueState;
const queuePolicies_1 = require("../config/runtime/queuePolicies");
const runtimeQueueUtils_1 = require("./runtimeQueueUtils");
async function enqueueIngestion(payload) {
    return (0, runtimeQueueUtils_1.enqueueRuntimeJob)('ingestion', 'ingestion_job', payload);
}
async function getIngestionQueueState() {
    return (0, runtimeQueueUtils_1.getRuntimeQueueState)('ingestion', queuePolicies_1.QUEUE_POLICIES.ingestion.deadLetterEnabled);
}
