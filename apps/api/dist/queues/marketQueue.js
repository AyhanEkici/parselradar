"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enqueueMarket = enqueueMarket;
exports.getMarketQueueState = getMarketQueueState;
const queuePolicies_1 = require("../config/runtime/queuePolicies");
const runtimeQueueUtils_1 = require("./runtimeQueueUtils");
async function enqueueMarket(payload) {
    return (0, runtimeQueueUtils_1.enqueueRuntimeJob)('market', 'market_job', payload);
}
async function getMarketQueueState() {
    return (0, runtimeQueueUtils_1.getRuntimeQueueState)('market', queuePolicies_1.QUEUE_POLICIES.market.deadLetterEnabled);
}
