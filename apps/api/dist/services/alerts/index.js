"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAlertNetwork = buildAlertNetwork;
const buildInvestorNotifications_1 = require("./buildInvestorNotifications");
const triggerInfrastructureAlerts_1 = require("./triggerInfrastructureAlerts");
const triggerMarketShiftAlerts_1 = require("./triggerMarketShiftAlerts");
const triggerOpportunityAlerts_1 = require("./triggerOpportunityAlerts");
function buildAlertNetwork(input) {
    const opportunityAlerts = (0, triggerOpportunityAlerts_1.triggerOpportunityAlerts)({
        opportunityScore: input.opportunityScore,
        volatilityIndex: input.volatilityIndex,
    });
    const marketShiftAlerts = (0, triggerMarketShiftAlerts_1.triggerMarketShiftAlerts)({
        marketMomentum: input.marketMomentum,
        previousMomentum: input.previousMomentum,
        volatilityIndex: input.volatilityIndex,
    });
    const infrastructureAlerts = (0, triggerInfrastructureAlerts_1.triggerInfrastructureAlerts)({
        infrastructureImpact: input.infrastructureImpact,
    });
    const alertSignals = [...opportunityAlerts, ...marketShiftAlerts, ...infrastructureAlerts];
    const notifications = (0, buildInvestorNotifications_1.buildInvestorNotifications)({
        investorSignal: input.investorSignal,
        opportunityScore: input.opportunityScore,
        volatilityIndex: input.volatilityIndex,
        alertSignals,
    });
    return {
        alertSignals,
        notifications,
        counts: {
            opportunity: opportunityAlerts.length,
            marketShift: marketShiftAlerts.length,
            infrastructure: infrastructureAlerts.length,
        },
    };
}
