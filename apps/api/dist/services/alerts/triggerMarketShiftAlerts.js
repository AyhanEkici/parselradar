"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerMarketShiftAlerts = triggerMarketShiftAlerts;
const alertPolicies_1 = require("../../config/connectors/alertPolicies");
function triggerMarketShiftAlerts(input) {
    const alerts = [];
    const shift = Math.abs((input.marketMomentum || 0) - (input.previousMomentum || 0));
    if (shift >= alertPolicies_1.ALERT_POLICIES.marketShift.minMomentumShift) {
        alerts.push('market_momentum_shift_detected');
    }
    if ((input.volatilityIndex || 0) >= alertPolicies_1.ALERT_POLICIES.marketShift.minVolatilitySpike) {
        alerts.push('volatility_spike_detected');
    }
    return alerts;
}
