import { buildInsightBase } from '../autonomy/autonomyInsightTypes';

type QueueItem = { id: string; priorityScore: number };

export function investorPriorityQueue(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  governanceState: string;
  evidenceLineage: unknown[];
  items: QueueItem[];
}) {
  const base = buildInsightBase(input);
  const items = (input.items || []).slice().sort((a, b) => b.priorityScore - a.priorityScore);
  return { ...base, queueDepth: items.length, next: items.slice(0, 10) };
}
