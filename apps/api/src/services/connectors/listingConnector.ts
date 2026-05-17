import { CONNECTOR_SCHEDULES } from '../../config/connectors/connectorSchedules';
import type { ConnectorStatus } from './municipalityConnector';

type ConnectorInput = { districtKey?: string; lastRefreshAt?: Date | string | null };

function parseDate(value?: Date | string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function listingConnector(input: ConnectorInput) {
  const endpoint = process.env.LISTING_CONNECTOR_URL;
  const mockDisabled = process.env.LISTING_CONNECTOR_MOCK === 'disabled';
  const failFlag = process.env.LISTING_CONNECTOR_FAIL === '1';
  const liveFlag = process.env.LISTING_CONNECTOR_LIVE === '1';
  const lastRefresh = parseDate(input.lastRefreshAt);

  let status: ConnectorStatus = 'READY';
  let reason = 'Listing connector prepared for deterministic ingestion.';

  if (!endpoint) {
    status = mockDisabled ? 'MOCK_DISABLED' : 'NOT_CONFIGURED';
    reason = mockDisabled
      ? 'Listing endpoint missing and mock pipeline disabled.'
      : 'Listing endpoint is not configured; external listing feed is inactive.';
  } else if (failFlag) {
    status = 'FAILED';
    reason = 'Listing connector failure flag is active.';
  } else if (lastRefresh) {
    const ageMinutes = (Date.now() - lastRefresh.getTime()) / 60000;
    if (ageMinutes > CONNECTOR_SCHEDULES.listing.staleAfterMinutes) {
      status = 'STALE';
      reason = `Listing snapshot is stale (${Math.round(ageMinutes)} min).`;
    } else {
      status = liveFlag ? 'LIVE' : 'READY';
      reason = liveFlag ? 'Listing connector is marked live by configuration.' : 'Listing connector is ready.';
    }
  } else {
    status = liveFlag ? 'LIVE' : 'READY';
    reason = liveFlag ? 'Listing connector is marked live by configuration.' : 'Listing connector configured without refresh history.';
  }

  return {
    connector: 'listing',
    status,
    reason,
    source: endpoint || null,
    districtKey: input.districtKey || null,
    checkedAt: new Date().toISOString(),
  };
}
