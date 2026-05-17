export const DIGEST_SCHEDULES = {
  daily: {
    label: 'Daily',
    cronHint: '0 8 * * *',
  },
  weekly: {
    label: 'Weekly',
    cronHint: '0 8 * * 1',
  },
  off: {
    label: 'Disabled',
    cronHint: '-',
  },
} as const;
