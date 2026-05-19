"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queuePropertyReanalysis = queuePropertyReanalysis;
exports.getQueuedPropertyReanalysis = getQueuedPropertyReanalysis;
const reanalysisQueue = new Map();
function queuePropertyReanalysis(input) {
    const item = {
        propertyId: input.propertyId,
        reason: input.reason,
        queuedAt: new Date().toISOString(),
    };
    reanalysisQueue.set(input.propertyId, item);
    return {
        refreshStatus: 'queued',
        queueDepth: reanalysisQueue.size,
        item,
    };
}
function getQueuedPropertyReanalysis(propertyId) {
    return reanalysisQueue.get(propertyId) || null;
}
