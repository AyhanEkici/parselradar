import type { NextFunction, Request, Response } from 'express';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(err);
  const statusCode =
    typeof err === 'object' &&
    err !== null &&
    'statusCode' in err &&
    typeof (err as { statusCode?: unknown }).statusCode === 'number'
      ? (err as { statusCode: number }).statusCode
      : 500;

  const message =
    typeof err === 'object' &&
    err !== null &&
    'message' in err &&
    typeof (err as { message?: unknown }).message === 'string'
      ? (err as { message: string }).message
      : 'Internal server error';

  res.status(statusCode).json({
    error: message,
  });
}
