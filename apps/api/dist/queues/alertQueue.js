"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enqueueAlert = enqueueAlert;
exports.getAlertQueueState = getAlertQueueState;
const queuePolicies_1 = require("../config/runtime/queuePolicies");
const runtimeQueueUtils_1 = require("./runtimeQueueUtils");
async function enqueueAlert(payload) {
    return (0, runtimeQueueUtils_1.enqueueRuntimeJob)('alert', 'alert_job', payload);
}
async function getAlertQueueState() {
    return (0, runtimeQueueUtils_1.getRuntimeQueueState)('alert', queuePolicies_1.QUEUE_POLICIES.alert.deadLetterEnabled);
}
