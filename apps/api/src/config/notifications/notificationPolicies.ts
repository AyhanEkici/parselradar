import { NotificationType } from '../../models/NotificationPreference';

export const SUPPORTED_NOTIFICATION_TYPES: NotificationType[] = [
  'opportunity_detected',
  'market_shift',
  'infrastructure_signal',
  'stale_analysis',
  'connector_failed',
  'portfolio_risk',
  'workspace_activity',
];

export const DEFAULT_NOTIFICATION_POLICY = {
  emailEnabled: false,
  inAppEnabled: true,
  digestEnabled: true,
  digestSchedule: 'daily' as 'daily' | 'weekly' | 'off',
  mutedTypes: [] as NotificationType[],
};
