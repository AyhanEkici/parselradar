"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enqueueGeo = enqueueGeo;
exports.getGeoQueueState = getGeoQueueState;
const queuePolicies_1 = require("../config/runtime/queuePolicies");
const runtimeQueueUtils_1 = require("./runtimeQueueUtils");
async function enqueueGeo(payload) {
    return (0, runtimeQueueUtils_1.enqueueRuntimeJob)('geo', 'geo_job', payload);
}
async function getGeoQueueState() {
    return (0, runtimeQueueUtils_1.getRuntimeQueueState)('geo', queuePolicies_1.QUEUE_POLICIES.geo.deadLetterEnabled);
}
