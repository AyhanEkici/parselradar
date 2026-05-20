export function rateAnomalyDetector(input: { baselineRpm: number; currentRpm: number }) {
  const ratio = input.baselineRpm <= 0 ? 0 : input.currentRpm / input.baselineRpm;
  return {
    ratio,
    anomaly: ratio >= 3,
  };
}
