import { ProvenanceSource } from '../governance/governanceTypes';

export function buildEvidenceTrace(sources: ProvenanceSource[]) {
  return sources.map((source) => ({
    sourceKey: source.key,
    sourceLabel: source.label,
    verificationState: source.state,
    reliability: source.reliability,
    freshnessDays: source.freshnessDays,
    available: source.available,
    note: source.note || '',
  }));
}
