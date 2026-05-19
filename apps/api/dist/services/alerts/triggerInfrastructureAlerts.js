"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerInfrastructureAlerts = triggerInfrastructureAlerts;
const alertPolicies_1 = require("../../config/connectors/alertPolicies");
function triggerInfrastructureAlerts(input) {
    const alerts = [];
    if ((input.infrastructureImpact || 0) >= alertPolicies_1.ALERT_POLICIES.infrastructure.minInfrastructureImpact) {
        alerts.push('infrastructure_impact_elevated');
    }
    return alerts;
}
