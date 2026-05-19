import { evidenceLineageBuilder } from './evidenceLineageBuilder';
import { sourceChainTracker, SourceChainNode } from './sourceChainTracker';

export function ingestionProvenanceEnvelope(input: {
  propertyId: string;
  runId: string;
  nodes: SourceChainNode[];
}) {
  const chain = sourceChainTracker(input.nodes);
  const lineage = evidenceLineageBuilder(input);

  return {
    propertyId: input.propertyId,
    runId: input.runId,
    sourceChain: chain.chain,
    sourceChainHash: chain.chainHash,
    lineage: lineage.lineage,
    provenanceAttached: input.nodes.length > 0,
  };
}
