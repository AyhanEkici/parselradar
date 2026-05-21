import type { NextFunction, Request, Response } from 'express';
import { recordFailedRequest, recordRetryEvent } from '../observability/operationalIntegrityStore';
import { logAuditEvent } from '../utils/auditLog';

export function operationalTelemetry(req: Request, res: Response, next: NextFunction) {
  const retryHeader = Number(req.headers['x-client-retry-attempts'] || 0);
  if (Number.isFinite(retryHeader) && retryHeader > 0) {
    recordRetryEvent({
      at: new Date().toISOString(),
      method: req.method,
      path: req.originalUrl,
      attempts: retryHeader,
    });
    void logAuditEvent({
      type: 'client_request_retried',
      actorUserId: String((req as any).user?._id || ''),
      actorRole: String((req as any).user?.role || ''),
      targetType: 'ApiRequest',
      targetId: req.originalUrl,
      message: 'Client request used retry flow',
      metadata: {
        method: req.method,
        path: req.originalUrl,
        attempts: retryHeader,
      },
      ip: req.ip,
      userAgent: req.get('user-agent'),
      success: true,
    });
  }

  res.on('finish', () => {
    if (res.statusCode >= 400) {
      recordFailedRequest({
        at: new Date().toISOString(),
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        requestId: (req as any).requestId || '',
      });
    }
  });

  next();
}
