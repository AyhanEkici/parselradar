import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env';
import User from '../models/User';
import { recordAccessDecision } from '../utils/accessAudit';


export interface AuthRequest extends Request {
  user?: {
    _id: string;
    email: string;
    name: string;
    role: 'USER' | 'ADMIN';
  };
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }
  if (!token) {
    await recordAccessDecision({
      userId: undefined,
      role: undefined,
      resourceType: 'Auth',
      decision: 'deny',
      reason: 'missing_token',
      route: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('user-agent') || undefined,
    });
    return res.status(401).json({ error: 'Yetkisiz' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await User.findById(decoded.id);
    if (!user) {
      await recordAccessDecision({
        userId: decoded.id,
        role: undefined,
        resourceType: 'Auth',
        resourceId: decoded.id,
        decision: 'deny',
        reason: 'token_user_not_found',
        route: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('user-agent') || undefined,
      });
      return res.status(401).json({ error: 'Kullanıcı bulunamadı' });
    }
    req.user = {
      _id: String(user._id),
      email: user.email,
      name: user.name,
      role: user.role,
    };
    next();
  } catch {
    await recordAccessDecision({
      userId: undefined,
      role: undefined,
      resourceType: 'Auth',
      decision: 'deny',
      reason: 'invalid_token',
      route: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('user-agent') || undefined,
    });
    return res.status(401).json({ error: 'Geçersiz oturum' });
  }
};

export const auth = requireAuth;
