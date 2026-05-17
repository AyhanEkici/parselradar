export function resolveAutoscalingPolicy() {
  const minReplicas = Number(process.env.AUTOSCALE_MIN_REPLICAS || 1);
  const maxReplicas = Number(process.env.AUTOSCALE_MAX_REPLICAS || 1);
  const cpuTarget = Number(process.env.AUTOSCALE_CPU_TARGET || 70);
  const enabled = Boolean(process.env.AUTOSCALE_ENABLED === 'true');

  return {
    scalingStatus: enabled ? 'CONFIGURED' : 'DISABLED',
    policy: {
      enabled,
      minReplicas,
      maxReplicas,
      cpuTarget,
    },
  };
}
