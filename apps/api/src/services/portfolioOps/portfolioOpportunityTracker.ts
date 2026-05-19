import { buildInsightBase } from '../autonomy/autonomyInsightTypes';

export function portfolioOpportunityTracker(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  opportunities: Array<{ id: string; score: number }>;
}) {
  const base = buildInsightBase(input);
  const opportunities = (input.opportunities || []).slice().sort((a, b) => b.score - a.score);
  return { ...base, topOpportunities: opportunities.slice(0, 5), tracked: opportunities.length };
}
