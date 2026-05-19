"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDeploymentSnapshot = buildDeploymentSnapshot;
const deploymentProfiles_1 = require("../config/runtime/deploymentProfiles");
const backupPolicies_1 = require("../config/runtime/backupPolicies");
const retentionPolicies_1 = require("../config/runtime/retentionPolicies");
const buildScalingSnapshot_1 = require("./buildScalingSnapshot");
const buildSystemCapacity_1 = require("./buildSystemCapacity");
const buildRuntimeAudit_1 = require("./buildRuntimeAudit");
function buildDeploymentSnapshot() {
    const deployment = (0, deploymentProfiles_1.resolveDeploymentProfile)();
    const backup = (0, backupPolicies_1.resolveBackupPolicy)();
    const retention = (0, retentionPolicies_1.resolveRetentionPolicy)();
    const scaling = (0, buildScalingSnapshot_1.buildScalingSnapshot)();
    const capacity = (0, buildSystemCapacity_1.buildSystemCapacity)();
    const runtimeAudit = (0, buildRuntimeAudit_1.buildRuntimeAudit)();
    return {
        generatedAt: new Date().toISOString(),
        deploymentStatus: deployment.deploymentStatus,
        scalingStatus: scaling.scalingStatus,
        backupStatus: backup.backupStatus,
        runtimeCapacity: capacity.runtimeCapacity,
        deploymentProfile: deployment,
        scalingPolicy: scaling.scalingPolicy,
        backupPolicy: backup.policy,
        retentionPolicy: retention.policy,
        securityAuditSummary: runtimeAudit.securityAuditSummary,
        runtimeAudit,
    };
}
