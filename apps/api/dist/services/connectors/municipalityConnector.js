"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.municipalityConnector = municipalityConnector;
const connectorSchedules_1 = require("../../config/connectors/connectorSchedules");
function toDate(value) {
    if (!value)
        return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}
function municipalityConnector(input) {
    const endpoint = process.env.MUNICIPALITY_CONNECTOR_URL;
    const mockDisabled = process.env.MUNICIPALITY_CONNECTOR_MOCK === 'disabled';
    const failFlag = process.env.MUNICIPALITY_CONNECTOR_FAIL === '1';
    const liveFlag = process.env.MUNICIPALITY_CONNECTOR_LIVE === '1';
    const lastRefresh = toDate(input.lastRefreshAt);
    let status = 'READY';
    let reason = 'Municipality connector configured for deterministic processing.';
    if (!endpoint) {
        status = mockDisabled ? 'MOCK_DISABLED' : 'NOT_CONFIGURED';
        reason = mockDisabled
            ? 'No endpoint configured and mock mode explicitly disabled.'
            : 'No endpoint configured. External municipality feed is inactive.';
    }
    else if (failFlag) {
        status = 'FAILED';
        reason = 'Connector failure flag is enabled by environment configuration.';
    }
    else if (lastRefresh) {
        const ageMinutes = (Date.now() - lastRefresh.getTime()) / 60000;
        if (ageMinutes > connectorSchedules_1.CONNECTOR_SCHEDULES.municipality.staleAfterMinutes) {
            status = 'STALE';
            reason = `Last refresh is stale (${Math.round(ageMinutes)} min).`;
        }
        else {
            status = liveFlag ? 'LIVE' : 'READY';
            reason = liveFlag
                ? 'Connector is marked live by configuration.'
                : 'Connector is configured but not marked as live.';
        }
    }
    else {
        status = liveFlag ? 'LIVE' : 'READY';
        reason = liveFlag
            ? 'Connector is marked live by configuration.'
            : 'No refresh timestamp yet; connector remains ready.';
    }
    return {
        connector: 'municipality',
        status,
        reason,
        source: endpoint || null,
        city: input.city || null,
        district: input.district || null,
        checkedAt: new Date().toISOString(),
    };
}
