// apps/api/src/middleware/requestId.ts
import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  let requestId = req.headers['x-request-id'];
  if (Array.isArray(requestId)) requestId = requestId[0];
  if (!requestId) requestId = uuidv4();
  req.requestId = String(requestId);
  res.setHeader('X-Request-Id', requestId);
  next();
}
