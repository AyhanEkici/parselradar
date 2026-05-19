import { SourceChainNode } from './sourceChainTracker';

export function evidenceLineageBuilder(input: {
  propertyId: string;
  runId: string;
  nodes: SourceChainNode[];
}) {
  return {
    propertyId: input.propertyId,
    runId: input.runId,
    lineage: input.nodes.map((node, idx) => ({
      step: idx + 1,
      source: node.source,
      observedAt: node.timestamp,
      status: node.status,
      governanceState: node.governanceState,
      legalClassification: node.legalClassification,
      freshnessState: node.freshnessState,
    })),
  };
}
