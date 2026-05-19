export function intelligenceSignalAssembler(input: {
  trendSignals?: string[];
  opportunitySignals?: string[];
  staleFlags?: string[];
  governanceClassification?: string;
}) {
  const signals = Array.from(
    new Set([
      ...(input.trendSignals || []),
      ...(input.opportunitySignals || []),
      ...(input.staleFlags || []).map((x) => `stale:${x}`),
      input.governanceClassification ? `governance:${input.governanceClassification}` : '',
    ].filter(Boolean))
  );

  return {
    signals,
    signalCount: signals.length,
  };
}
