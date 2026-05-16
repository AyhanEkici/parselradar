import type { NextFunction, Request, Response } from 'express';
import { ENV } from '../config/env';
import { logError } from '../utils/logger';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
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

  const requestId = req.requestId || '';

  // Log error with requestId
  logError('API error', { requestId, err });

  // Safe error response
  const errorResponse: any = {
    error: message,
    requestId,
  };
  if (ENV.NODE_ENV !== 'production' && err instanceof Error) {
    errorResponse.stack = err.stack;
  }

  res.setHeader('X-Request-Id', requestId);
  res.status(statusCode).json(errorResponse);
}
