import { logAuditEvent } from '../utils/auditLog';

type PasswordResetAuditInput = {
  action: 'forgot_password' | 'reset_password' | 'reset_token_created' | 'reset_token_rejected' | 'reset_email_sent';
  userId?: string;
  emailProviderState?: string;
  resetTokenState?: string;
  outcome: 'allow' | 'deny';
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
};

export async function auditPasswordResetEvent(input: PasswordResetAuditInput) {
  await logAuditEvent({
    type: `password_reset_${input.action}`,
    actorUserId: input.userId,
    actorRole: undefined,
    targetType: 'Auth',
    targetId: input.userId,
    message: `Password reset ${input.action}`,
    metadata: {
      emailProviderState: input.emailProviderState,
      resetTokenState: input.resetTokenState,
      ...input.metadata,
    },
    ip: input.ip,
    userAgent: input.userAgent,
    success: input.outcome === 'allow',
  });
}
