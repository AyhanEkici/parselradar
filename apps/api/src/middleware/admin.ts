import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { logAuditEvent } from '../utils/auditLog';

export const admin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'ADMIN') {
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
  next();
};
