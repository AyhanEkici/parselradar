import { demographicConnector } from './demographicConnector';
import { infrastructureConnector } from './infrastructureConnector';
import { listingConnector } from './listingConnector';
import { municipalityConnector, type ConnectorStatus } from './municipalityConnector';
import { tkgmConnector } from './tkgmConnector';

export type ConnectorSnapshot = {
  connector: string;
  status: ConnectorStatus;
  reason: string;
  source: string | null;
  checkedAt: string;
  [key: string]: unknown;
};

export function buildConnectorNetwork(input: {
  city?: string;
  district?: string;
  parcelId?: string;
  lastSpatialRefresh?: Date | string | null;
  lastMarketRefresh?: Date | string | null;
}) {
  const districtKey = `${String(input.city || '').toLowerCase()}:${String(input.district || '').toLowerCase()}`;

  const snapshots: ConnectorSnapshot[] = [
    municipalityConnector({
      city: input.city,
      district: input.district,
      lastRefreshAt: input.lastSpatialRefresh,
    }),
    tkgmConnector({
      parcelId: input.parcelId,
      lastRefreshAt: input.lastSpatialRefresh,
    }),
    listingConnector({
      districtKey,
      lastRefreshAt: input.lastMarketRefresh,
    }),
    infrastructureConnector({
      city: input.city,
      lastRefreshAt: input.lastSpatialRefresh,
    }),
    demographicConnector({
      districtKey,
      lastRefreshAt: input.lastMarketRefresh,
    }),
  ];

  const statuses = snapshots.map((item) => item.status);
  const hasFailed = statuses.includes('FAILED');
  const hasStale = statuses.includes('STALE');
  const hasNotConfigured = statuses.includes('NOT_CONFIGURED') || statuses.includes('MOCK_DISABLED');

  const networkState = hasFailed
    ? 'degraded'
    : hasStale
      ? 'stale'
      : hasNotConfigured
        ? 'partial'
        : statuses.every((status) => status === 'LIVE' || status === 'READY')
          ? 'healthy'
          : 'partial';

  return {
    networkState,
    snapshots,
    statusCounts: {
      NOT_CONFIGURED: statuses.filter((status) => status === 'NOT_CONFIGURED').length,
      MOCK_DISABLED: statuses.filter((status) => status === 'MOCK_DISABLED').length,
      READY: statuses.filter((status) => status === 'READY').length,
      FAILED: statuses.filter((status) => status === 'FAILED').length,
      STALE: statuses.filter((status) => status === 'STALE').length,
      LIVE: statuses.filter((status) => status === 'LIVE').length,
    },
  };
}
