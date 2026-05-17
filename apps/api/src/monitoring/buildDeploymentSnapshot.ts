import { resolveDeploymentProfile } from '../config/runtime/deploymentProfiles';
import { resolveBackupPolicy } from '../config/runtime/backupPolicies';
import { resolveRetentionPolicy } from '../config/runtime/retentionPolicies';
import { buildScalingSnapshot } from './buildScalingSnapshot';
import { buildSystemCapacity } from './buildSystemCapacity';
import { buildRuntimeAudit } from './buildRuntimeAudit';

export function buildDeploymentSnapshot() {
  const deployment = resolveDeploymentProfile();
  const backup = resolveBackupPolicy();
  const retention = resolveRetentionPolicy();
  const scaling = buildScalingSnapshot();
  const capacity = buildSystemCapacity();
  const runtimeAudit = buildRuntimeAudit();

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
