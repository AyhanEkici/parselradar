export type SourceChainNode = {
  source: string;
  timestamp: string;
  status: string;
  freshnessState: string;
  governanceState: string;
  legalClassification: string;
};

export function sourceChainTracker(nodes: SourceChainNode[]) {
  return {
    chain: nodes,
    chainHash: Buffer.from(
      nodes
        .map((n) => `${n.source}|${n.timestamp}|${n.status}|${n.freshnessState}|${n.governanceState}|${n.legalClassification}`)
        .join('>')
    ).toString('base64'),
  };
}
