import { resolveAutoscalingPolicy } from '../config/runtime/autoscalingPolicies';

export function buildScalingSnapshot() {
  const scaling = resolveAutoscalingPolicy();
  return {
    scalingStatus: scaling.scalingStatus,
    scalingPolicy: scaling.policy,
  };
}
