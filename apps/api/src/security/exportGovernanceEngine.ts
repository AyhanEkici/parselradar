import { ExportRisk } from './securityTypes';

export function exportGovernanceEngine(input: { recordCount: number; includesSensitiveFields: boolean; requesterIsAdmin: boolean }) {
  const exportRisk: ExportRisk =
    input.includesSensitiveFields && !input.requesterIsAdmin ? 'BLOCKED' :
    input.recordCount > 1000 ? 'RESTRICTED' :
    input.recordCount > 200 ? 'REVIEW' :
    'SAFE';

  return {
    exportRisk,
    allowed: exportRisk !== 'BLOCKED',
    requiresReview: exportRisk === 'REVIEW' || exportRisk === 'RESTRICTED',
  };
}
