import { connectorFreshnessEnvelope } from '../freshness/connectorFreshnessEnvelope';
import { staleDataDetector } from '../freshness/staleDataDetector';

export function ingestionFreshnessManager(input: {
  connectorKey: string;
  ingestedAt: string;
  observedAt: string;
  maxAgeHours: number;
  stalePenalty?: number;
  sourceStatuses: string[];
}) {
  const envelope = connectorFreshnessEnvelope({
    connectorKey: input.connectorKey,
    ingestedAt: input.ingestedAt,
    observedAt: input.observedAt,
    maxAgeHours: input.maxAgeHours,
    stalePenalty: input.stalePenalty,
  });

  const stale = staleDataDetector({
    freshnessScore: envelope.freshnessScore,
    sourceStatuses: input.sourceStatuses,
  });

  return {
    ...envelope,
    stale,
  };
}
