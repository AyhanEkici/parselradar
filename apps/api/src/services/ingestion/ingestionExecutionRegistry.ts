import { ConnectorKeyV26 } from '../connectors/connectorCapabilityMatrix';

export type IngestionExecutionRecord = {
  connectorKey: ConnectorKeyV26;
  executionId: string;
  startedAt: string;
  finishedAt: string;
  status: 'SUCCESS' | 'SKIPPED' | 'FAILED';
  source: string;
  legalClassification: string;
  governanceState: string;
  freshnessState: string;
};

export function ingestionExecutionRegistry(records: IngestionExecutionRecord[]) {
  return {
    records,
    byStatus: {
      SUCCESS: records.filter((x) => x.status === 'SUCCESS').length,
      SKIPPED: records.filter((x) => x.status === 'SKIPPED').length,
      FAILED: records.filter((x) => x.status === 'FAILED').length,
    },
  };
}
