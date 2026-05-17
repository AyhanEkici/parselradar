import { resolveTracingPolicy } from '../config/observability/tracingPolicies';

export function buildTracingSnapshot() {
  const tracing = resolveTracingPolicy();
  return {
    tracingState: tracing.tracingState,
    tracing,
  };
}
