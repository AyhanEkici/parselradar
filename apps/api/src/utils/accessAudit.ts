import { logAuditEvent } from './auditLog';

type AccessDecisionInput = {
  userId?: string;
  role?: string;
  resourceType: string;
  resourceId?: string;
  decision: 'allow' | 'deny';
  reason: string;
  route: string;
  method?: string;
  ip?: string;
  userAgent?: string;
};

export async function recordAccessDecision(input: AccessDecisionInput) {
  await logAuditEvent({
    type: 'access_decision',
    actorUserId: input.userId,
    actorRole: input.role,
    targetType: input.resourceType,
    targetId: input.resourceId,
    message: `${input.decision.toUpperCase()} ${input.resourceType}: ${input.reason}`,
    metadata: {
      decision: input.decision,
      reason: input.reason,
      route: input.route,
      method: input.method,
    },
    ip: input.ip,
    userAgent: input.userAgent,
    success: input.decision === 'allow',
  });
}
