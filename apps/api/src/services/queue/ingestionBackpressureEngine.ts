export function ingestionBackpressureEngine(input: {
  queueDepth: number;
  inFlight: number;
  failRatePct: number;
}) {
  const backpressure = input.queueDepth > 20 || input.inFlight > 10 || input.failRatePct >= 25;
  return {
    backpressure,
    mode: backpressure ? 'THROTTLE' : 'NORMAL',
    reason: backpressure
      ? input.failRatePct >= 25
        ? 'high_fail_rate'
        : input.queueDepth > 20
          ? 'queue_depth'
          : 'in_flight'
      : 'healthy_queue',
  };
}
