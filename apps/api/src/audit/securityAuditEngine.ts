import { AuditSeverity } from '../security/securityTypes';

export function securityAuditEngine(input: { actorUserId?: string; action: string; targetType: string; targetId?: string; suspicious?: boolean }) {
  const severity: AuditSeverity = input.suspicious ? 'SECURITY_CRITICAL' : 'INFO';
  return {
    timestamp: new Date().toISOString(),
    actorUserId: input.actorUserId || null,
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId || null,
    severity,
    immutable: true,
  };
}
