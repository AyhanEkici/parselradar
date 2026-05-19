import { ProvenanceSource } from '../governance/governanceTypes';

export function buildReportEvidenceSummary(sources: ProvenanceSource[], evidenceStrength: string) {
  return {
    evidenceStrength,
    sourcesAvailable: sources.filter((s) => s.available).length,
    sourcesTotal: sources.length,
    verifiedSources: sources.filter((s) => s.state === 'verified').length,
    unavailableSources: sources.filter((s) => s.state === 'unavailable').map((s) => s.label),
  };
}
