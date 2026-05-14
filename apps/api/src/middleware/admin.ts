import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const admin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Yönetici yetkisi gerekli' });
  }
  next();
};
