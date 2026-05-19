import { buildInsightBase } from '../autonomy/autonomyInsightTypes';

export function municipalShiftEscalation(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  shiftScore: number;
}) {
  const base = buildInsightBase(input);
  const escalation = input.shiftScore >= 80 ? 'CRITICAL' : input.shiftScore >= 60 ? 'HIGH_PRIORITY' : input.shiftScore >= 40 ? 'IMPORTANT' : 'NOTICE';
  return { ...base, escalation, noMunicipalityApprovalImplied: true };
}
