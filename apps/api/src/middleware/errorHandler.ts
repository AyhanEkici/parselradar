import { Request, Response } from 'express';

export function errorHandler(err: unknown, req: Request, res: Response) {
  console.error(err);
  if (typeof err === 'object' && err && 'status' in err && 'message' in err) {
    res.status((err as { status: number }).status || 500).json({ error: (err as { message: string }).message || 'Sunucu hatası' });
  } else {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
}
