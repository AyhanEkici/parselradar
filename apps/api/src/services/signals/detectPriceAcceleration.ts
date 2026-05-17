import { SIGNAL_THRESHOLDS } from '../../config/connectors/signalThresholds';

export function detectPriceAcceleration(input: {
  currentAvgPricePerM2?: number;
  baselinePricePerM2?: number;
}) {
  const current = input.currentAvgPricePerM2 || 0;
  const baseline = input.baselinePricePerM2 || current || 1;
  const deltaRatio = baseline > 0 ? (current - baseline) / baseline : 0;

  const accelerationLevel = deltaRatio >= SIGNAL_THRESHOLDS.acceleration.strong
    ? 'STRONG'
    : deltaRatio >= SIGNAL_THRESHOLDS.acceleration.moderate
      ? 'MODERATE'
      : deltaRatio <= -SIGNAL_THRESHOLDS.acceleration.moderate
        ? 'COOLING'
        : 'FLAT';

  const accelerationScore = Math.max(0, Math.min(100, Math.round(50 + deltaRatio * 260)));

  return {
    accelerationLevel,
    accelerationScore,
    deltaRatio,
    signal: `price_acceleration_${accelerationLevel.toLowerCase()}`,
  };
}
