import { Request, Response } from 'express';
import { buildOperationalSnapshot } from '../monitoring/buildOperationalSnapshot';

export function healthController(req: Request, res: Response) {
  const snapshot = buildOperationalSnapshot();
  res.setHeader('X-Request-Id', (req as any).requestId || '');
  res.json({
    status: snapshot.healthSummary.overall,
    runtimeStatus: snapshot.runtimeStatus,
    queueStates: snapshot.queueStates,
    workerStates: snapshot.workerStates,
    runtimeMetrics: snapshot.runtimeMetrics,
    operationalSnapshot: snapshot.operationalSnapshot,
    securitySignals: snapshot.securitySignals,
    healthSummary: snapshot.healthSummary,
    requestId: (req as any).requestId,
  });
}
