import { Request, Response } from 'express';

export function livenessController(req: Request, res: Response) {
  res.status(200).json({
    status: 'live',
    timestamp: new Date().toISOString(),
    requestId: (req as any).requestId,
  });
}
