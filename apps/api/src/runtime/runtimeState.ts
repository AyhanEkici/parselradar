export type RuntimeTruthState = 'NOT_CONFIGURED' | 'DISABLED' | 'READY' | 'RUNNING' | 'DEGRADED' | 'FAILED';

export interface QueueState {
  name: string;
  state: RuntimeTruthState;
  reason: string;
  backend: 'redis-bullmq' | 'local-fallback';
  depth: number;
  retries: number;
  failures: number;
  deadLetterReady: boolean;
  checkedAt: string;
}

export interface WorkerState {
  name: string;
  queueName: string;
  state: RuntimeTruthState;
  reason: string;
  concurrency: number;
  checkedAt: string;
}

export interface RuntimeStatus {
  state: RuntimeTruthState;
  reason: string;
  mode: 'production-ready' | 'degraded' | 'standby';
  redisConfigured: boolean;
  bullmqConfigured: boolean;
  checkedAt: string;
}

export interface RuntimeMetrics {
  queueDepthTotal: number;
  failureRatePercent: number;
  analysisThroughputPerHour: number;
  refreshThroughputPerHour: number;
  staleAnalysisCount: number;
  staleRefreshCount: number;
}

export interface SecuritySignal {
  level: 'low' | 'medium' | 'high';
  type: string;
  message: string;
  fingerprint?: string;
}

export interface HealthSummary {
  live: RuntimeTruthState;
  ready: RuntimeTruthState;
  overall: RuntimeTruthState;
  detail: string;
}

export interface OperationalSnapshot {
  runtimeStatus: RuntimeStatus;
  queueStates: QueueState[];
  workerStates: WorkerState[];
  runtimeMetrics: RuntimeMetrics;
  operationalSnapshot: {
    generatedAt: string;
    degradedQueues: number;
    degradedWorkers: number;
    mode: 'production-ready' | 'degraded' | 'standby';
  };
  securitySignals: SecuritySignal[];
  healthSummary: HealthSummary;
}
