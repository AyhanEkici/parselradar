export function buildSystemCapacity() {
  const cpuCount = Number(process.env.RUNTIME_CPU_CORES || 1);
  const memoryMb = Number(process.env.RUNTIME_MEMORY_MB || 1024);
  const nodeEnv = process.env.NODE_ENV || 'development';

  return {
    runtimeCapacity: {
      cpuCount,
      memoryMb,
      nodeEnv,
      status: nodeEnv === 'production' ? 'PRODUCTION_PROFILE' : 'NON_PRODUCTION_PROFILE',
    },
  };
}
