"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.demographicConnector = demographicConnector;
const connectorSchedules_1 = require("../../config/connectors/connectorSchedules");
function parseDate(value) {
    if (!value)
        return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}
function demographicConnector(input) {
    const endpoint = process.env.DEMOGRAPHIC_CONNECTOR_URL;
    const mockDisabled = process.env.DEMOGRAPHIC_CONNECTOR_MOCK === 'disabled';
    const failFlag = process.env.DEMOGRAPHIC_CONNECTOR_FAIL === '1';
    const liveFlag = process.env.DEMOGRAPHIC_CONNECTOR_LIVE === '1';
    const lastRefresh = parseDate(input.lastRefreshAt);
    let status = 'READY';
    let reason = 'Demographic connector prepared for deterministic trend overlays.';
    if (!endpoint) {
        status = mockDisabled ? 'MOCK_DISABLED' : 'NOT_CONFIGURED';
        reason = mockDisabled
            ? 'Demographic connector endpoint missing and mock mode disabled.'
            : 'Demographic endpoint is not configured. No live demographic sync.';
    }
    else if (failFlag) {
        status = 'FAILED';
        reason = 'Demographic connector failure flag is enabled.';
    }
    else if (lastRefresh) {
        const ageMinutes = (Date.now() - lastRefresh.getTime()) / 60000;
        if (ageMinutes > connectorSchedules_1.CONNECTOR_SCHEDULES.demographic.staleAfterMinutes) {
            status = 'STALE';
            reason = `Demographic snapshot is stale (${Math.round(ageMinutes)} min).`;
        }
        else {
            status = liveFlag ? 'LIVE' : 'READY';
            reason = liveFlag ? 'Demographic connector is marked live by configuration.' : 'Demographic connector is ready.';
        }
    }
    else {
        status = liveFlag ? 'LIVE' : 'READY';
        reason = liveFlag ? 'Demographic connector is marked live by configuration.' : 'Demographic connector configured without refresh history.';
    }
    return {
        connector: 'demographic',
        status,
        reason,
        source: endpoint || null,
        districtKey: input.districtKey || null,
        checkedAt: new Date().toISOString(),
    };
}
