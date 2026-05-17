export const NOTIFICATION_CHANNELS = ['IN_APP', 'EMAIL'] as const;

export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

export const DELIVERY_STATES = [
  'NOT_CONFIGURED',
  'DISABLED',
  'QUEUED',
  'SENT',
  'FAILED',
  'SUPPRESSED',
] as const;

export type DeliveryState = (typeof DELIVERY_STATES)[number];
