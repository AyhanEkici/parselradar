import { Request, Response } from 'express';
import { buildOperationalSnapshot } from '../monitoring/buildOperationalSnapshot';
import { getRuntimeDiagnostics } from '../runtime/degradedRuntime';

export async function healthController(req: Request, res: Response) {
  const snapshot = await buildOperationalSnapshot();
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
    runtimeDiagnostics: getRuntimeDiagnostics(),
  });
}
