"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildProductionAlertState = buildProductionAlertState;
const alertingPolicies_1 = require("../config/observability/alertingPolicies");
function buildProductionAlertState() {
    const alerting = (0, alertingPolicies_1.resolveAlertingPolicy)();
    return {
        productionAlertState: alerting.productionAlertState,
        alerting,
    };
}
