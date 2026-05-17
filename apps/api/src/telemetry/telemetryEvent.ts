import { buildTraceContext } from './traceContext';

export function buildTelemetryEvent(input: {
  name: string;
  level?: 'info' | 'warn' | 'error';
  requestId?: string;
  route?: string;
  actorUserId?: string;
  metadata?: Record<string, unknown>;
}) {
  return {
    name: input.name,
    level: input.level || 'info',
    trace: buildTraceContext({
      requestId: input.requestId,
      route: input.route,
      actorUserId: input.actorUserId,
    }),
    metadata: input.metadata || {},
    createdAt: new Date().toISOString(),
  };
}
