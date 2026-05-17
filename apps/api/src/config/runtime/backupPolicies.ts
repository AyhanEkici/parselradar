export function resolveBackupPolicy() {
  const enabled = process.env.BACKUP_ENABLED === 'true';
  const strategy = process.env.BACKUP_STRATEGY || 'snapshot-template';
  const schedule = process.env.BACKUP_SCHEDULE || 'not-configured';

  return {
    backupStatus: enabled ? 'CONFIGURED' : 'NOT_CONFIGURED',
    policy: {
      enabled,
      strategy,
      schedule,
    },
  };
}
