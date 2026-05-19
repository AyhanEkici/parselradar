import { freshnessScoreEngine } from './freshnessScoreEngine';

export function connectorFreshnessEnvelope(input: {
  connectorKey: string;
  ingestedAt: string;
  observedAt: string;
  maxAgeHours: number;
  stalePenalty?: number;
}) {
  const freshness = freshnessScoreEngine({
    observedAt: input.observedAt,
    ingestedAt: input.ingestedAt,
    maxAgeHours: input.maxAgeHours,
    stalePenalty: input.stalePenalty,
  });

  return {
    connectorKey: input.connectorKey,
    ingestedAt: input.ingestedAt,
    observedAt: input.observedAt,
    freshnessScore: freshness.score,
    freshnessState: freshness.freshness,
    ageHours: freshness.ageHours,
  };
}
