import { buildInsightBase } from '../autonomy/autonomyInsightTypes';

export function investorOpsControlPanel(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  reviewQueueDepth: number;
  suppressionActive: boolean;
}) {
  const base = buildInsightBase(input);
  return {
    ...base,
    reviewQueueDepth: input.reviewQueueDepth,
    suppressionActive: input.suppressionActive,
    governedEscalationVisible: true,
    reviewQueueVisible: true,
    cadenceVisible: true,
    degradationVisible: true,
  };
}
