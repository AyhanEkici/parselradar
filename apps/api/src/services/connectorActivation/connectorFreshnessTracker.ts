import { CONNECTOR_SCHEDULES } from '../../config/connectors/connectorSchedules';

export type ConnectorFreshnessProof = {
  connectorKey: string;
  sourceFreshness: 'FRESH' | 'AGING' | 'STALE' | 'UNKNOWN';
  staleFlags: string[];
  freshnessScore: number;
  lastSuccessfulCheck: string | null;
  nextRecommendedCheck: string | null;
};

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function resolveSchedule(connectorKey: string): { staleAfterMinutes: number; cadenceMinutes: number } | null {
  if (connectorKey === 'tkgm_parcel') return CONNECTOR_SCHEDULES.tkgm;
  if (connectorKey === 'municipality_zoning') return CONNECTOR_SCHEDULES.municipality;
  if (connectorKey === 'listing_feed') return CONNECTOR_SCHEDULES.listing;
  if (connectorKey === 'infrastructure_feed') return CONNECTOR_SCHEDULES.infrastructure;
  if (connectorKey === 'demographic_feed') return CONNECTOR_SCHEDULES.demographic;
  return null;
}

export function buildConnectorFreshness(params: {
  connectorKey: string;
  now: Date;
  lastSuccessfulCheckAt?: Date | null;
}): ConnectorFreshnessProof {
  const { connectorKey, now, lastSuccessfulCheckAt } = params;
  const schedule = resolveSchedule(connectorKey);

  if (!schedule || !lastSuccessfulCheckAt) {
    return {
      connectorKey,
      sourceFreshness: 'UNKNOWN',
      staleFlags: schedule ? ['NO_SUCCESSFUL_CHECK_RECORDED'] : ['NO_SCHEDULE_DEFINED'],
      freshnessScore: 0,
      lastSuccessfulCheck: lastSuccessfulCheckAt ? lastSuccessfulCheckAt.toISOString() : null,
      nextRecommendedCheck: schedule ? new Date(now.getTime() + schedule.cadenceMinutes * 60 * 1000).toISOString() : null,
    };
  }

  const ageMinutes = (now.getTime() - lastSuccessfulCheckAt.getTime()) / 1000 / 60;
  const staleFlags: string[] = [];
  let sourceFreshness: ConnectorFreshnessProof['sourceFreshness'] = 'FRESH';

  if (ageMinutes >= schedule.staleAfterMinutes) {
    sourceFreshness = 'STALE';
    staleFlags.push('STALE_OVER_THRESHOLD');
  } else if (ageMinutes >= schedule.cadenceMinutes) {
    sourceFreshness = 'AGING';
    staleFlags.push('OVER_CADENCE');
  }

  const freshnessScore = clampScore(100 - (ageMinutes / schedule.staleAfterMinutes) * 100);
  const nextRecommendedCheck = new Date(lastSuccessfulCheckAt.getTime() + schedule.cadenceMinutes * 60 * 1000);

  return {
    connectorKey,
    sourceFreshness,
    staleFlags,
    freshnessScore,
    lastSuccessfulCheck: lastSuccessfulCheckAt.toISOString(),
    nextRecommendedCheck: nextRecommendedCheck.toISOString(),
  };
}

