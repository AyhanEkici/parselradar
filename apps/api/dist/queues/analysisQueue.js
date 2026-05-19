"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enqueueAnalysis = enqueueAnalysis;
exports.getAnalysisQueueState = getAnalysisQueueState;
const queuePolicies_1 = require("../config/runtime/queuePolicies");
const runtimeQueueUtils_1 = require("./runtimeQueueUtils");
async function enqueueAnalysis(payload) {
    return (0, runtimeQueueUtils_1.enqueueRuntimeJob)('analysis', 'analysis_job', payload);
}
async function getAnalysisQueueState() {
    return (0, runtimeQueueUtils_1.getRuntimeQueueState)('analysis', queuePolicies_1.QUEUE_POLICIES.analysis.deadLetterEnabled);
}
