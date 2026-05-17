export function resolveTracingPolicy() {
  const enabled = process.env.TRACING_ENABLED === 'true';
  const sampleRate = Number(process.env.TRACING_SAMPLE_RATE || 0);
  const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || '';

  const tracingState = !enabled ? 'DISABLED' : endpoint ? 'READY' : 'NOT_CONFIGURED';

  return {
    tracingState,
    enabled,
    sampleRate,
    endpointConfigured: Boolean(endpoint),
  };
}
