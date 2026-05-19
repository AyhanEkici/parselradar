import { NextFunction, Response } from 'express';
import { AuthRequest } from './auth';
import { isAdmin, getUserId } from '../utils/ownership';

type ScopedQueryOptions = {
  ownerField?: string;
};

export function scopedQueryMiddleware(options: ScopedQueryOptions = {}) {
  const ownerField = options.ownerField || 'userId';
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    const scope = (req as any).scope || {};
    if (isAdmin(req.user)) {
      (req as any).scope = { ...scope, ownerScoped: false };
      return next();
    }

    (req as any).scope = {
      ...scope,
      ownerScoped: true,
      filter: {
        ...(scope.filter || {}),
        [ownerField]: getUserId(req.user),
      },
    };
    return next();
  };
}
