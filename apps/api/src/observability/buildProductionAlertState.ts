import { resolveAlertingPolicy } from '../config/observability/alertingPolicies';

export function buildProductionAlertState() {
  const alerting = resolveAlertingPolicy();
  return {
    productionAlertState: alerting.productionAlertState,
    alerting,
  };
}
