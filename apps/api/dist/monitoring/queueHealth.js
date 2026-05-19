"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queueHealth = queueHealth;
function queueHealth(queueStates) {
    const degraded = queueStates.filter((q) => q.state === 'DEGRADED').length;
    const failed = queueStates.filter((q) => q.state === 'FAILED').length;
    const totalDepth = queueStates.reduce((sum, q) => sum + q.depth, 0);
    const deadLetterReadyCount = queueStates.filter((q) => q.deadLetterReady).length;
    return {
        degraded,
        failed,
        totalDepth,
        deadLetterReadyCount,
        readyRate: queueStates.length === 0 ? 1 : queueStates.filter((q) => ['READY', 'RUNNING'].includes(q.state)).length / queueStates.length,
    };
}
