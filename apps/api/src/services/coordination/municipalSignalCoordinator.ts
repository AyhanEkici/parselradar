import { buildExecutionInsightBase } from '../execution/executionInsightTypes';

export function municipalSignalCoordinator(input: { source: string; timestamp: string; freshness: number; confidence: number; governanceState: string; evidenceLineage: unknown[]; municipalSignalCount: number; certaintyLevel?: string; }) {
  return {
    ...buildExecutionInsightBase({ ...input }),
    municipalSignalCount: input.municipalSignalCount,
    certaintyLevel: input.certaintyLevel || 'UNVERIFIED',
    noFabricatedMunicipalityCertainty: true,
  };
}
