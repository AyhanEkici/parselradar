import { buildInsightBase } from '../autonomy/autonomyInsightTypes';

export function governedAutoEscalationQueue(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  blocked: boolean;
  escalations: Array<{ id: string; severity: string }>;
}) {
  const base = buildInsightBase(input);
  if (input.blocked || input.governanceState !== 'ALLOW') {
    return { ...base, status: 'blocked', queueDepth: 0, items: [] as Array<{ id: string; severity: string }> };
  }
  return { ...base, status: 'active', queueDepth: (input.escalations || []).length, items: input.escalations || [] };
}
