export function requestAnomalyEngine(input: { distinctRoutes: number; failedRequests: number; adminAttempts: number }) {
  const anomalyScore = input.distinctRoutes * 3 + input.failedRequests * 8 + input.adminAttempts * 12;
  return {
    anomalyScore,
    anomaly: anomalyScore >= 80,
  };
}
