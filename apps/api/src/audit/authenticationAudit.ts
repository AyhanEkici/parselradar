import { securityAuditEngine } from './securityAuditEngine';

export function authenticationAudit(input: { userId?: string; action: 'login' | 'logout' | 'token_invalid'; success: boolean }) {
  return securityAuditEngine({
    actorUserId: input.userId,
    action: `auth:${input.action}`,
    targetType: 'AuthSession',
    suspicious: !input.success,
  });
}
