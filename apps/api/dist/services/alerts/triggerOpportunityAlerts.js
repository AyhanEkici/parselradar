"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerOpportunityAlerts = triggerOpportunityAlerts;
const alertPolicies_1 = require("../../config/connectors/alertPolicies");
function triggerOpportunityAlerts(input) {
    const alerts = [];
    if ((input.opportunityScore || 0) >= alertPolicies_1.ALERT_POLICIES.opportunity.minOpportunityScore) {
        alerts.push('opportunity_score_threshold_crossed');
    }
    if ((input.opportunityScore || 0) >= alertPolicies_1.ALERT_POLICIES.opportunity.minOpportunityScore &&
        (input.volatilityIndex || 0) <= alertPolicies_1.ALERT_POLICIES.opportunity.maxVolatilityForStrongBuy) {
        alerts.push('opportunity_window_actionable');
    }
    return alerts;
}
