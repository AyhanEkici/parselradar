export function infrastructureExpansionHistory(input: {
  source: string;
  timestamp: string;
  freshness: number;
  confidence: number;
  evidenceLineage: unknown[];
  governanceState: string;
  projects: Array<{ at: string; project: string; status: string; source: string }>;
}) {
  const projects = (input.projects || []).slice().sort((a, b) => a.at.localeCompare(b.at));
  const announcedOrActive = projects.filter((p) => ['announced', 'active', 'completed'].includes(String(p.status).toLowerCase())).length;

  return {
    source: input.source,
    timestamp: input.timestamp,
    freshness: input.freshness,
    confidence: input.confidence,
    evidenceLineage: input.evidenceLineage || [],
    governanceState: input.governanceState,
    infrastructureCertainty: input.confidence >= 75 ? 'MEDIUM' : 'LOW',
    direction: announcedOrActive >= 4 ? 'TRANSFORMING' : announcedOrActive >= 3 ? 'ACCELERATING' : announcedOrActive >= 2 ? 'DEVELOPING' : announcedOrActive >= 1 ? 'STATIC' : 'DECLINING',
    projects,
    noGuaranteeImplied: true,
    deterministic: true,
  };
}
