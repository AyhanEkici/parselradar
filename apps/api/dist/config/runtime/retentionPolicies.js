"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveRetentionPolicy = resolveRetentionPolicy;
function resolveRetentionPolicy() {
    const logsDays = Number(process.env.RETENTION_LOG_DAYS || 30);
    const metricsDays = Number(process.env.RETENTION_METRICS_DAYS || 30);
    const backupsDays = Number(process.env.RETENTION_BACKUP_DAYS || 14);
    return {
        policy: {
            logsDays,
            metricsDays,
            backupsDays,
        },
    };
}
