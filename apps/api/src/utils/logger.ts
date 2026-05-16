// apps/api/src/utils/logger.ts
import { ENV } from '../config/env';

export function logInfo(msg: string, meta?: any, requestId?: string) {
  const rid = requestId ? `[requestId:${requestId}]` : '';
  if (ENV.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.info('[INFO]', rid, msg, meta || '');
  }
}

export function logWarn(msg: string, meta?: any, requestId?: string) {
  const rid = requestId ? `[requestId:${requestId}]` : '';
  // eslint-disable-next-line no-console
  console.warn('[WARN]', rid, msg, meta || '');
}

export function logError(msg: string, meta?: any, requestId?: string) {
  const rid = requestId ? `[requestId:${requestId}]` : '';
  // eslint-disable-next-line no-console
  console.error('[ERROR]', rid, msg, meta || '');
}

export function logStartup(requestId?: string) {
  logInfo('API startup', { env: ENV.NODE_ENV, port: ENV.PORT }, requestId);
}
