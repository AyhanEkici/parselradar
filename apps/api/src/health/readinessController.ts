import { Request, Response } from 'express';
import { buildOperationalSnapshot } from '../monitoring/buildOperationalSnapshot';

export async function readinessController(req: Request, res: Response) {
  const snapshot = await buildOperationalSnapshot();
  const readyStates = ['READY', 'RUNNING'];
  const isReady = readyStates.includes(snapshot.runtimeStatus.state);

  res.status(isReady ? 200 : 503).json({
    status: isReady ? 'ready' : 'not_ready',
    runtimeState: snapshot.runtimeStatus.state,
    healthSummary: snapshot.healthSummary,
    requestId: (req as any).requestId,
  });
}
