import { buildInsightBase } from './autonomyInsightTypes';

export function governedAutonomousScheduler(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  cadenceMinutes: number;
  suppression?: boolean;
}) {
  const base = buildInsightBase(input);
  if (input.suppression) {
    return { ...base, scheduled: false, action: 'SUPPRESSED', nextRunMinutes: 0 };
  }
  if (input.governanceState !== 'ALLOW') {
    return { ...base, scheduled: false, action: 'BLOCKED', nextRunMinutes: 0 };
  }
  const nextRunMinutes = Math.max(5, Math.min(720, Number(input.cadenceMinutes || 60)));
  return { ...base, scheduled: true, action: 'SCHEDULED', nextRunMinutes };
}
