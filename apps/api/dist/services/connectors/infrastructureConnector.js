"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.infrastructureConnector = infrastructureConnector;
const connectorSchedules_1 = require("../../config/connectors/connectorSchedules");
function parseDate(value) {
    if (!value)
        return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}
function infrastructureConnector(input) {
    const endpoint = process.env.INFRA_CONNECTOR_URL;
    const mockDisabled = process.env.INFRA_CONNECTOR_MOCK === 'disabled';
    const failFlag = process.env.INFRA_CONNECTOR_FAIL === '1';
    const liveFlag = process.env.INFRA_CONNECTOR_LIVE === '1';
    const lastRefresh = parseDate(input.lastRefreshAt);
    let status = 'READY';
    let reason = 'Infrastructure connector prepared for deterministic snapshots.';
    if (!endpoint) {
        status = mockDisabled ? 'MOCK_DISABLED' : 'NOT_CONFIGURED';
        reason = mockDisabled
            ? 'Infrastructure connector mock mode is disabled and endpoint is missing.'
            : 'Infrastructure endpoint is not configured. Live feed is inactive.';
    }
    else if (failFlag) {
        status = 'FAILED';
        reason = 'Infrastructure connector failure flag is enabled.';
    }
    else if (lastRefresh) {
        const ageMinutes = (Date.now() - lastRefresh.getTime()) / 60000;
        if (ageMinutes > connectorSchedules_1.CONNECTOR_SCHEDULES.infrastructure.staleAfterMinutes) {
            status = 'STALE';
            reason = `Infrastructure snapshot is stale (${Math.round(ageMinutes)} min).`;
        }
        else {
            status = liveFlag ? 'LIVE' : 'READY';
            reason = liveFlag ? 'Infrastructure connector is marked live by configuration.' : 'Infrastructure connector is ready.';
        }
    }
    else {
        status = liveFlag ? 'LIVE' : 'READY';
        reason = liveFlag ? 'Infrastructure connector is marked live by configuration.' : 'Infrastructure connector configured without refresh history.';
    }
    return {
        connector: 'infrastructure',
        status,
        reason,
        source: endpoint || null,
        city: input.city || null,
        checkedAt: new Date().toISOString(),
    };
}
