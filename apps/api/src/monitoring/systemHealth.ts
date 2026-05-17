import { SecuritySignal } from '../runtime/runtimeState';

export function systemHealth(input: {
  runtimeState: string;
  queueFailed: number;
  workerFailed: number;
  securitySignals: SecuritySignal[];
}) {
  const hasHighSecurity = input.securitySignals.some((s) => s.level === 'high');

  if (input.runtimeState === 'FAILED' || input.queueFailed > 0 || input.workerFailed > 0 || hasHighSecurity) {
    return {
      overall: 'FAILED' as const,
      detail: 'System has failed components or high-severity security signals.',
    };
  }

  if (input.runtimeState === 'DEGRADED' || input.securitySignals.length > 0) {
    return {
      overall: 'DEGRADED' as const,
      detail: 'System is operational with degraded runtime or non-critical security signals.',
    };
  }

  if (input.runtimeState === 'NOT_CONFIGURED' || input.runtimeState === 'DISABLED') {
    return {
      overall: input.runtimeState as 'NOT_CONFIGURED' | 'DISABLED',
      detail: 'System runtime infrastructure is not configured or disabled.',
    };
  }

  return {
    overall: input.runtimeState === 'RUNNING' ? 'RUNNING' as const : 'READY' as const,
    detail: 'System runtime is healthy and ready.',
  };
}
