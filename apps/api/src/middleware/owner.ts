import { NextFunction, Response } from 'express';
import { AuthRequest } from './auth';
import { recordAccessDecision } from '../utils/accessAudit';
import { assertOwnerOrAdmin, getUserId, isAdmin } from '../utils/ownership';

type OwnerResolver = (req: AuthRequest) => string | undefined | null;

export function requireOwnerOrAdmin(resolver: OwnerResolver) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const ownerId = resolver(req);
      assertOwnerOrAdmin({ userId: ownerId || undefined }, req.user);
      await recordAccessDecision({
        userId: getUserId(req.user),
        role: req.user?.role,
        resourceType: 'OwnedRoute',
        resourceId: ownerId || undefined,
        decision: 'allow',
        reason: isAdmin(req.user) ? 'admin_bypass' : 'owner_match',
        route: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('user-agent') || undefined,
      });
      return next();
    } catch {
      await recordAccessDecision({
        userId: getUserId(req.user),
        role: req.user?.role,
        resourceType: 'OwnedRoute',
        resourceId: undefined,
        decision: 'deny',
        reason: 'owner_or_admin_required',
        route: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('user-agent') || undefined,
      });
      return res.status(403).json({ error: 'Forbidden' });
    }
  };
}
