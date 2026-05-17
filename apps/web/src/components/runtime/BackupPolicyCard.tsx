import React from 'react';

type Props = {
  backupStatus?: string;
  backupPolicy?: {
    enabled?: boolean;
    strategy?: string;
    schedule?: string;
  };
  retentionPolicy?: {
    logsDays?: number;
    metricsDays?: number;
    backupsDays?: number;
  };
};

export function BackupPolicyCard({ backupStatus, backupPolicy, retentionPolicy }: Props) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">Backup Policy</div>
      <div className="mt-2 text-xl font-bold text-amber-900">{backupStatus || 'NOT_CONFIGURED'}</div>
      <div className="mt-1 text-sm text-amber-900">Enabled: {backupPolicy?.enabled ? 'true' : 'false'}</div>
      <div className="mt-1 text-sm text-amber-900">Strategy: {backupPolicy?.strategy || '-'}</div>
      <div className="mt-1 text-sm text-amber-900">Schedule: {backupPolicy?.schedule || '-'}</div>
      <div className="mt-2 text-xs text-amber-700">
        Retention logs/metrics/backups: {retentionPolicy?.logsDays ?? '-'} / {retentionPolicy?.metricsDays ?? '-'} / {retentionPolicy?.backupsDays ?? '-'} days
      </div>
    </div>
  );
}
