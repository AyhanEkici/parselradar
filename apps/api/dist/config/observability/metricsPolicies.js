"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveMetricsPolicy = resolveMetricsPolicy;
function resolveMetricsPolicy() {
    const enabled = process.env.METRICS_ENABLED === 'true';
    const collectionIntervalSec = Number(process.env.METRICS_INTERVAL_SEC || 60);
    return {
        metricsState: enabled ? 'READY' : 'DISABLED',
        collectionIntervalSec,
    };
}
