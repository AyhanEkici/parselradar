import { recordAccessDecision } from '../utils/accessAudit';

type AuthSessionAuditInput = {
  userId?: string;
  role?: string;
  decision: 'allow' | 'deny';
  reason: string;
  route: string;
  method: string;
  ip?: string;
  userAgent?: string;
};

export async function authSessionAudit(input: AuthSessionAuditInput) {
  await recordAccessDecision({
    userId: input.userId,
    role: input.role,
    resourceType: 'AuthSession',
    resourceId: input.userId,
    decision: input.decision,
    reason: input.reason,
    route: input.route,
    method: input.method,
    ip: input.ip,
    userAgent: input.userAgent,
  });
}
