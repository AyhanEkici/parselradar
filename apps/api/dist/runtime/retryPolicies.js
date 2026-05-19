"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRetryPolicy = buildRetryPolicy;
const bullmqPolicies_1 = require("../config/runtime/bullmqPolicies");
const retryThresholds_1 = require("../config/runtime/retryThresholds");
function buildRetryPolicy(queueName) {
    const retry = retryThresholds_1.RETRY_THRESHOLDS[queueName];
    return {
        attempts: retry.attempts,
        backoff: {
            type: 'exponential',
            delay: retry.backoffMs,
        },
        removeOnComplete: bullmqPolicies_1.BULLMQ_POLICIES.defaultRemoveOnComplete,
        removeOnFail: bullmqPolicies_1.BULLMQ_POLICIES.defaultRemoveOnFail,
    };
}
