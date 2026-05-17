import { CONNECTOR_SCHEDULES } from '../../config/connectors/connectorSchedules';
import type { ConnectorStatus } from './municipalityConnector';

type ConnectorInput = { parcelId?: string; lastRefreshAt?: Date | string | null };

function parseDate(value?: Date | string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function tkgmConnector(input: ConnectorInput) {
  const endpoint = process.env.TKGM_CONNECTOR_URL;
  const token = process.env.TKGM_CONNECTOR_TOKEN;
  const mockDisabled = process.env.TKGM_CONNECTOR_MOCK === 'disabled';
  const failFlag = process.env.TKGM_CONNECTOR_FAIL === '1';
  const liveFlag = process.env.TKGM_CONNECTOR_LIVE === '1';
  const lastRefresh = parseDate(input.lastRefreshAt);

  let status: ConnectorStatus = 'READY';
  let reason = 'TKGM connector configured for deterministic handshake.';

  if (!endpoint || !token) {
    status = mockDisabled ? 'MOCK_DISABLED' : 'NOT_CONFIGURED';
    reason = mockDisabled
      ? 'TKGM credentials are missing and mock mode is disabled.'
      : 'TKGM endpoint/token are not configured. No live parcel sync is active.';
  } else if (failFlag) {
    status = 'FAILED';
    reason = 'Environment failure flag marks TKGM connector as failed.';
  } else if (lastRefresh) {
    const ageMinutes = (Date.now() - lastRefresh.getTime()) / 60000;
    if (ageMinutes > CONNECTOR_SCHEDULES.tkgm.staleAfterMinutes) {
      status = 'STALE';
      reason = `TKGM snapshot is stale (${Math.round(ageMinutes)} min).`;
    } else {
      status = liveFlag ? 'LIVE' : 'READY';
      reason = liveFlag ? 'TKGM connector is marked live by configuration.' : 'TKGM connector ready for pull.';
    }
  } else {
    status = liveFlag ? 'LIVE' : 'READY';
    reason = liveFlag ? 'TKGM connector is marked live by configuration.' : 'TKGM connector configured without refresh history.';
  }

  return {
    connector: 'tkgm',
    status,
    reason,
    source: endpoint || null,
    parcelId: input.parcelId || null,
    checkedAt: new Date().toISOString(),
  };
}
