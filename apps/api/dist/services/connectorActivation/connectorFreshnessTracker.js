"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildConnectorFreshness = buildConnectorFreshness;
const connectorSchedules_1 = require("../../config/connectors/connectorSchedules");
function clampScore(score) {
    return Math.max(0, Math.min(100, Math.round(score)));
}
function resolveSchedule(connectorKey) {
    if (connectorKey === 'tkgm_parcel')
        return connectorSchedules_1.CONNECTOR_SCHEDULES.tkgm;
    if (connectorKey === 'municipality_zoning')
        return connectorSchedules_1.CONNECTOR_SCHEDULES.municipality;
    if (connectorKey === 'listing_feed')
        return connectorSchedules_1.CONNECTOR_SCHEDULES.listing;
    if (connectorKey === 'infrastructure_feed')
        return connectorSchedules_1.CONNECTOR_SCHEDULES.infrastructure;
    if (connectorKey === 'demographic_feed')
        return connectorSchedules_1.CONNECTOR_SCHEDULES.demographic;
    return null;
}
function buildConnectorFreshness(params) {
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
    const staleFlags = [];
    let sourceFreshness = 'FRESH';
    if (ageMinutes >= schedule.staleAfterMinutes) {
        sourceFreshness = 'STALE';
        staleFlags.push('STALE_OVER_THRESHOLD');
    }
    else if (ageMinutes >= schedule.cadenceMinutes) {
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
