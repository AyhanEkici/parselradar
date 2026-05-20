import { securityAuditEngine } from './securityAuditEngine';

export function adminActionAudit(input: { adminUserId: string; action: string; targetType: string; targetId?: string }) {
  return securityAuditEngine({
    actorUserId: input.adminUserId,
    action: `admin:${input.action}`,
    targetType: input.targetType,
    targetId: input.targetId,
  });
}
