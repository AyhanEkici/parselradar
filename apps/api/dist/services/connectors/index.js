"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildConnectorNetwork = buildConnectorNetwork;
const demographicConnector_1 = require("./demographicConnector");
const infrastructureConnector_1 = require("./infrastructureConnector");
const listingConnector_1 = require("./listingConnector");
const municipalityConnector_1 = require("./municipalityConnector");
const tkgmConnector_1 = require("./tkgmConnector");
function buildConnectorNetwork(input) {
    const districtKey = `${String(input.city || '').toLowerCase()}:${String(input.district || '').toLowerCase()}`;
    const snapshots = [
        (0, municipalityConnector_1.municipalityConnector)({
            city: input.city,
            district: input.district,
            lastRefreshAt: input.lastSpatialRefresh,
        }),
        (0, tkgmConnector_1.tkgmConnector)({
            parcelId: input.parcelId,
            lastRefreshAt: input.lastSpatialRefresh,
        }),
        (0, listingConnector_1.listingConnector)({
            districtKey,
            lastRefreshAt: input.lastMarketRefresh,
        }),
        (0, infrastructureConnector_1.infrastructureConnector)({
            city: input.city,
            lastRefreshAt: input.lastSpatialRefresh,
        }),
        (0, demographicConnector_1.demographicConnector)({
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
