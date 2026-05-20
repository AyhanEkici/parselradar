import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { logAuditEvent } from '../utils/auditLog';
import { recordAccessDecision } from '../utils/accessAudit';

export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const normalizedRole = String(req.user?.role || '').toUpperCase();
  if (!req.user || normalizedRole !== 'ADMIN') {
    await recordAccessDecision({
      userId: req.user?._id?.toString(),
      role: req.user?.role,
      resourceType: 'AdminRoute',
      resourceId: req.path,
      decision: 'deny',
      reason: 'admin_required',
      route: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('user-agent') || undefined,
    });
    await logAuditEvent({
      type: 'admin_forbidden',
      actorUserId: req.user?._id?.toString(),
      actorRole: req.user?.role,
      targetType: 'AdminRoute',
      targetId: req.path,
      message: 'Forbidden admin access attempt',
      metadata: { path: req.path, method: req.method },
      ip: req.ip,
      userAgent: req.get('user-agent'),
      success: false,
    });
    return res.status(403).json({ error: 'Yönetici yetkisi gerekli' });
  }

  await recordAccessDecision({
    userId: req.user._id?.toString(),
    role: normalizedRole,
    resourceType: 'AdminRoute',
    resourceId: req.path,
    decision: 'allow',
    reason: 'admin_verified',
    route: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent') || undefined,
  });
  next();
};

export const admin = requireAdmin;
