import NotificationDelivery from '../models/NotificationDelivery';
import WorkspaceActivity from '../models/WorkspaceActivity';

export async function buildErrorAnalytics() {
  const [failedDeliveries, suppressedDeliveries, failedWorkspaceActions] = await Promise.all([
    NotificationDelivery.countDocuments({ state: 'FAILED' }),
    NotificationDelivery.countDocuments({ state: 'SUPPRESSED' }),
    WorkspaceActivity.countDocuments({ action: { $regex: 'failed', $options: 'i' } }),
  ]);

  const total = failedDeliveries + suppressedDeliveries + failedWorkspaceActions;

  return {
    errorState: total > 0 ? 'DEGRADED' : 'READY',
    failedDeliveries,
    suppressedDeliveries,
    failedWorkspaceActions,
    total,
  };
}
